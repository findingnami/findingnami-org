import type { Tables } from './supabase'

export type PostAuthor = Pick<
  Tables<'profiles'>,
  'full_name' | 'avatar_url' | 'username'
>

export type PostChannel = Pick<Tables<'channels'>, 'slug' | 'name'>

export type PostWithMeta = {
  id: string
  content: string
  channel_id: string
  parent_id: string | null
  author_id: string
  is_pinned: boolean
  created_at: string
  author: PostAuthor
  channel: PostChannel
  like_count: number
  reply_count: number
  user_has_liked: boolean
}

// Shape of the raw Supabase join result before we enrich with counts
export type RawPostRow = {
  id: string
  content: string
  channel_id: string
  parent_id: string | null
  author_id: string
  is_pinned: boolean
  created_at: string
  author: PostAuthor | null
  channel: PostChannel | null
}
