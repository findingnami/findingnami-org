'use server'

import { createClient } from '@/lib/supabase/server'
import type { MemberListItem, MemberProfile, RecentPost, UpcomingEvent } from '@/types/members'

export type GetMembersOptions = {
  goal?: string | null
  industry?: string | null
  stage?: string | null
  q?: string | null
  cursor?: string | null
  limit?: number
}

type RawPostRow = {
  id: string
  content: string
  created_at: string
  channel: { slug: string; name: string } | null
}

type RawEventRow = {
  id: string
  title: string
  starts_at: string
}

export async function getMembers(
  options: GetMembersOptions
): Promise<{ members: MemberListItem[]; hasMore: boolean }> {
  const supabase = createClient()
  const { goal, industry, stage, q, cursor, limit = 24 } = options

  let query = supabase
    .from('profiles')
    .select(
      'id, full_name, avatar_url, username, industry, career_stage, remote_goal, is_mentor, created_at'
    )
    .not('industry', 'is', null)
    .not('full_name', 'is', null)

  if (goal)
    query = query.eq(
      'remote_goal',
      goal as 'negotiating-wfh' | 'exploring' | 'job-hunting' | 'freelancing' | 'already-remote'
    )
  if (industry) query = query.eq('industry', industry)
  if (stage)
    query = query.eq('career_stage', stage as 'early' | 'mid' | 'senior' | 'exec')
  if (q) query = query.ilike('full_name', `%${q}%`)
  if (cursor) query = query.lt('created_at', cursor)

  query = query.order('created_at', { ascending: false }).limit(limit + 1)

  const { data } = await query
  if (!data?.length) return { members: [], hasMore: false }

  const hasMore = data.length > limit
  return {
    members: (hasMore ? data.slice(0, limit) : data) as unknown as MemberListItem[],
    hasMore,
  }
}

export async function getMemberCount(): Promise<number> {
  const supabase = createClient()
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('industry', 'is', null)
    .not('full_name', 'is', null)
  return count ?? 0
}

export async function getMemberProfile(id: string): Promise<MemberProfile | null> {
  const supabase = createClient()
  const now = new Date().toISOString()

  const [
    { data: profile },
    { data: rawPosts },
    { count: postCount },
    { data: rawEvents },
    { count: eventCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase
      .from('posts')
      .select('id, content, created_at, channel:channels!posts_channel_id_fkey(slug, name)')
      .eq('author_id', id)
      .is('parent_id', null)
      .is('circle_id', null)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', id)
      .is('parent_id', null)
      .is('circle_id', null),
    supabase
      .from('events')
      .select('id, title, starts_at')
      .eq('host_id', id)
      .gte('starts_at', now)
      .order('starts_at', { ascending: true })
      .limit(2),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('host_id', id),
  ])

  if (!profile) return null

  const recent_posts: RecentPost[] = ((rawPosts ?? []) as unknown as RawPostRow[]).map((p) => ({
    id: p.id,
    content: p.content,
    created_at: p.created_at,
    channel: p.channel,
  }))

  const upcoming_events: UpcomingEvent[] = ((rawEvents ?? []) as unknown as RawEventRow[]).map(
    (e) => ({ id: e.id, title: e.title, starts_at: e.starts_at })
  )

  return {
    ...profile,
    recent_posts,
    upcoming_events,
    post_count: postCount ?? 0,
    event_count: eventCount ?? 0,
  }
}
