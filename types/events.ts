import type { Tables } from './supabase'

export type EventHost = {
  id: string
  full_name: string
  avatar_url: string | null
  username: string
  bio: string | null
}

export type EventAttendee = {
  user_id: string
  status: 'going' | 'waitlist'
  profile: {
    full_name: string
    avatar_url: string | null
    username: string
    remote_goal: string | null
  }
}

// Shape used on the events list page (enriched with RSVP count)
export type EventListItem = Pick<
  Tables<'events'>,
  'id' | 'title' | 'description' | 'starts_at' | 'ends_at' | 'is_online' | 'max_seats' | 'cover_url'
> & {
  host: Pick<EventHost, 'id' | 'full_name' | 'avatar_url'> | null
  rsvp_count: number
  user_rsvp_status: 'going' | 'waitlist' | null
}

// Shape used on the event detail page
export type EventDetail = Tables<'events'> & {
  host: EventHost | null
  attendees: EventAttendee[]
  user_rsvp: { status: 'going' | 'waitlist' } | null
  going_count: number
}
