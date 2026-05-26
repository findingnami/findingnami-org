import type { Tables } from './supabase'

export type MemberListItem = Pick<
  Tables<'profiles'>,
  | 'id'
  | 'full_name'
  | 'avatar_url'
  | 'username'
  | 'industry'
  | 'career_stage'
  | 'remote_goal'
  | 'is_mentor'
  | 'created_at'
>

export type RecentPost = {
  id: string
  content: string
  created_at: string
  channel: { slug: string; name: string } | null
}

export type UpcomingEvent = {
  id: string
  title: string
  starts_at: string
}

export type MemberProfile = Tables<'profiles'> & {
  recent_posts: RecentPost[]
  upcoming_events: UpcomingEvent[]
  post_count: number
  event_count: number
}
