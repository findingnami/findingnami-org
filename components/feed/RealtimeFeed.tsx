'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchMorePosts } from '@/lib/actions/posts'
import { PostComposer } from './PostComposer'
import { PostCard } from './PostCard'
import type { PostWithMeta, PostAuthor } from '@/types/feed'
import type { Tables } from '@/types/supabase'

type Channel = { id: string; slug: string; name: string }
type UserProfile = PostAuthor & { id: string }

// Raw shape returned by Supabase realtime + a follow-up profile join
type RealtimePostRow = Tables<'posts'> & {
  author?: PostAuthor | null
  channel?: { slug: string; name: string } | null
}

const SCROLL_THRESHOLD = 200

export function RealtimeFeed({
  initialPosts,
  channelId,
  channelSlug,
  channels,
  userProfile,
}: {
  initialPosts: PostWithMeta[]
  channelId: string | null
  channelSlug: string | null
  channels: Channel[]
  userProfile: UserProfile
}) {
  const [posts, setPosts] = useState<PostWithMeta[]>(initialPosts)
  const [pendingPosts, setPendingPosts] = useState<PostWithMeta[]>([])
  const [isScrolledDown, setIsScrolledDown] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length === 20)
  const supabase = createClient()

  // Fetch a single post with all meta after a realtime INSERT
  const hydratePost = useCallback(
    async (raw: Tables<'posts'>): Promise<PostWithMeta | null> => {
      // Use anon-key browser client — RLS still enforced, only for realtime hydration
      const { data } = await supabase
        .from('posts')
        .select(
          'id, content, channel_id, parent_id, author_id, is_pinned, created_at,' +
            'author:profiles!posts_author_id_fkey(full_name, avatar_url, username),' +
            'channel:channels!posts_channel_id_fkey(slug, name)'
        )
        .eq('id', raw.id)
        .single()

      if (!data) return null
      const d = data as unknown as RealtimePostRow
      if (!d.author || !d.channel) return null

      return {
        id: d.id,
        content: d.content,
        channel_id: d.channel_id!,
        parent_id: d.parent_id ?? null,
        author_id: d.author_id,
        is_pinned: d.is_pinned,
        created_at: d.created_at,
        author: d.author,
        channel: d.channel,
        like_count: 0,
        reply_count: 0,
        user_has_liked: false,
      }
    },
    [supabase]
  )

  // Scroll tracking for the "new posts" pill
  useEffect(() => {
    function onScroll() {
      setIsScrolledDown(window.scrollY > SCROLL_THRESHOLD)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('feed:posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async (payload) => {
          const raw = payload.new as Tables<'posts'>

          // Skip replies
          if (raw.parent_id !== null) return
          // Skip if channel filter active and this post is for a different channel
          if (channelId && raw.channel_id !== channelId) return

          const hydrated = await hydratePost(raw)
          if (!hydrated) return

          // Dedup: skip if an optimistic post with the same content+author exists
          const isDup = posts.some(
            (p) =>
              p.author_id === hydrated.author_id &&
              p.content === hydrated.content &&
              Math.abs(new Date(p.created_at).getTime() - new Date(hydrated.created_at).getTime()) <
                10_000
          )
          if (isDup) {
            // Replace optimistic with real post (same position)
            setPosts((prev) =>
              prev.map((p) =>
                p.author_id === hydrated.author_id &&
                p.content === hydrated.content &&
                p.id.startsWith('optimistic-')
                  ? hydrated
                  : p
              )
            )
            return
          }

          if (isScrolledDown) {
            setPendingPosts((prev) => [hydrated, ...prev])
          } else {
            setPosts((prev) => [hydrated, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, isScrolledDown, hydratePost])

  function flushPendingPosts() {
    setPosts((prev) => [...pendingPosts, ...prev])
    setPendingPosts([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleLoadMore() {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    const cursor = posts[posts.length - 1]?.created_at
    if (!cursor) {
      setIsLoadingMore(false)
      return
    }
    const { posts: more } = await fetchMorePosts(cursor, channelId)
    setPosts((prev) => [...prev, ...more])
    setHasMore(more.length === 20)
    setIsLoadingMore(false)
  }

  return (
    <div className="space-y-4">
      {/* Post composer */}
      <PostComposer
        channels={channels}
        userProfile={userProfile}
        onPostCreated={(post) => setPosts((prev) => [post, ...prev])}
      />

      {/* "New posts" pill */}
      {pendingPosts.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={flushPendingPosts}
            className="bg-stone-800 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-stone-700 transition-colors animate-bounce"
          >
            ↑ {pendingPosts.length} new {pendingPosts.length === 1 ? 'post' : 'posts'}
          </button>
        </div>
      )}

      {/* Post list */}
      {posts.length === 0 ? (
        <EmptyFeed channelSlug={channelSlug} />
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={userProfile.id}
              onDeleted={() => setPosts((prev) => prev.filter((p) => p.id !== post.id))}
            />
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="text-sm text-stone-500 hover:text-stone-700 font-medium px-6 py-2.5 rounded-xl border border-gray-200 hover:border-stone-300 transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? 'Loading…' : 'Load more posts'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EmptyFeed({ channelSlug }: { channelSlug: string | null }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center">
      {/* Wave illustration — CSS only */}
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full bg-brand-orange/10" />
        <div className="absolute inset-3 rounded-full bg-brand-orange/15" />
        <div className="absolute inset-6 rounded-full bg-brand-orange/20 flex items-center justify-center">
          <span className="text-2xl">🌊</span>
        </div>
      </div>
      <p className="text-stone-700 font-semibold text-base mb-2">
        {channelSlug
          ? `Nothing here yet`
          : 'Be the first to post!'}
      </p>
      <p className="text-stone-400 text-sm max-w-xs leading-relaxed">
        {channelSlug
          ? `Be the first to start the conversation in #${channelSlug}.`
          : 'Share a win, ask a question, or say hi in #introductions.'}
      </p>
    </div>
  )
}
