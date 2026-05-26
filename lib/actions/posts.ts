'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { PostWithMeta, RawPostRow } from '@/types/feed'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Shared helper — fetches posts with author/channel joins, enriches with counts.
// Called from the feed page server component AND fetchMorePosts server action.
export async function fetchPostsWithMeta(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: {
    channelId?: string | null
    authorId?: string | null
    cursor?: string // created_at of the last loaded post
    limit?: number
  }
): Promise<PostWithMeta[]> {
  const limit = options.limit ?? 20

  let query = supabase
    .from('posts')
    .select(
      'id, content, channel_id, parent_id, author_id, is_pinned, created_at,' +
        'author:profiles!posts_author_id_fkey(full_name, avatar_url, username),' +
        'channel:channels!posts_channel_id_fkey(slug, name)'
    )
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (options.channelId) {
    query = query.eq('channel_id', options.channelId)
  }
  if (options.authorId) {
    query = query.eq('author_id', options.authorId)
  }
  if (options.cursor) {
    query = query.lt('created_at', options.cursor)
  }

  const { data: rawPosts } = await query
  if (!rawPosts || rawPosts.length === 0) return []

  const posts = rawPosts as unknown as RawPostRow[]
  const postIds = posts.map((p) => p.id)

  const [{ data: likesRows }, { data: userLikesRows }, { data: repliesRows }] = await Promise.all([
    supabase.from('post_likes').select('post_id').in('post_id', postIds),
    supabase.from('post_likes').select('post_id').in('post_id', postIds).eq('user_id', userId),
    supabase.from('posts').select('parent_id').in('parent_id', postIds),
  ])

  const likeCountMap = new Map<string, number>()
  likesRows?.forEach((r) => {
    likeCountMap.set(r.post_id, (likeCountMap.get(r.post_id) ?? 0) + 1)
  })

  const userLikedSet = new Set(userLikesRows?.map((r) => r.post_id) ?? [])

  const replyCountMap = new Map<string, number>()
  repliesRows?.forEach((r) => {
    if (r.parent_id) {
      replyCountMap.set(r.parent_id, (replyCountMap.get(r.parent_id) ?? 0) + 1)
    }
  })

  return posts
    .filter((p) => p.author !== null && p.channel !== null)
    .map((p) => ({
      id: p.id,
      content: p.content,
      channel_id: p.channel_id,
      parent_id: p.parent_id,
      author_id: p.author_id,
      is_pinned: p.is_pinned,
      created_at: p.created_at,
      author: p.author!,
      channel: p.channel!,
      like_count: likeCountMap.get(p.id) ?? 0,
      reply_count: replyCountMap.get(p.id) ?? 0,
      user_has_liked: userLikedSet.has(p.id),
    }))
}

export async function createPost(
  content: string,
  channelId: string
): Promise<{ id?: string; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('posts')
    .insert({ content: content.trim(), channel_id: channelId, author_id: user.id })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/feed')
  return { id: data.id }
}

export async function deletePost(postId: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user.id) // RLS also enforces this; belt-and-suspenders

  if (error) return { error: error.message }
  revalidatePath('/feed')
  return {}
}

export async function createReply(
  content: string,
  parentId: string,
  channelId: string
): Promise<{ id?: string; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      content: content.trim(),
      channel_id: channelId,
      parent_id: parentId,
      author_id: user.id,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/feed')
  return { id: data.id }
}

export async function toggleLike(postId: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check if like already exists
  const { data: existing } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: user.id })
    if (error) return { error: error.message }
  }

  revalidatePath('/feed')
  return {}
}

export async function fetchMorePosts(
  cursor: string,
  channelId: string | null,
  authorId?: string | null
): Promise<{ posts: PostWithMeta[]; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { posts: [], error: 'Not authenticated' }

  const posts = await fetchPostsWithMeta(supabase, user.id, { channelId, authorId, cursor })
  return { posts }
}

// Fetch replies for a post — used by ReplyThread client component via a server action
export async function fetchReplies(
  parentId: string
): Promise<{ replies: RawPostRow[]; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, content, channel_id, parent_id, author_id, is_pinned, created_at,' +
        'author:profiles!posts_author_id_fkey(full_name, avatar_url, username),' +
        'channel:channels!posts_channel_id_fkey(slug, name)'
    )
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true })

  if (error) return { replies: [], error: error.message }
  return { replies: (data as unknown as RawPostRow[]) ?? [] }
}
