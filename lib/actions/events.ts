'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { EventDetail, EventAttendee, EventListItem } from '@/types/events'

type CreateEventData = {
  title: string
  description?: string | null
  starts_at: string    // UTC ISO string
  ends_at?: string | null // UTC ISO string
  max_seats?: number | null
  meeting_url?: string | null
  cover_url?: string | null
}

export async function createEvent(
  data: CreateEventData
): Promise<{ error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      title: data.title.trim(),
      description: data.description?.trim() || null,
      starts_at: data.starts_at,
      ends_at: data.ends_at || null,
      max_seats: data.max_seats || null,
      meeting_url: data.meeting_url?.trim() || null,
      cover_url: data.cover_url || null,
      host_id: user.id,
      is_online: true,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/events')
  redirect(`/events/${event.id}`)
}

export async function toggleRsvp(eventId: string): Promise<{
  newStatus: 'going' | 'waitlist' | null
  error?: string
}> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { newStatus: null, error: 'Not authenticated' }

  // Check existing RSVP
  const { data: existing } = await supabase
    .from('event_rsvps')
    .select('status')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id)
    revalidatePath('/events')
    revalidatePath(`/events/${eventId}`)
    return { newStatus: null }
  }

  // Determine status based on seat availability
  let status: 'going' | 'waitlist' = 'going'

  const { data: event } = await supabase
    .from('events')
    .select('max_seats')
    .eq('id', eventId)
    .single()

  if (event?.max_seats !== null && event?.max_seats !== undefined) {
    const { count } = await supabase
      .from('event_rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'going')

    if (count !== null && count >= event.max_seats) {
      status = 'waitlist'
    }
  }

  const { error } = await supabase.from('event_rsvps').insert({
    event_id: eventId,
    user_id: user.id,
    status,
  })

  if (error) return { newStatus: null, error: error.message }

  revalidatePath('/events')
  revalidatePath(`/events/${eventId}`)
  return { newStatus: status }
}

type RawEventListRow = {
  id: string
  title: string
  description: string | null
  starts_at: string
  ends_at: string | null
  is_online: boolean
  max_seats: number | null
  cover_url: string | null
  host: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

export async function getEvents(tab: 'upcoming' | 'past'): Promise<EventListItem[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const now = new Date().toISOString()

  const query = supabase
    .from('events')
    .select(
      'id, title, description, starts_at, ends_at, is_online, max_seats, cover_url,' +
        'host:profiles!events_host_id_fkey(id, full_name, avatar_url)'
    )

  const { data: rawEvents } =
    tab === 'upcoming'
      ? await query.gte('starts_at', now).order('starts_at', { ascending: true })
      : await query.lt('starts_at', now).order('starts_at', { ascending: false })

  if (!rawEvents?.length) return []

  const events = rawEvents as unknown as RawEventListRow[]
  const eventIds = events.map((e) => e.id)

  const [{ data: goingRsvps }, { data: userRsvps }] = await Promise.all([
    supabase
      .from('event_rsvps')
      .select('event_id')
      .in('event_id', eventIds)
      .eq('status', 'going'),
    supabase
      .from('event_rsvps')
      .select('event_id, status')
      .in('event_id', eventIds)
      .eq('user_id', user.id),
  ])

  const countMap = (goingRsvps ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.event_id] = (acc[r.event_id] ?? 0) + 1
    return acc
  }, {})

  const userRsvpMap = (userRsvps ?? []).reduce<Record<string, 'going' | 'waitlist'>>((acc, r) => {
    acc[r.event_id] = r.status as 'going' | 'waitlist'
    return acc
  }, {})

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    starts_at: e.starts_at,
    ends_at: e.ends_at,
    is_online: e.is_online,
    max_seats: e.max_seats,
    cover_url: e.cover_url,
    host: e.host,
    rsvp_count: countMap[e.id] ?? 0,
    user_rsvp_status: userRsvpMap[e.id] ?? null,
  }))
}

// Raw join shape returned by Supabase for the event detail query
type RawEventDetail = {
  id: string
  title: string
  description: string | null
  host_id: string | null
  starts_at: string
  ends_at: string | null
  is_online: boolean
  meeting_url: string | null
  max_seats: number | null
  cover_url: string | null
  created_at: string
  host: {
    id: string
    full_name: string
    avatar_url: string | null
    username: string
    bio: string | null
  } | null
}

type RawRsvpRow = {
  user_id: string
  status: 'going' | 'waitlist'
  profiles: {
    full_name: string
    avatar_url: string | null
    username: string
    remote_goal: string | null
  } | null
}

export async function getEventWithDetails(eventId: string): Promise<EventDetail | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: rawEvent }, { data: rawRsvps }] = await Promise.all([
    supabase
      .from('events')
      .select(
        'id, title, description, host_id, starts_at, ends_at, is_online, meeting_url, max_seats, cover_url, created_at,' +
          'host:profiles!events_host_id_fkey(id, full_name, avatar_url, username, bio)'
      )
      .eq('id', eventId)
      .single(),
    supabase
      .from('event_rsvps')
      .select('user_id, status, profiles(full_name, avatar_url, username, remote_goal)')
      .eq('event_id', eventId),
  ])

  if (!rawEvent) return null

  const event = rawEvent as unknown as RawEventDetail
  const rsvps = (rawRsvps ?? []) as unknown as RawRsvpRow[]

  const attendees: EventAttendee[] = rsvps
    .filter((r) => r.profiles !== null)
    .map((r) => ({
      user_id: r.user_id,
      status: r.status,
      profile: r.profiles!,
    }))

  const userRsvp = rsvps.find((r) => r.user_id === user.id)
  const goingCount = rsvps.filter((r) => r.status === 'going').length

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    host_id: event.host_id,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    is_online: event.is_online,
    meeting_url: event.meeting_url,
    max_seats: event.max_seats,
    cover_url: event.cover_url,
    created_at: event.created_at,
    host: event.host,
    attendees,
    user_rsvp: userRsvp ? { status: userRsvp.status } : null,
    going_count: goingCount,
  }
}
