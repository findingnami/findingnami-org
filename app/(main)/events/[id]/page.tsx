import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventWithDetails } from '@/lib/actions/events'
import { formatEventDate, formatEventTime } from '@/lib/utils'
import { RsvpButton } from '@/components/events/RsvpButton'
import { AttendeesSection } from '@/components/events/AttendeesSection'
import type { EventDetail } from '@/types/events'

function showMeetingUrl(event: EventDetail): boolean {
  if (!event.meeting_url) return false
  if (event.user_rsvp?.status !== 'going') return false
  const hoursUntil = (new Date(event.starts_at).getTime() - Date.now()) / (1000 * 60 * 60)
  return hoursUntil <= 24
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await getEventWithDetails(params.id)
  if (!event) notFound()

  const isPast = new Date(event.starts_at) < new Date()
  const meetingVisible = showMeetingUrl(event)
  const seatsLeft =
    event.max_seats !== null ? Math.max(0, event.max_seats - event.going_count) : null

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-6"
      >
        ← Back to events
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: content */}
        <div className="flex-1 min-w-0">
          {event.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.cover_url}
              alt={event.title}
              className="w-full h-60 sm:h-72 object-cover rounded-2xl mb-6"
            />
          ) : (
            <div className="w-full h-60 sm:h-72 rounded-2xl mb-6 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
              <span className="text-7xl opacity-40">📅</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-4">
            {event.title}
          </h1>

          {/* Date */}
          <div className="flex items-start gap-3 mb-4">
            <span className="text-xl mt-0.5 shrink-0">🗓</span>
            <div>
              <p className="text-stone-700 font-medium">{formatEventDate(event.starts_at)}</p>
              {event.ends_at && (
                <p className="text-sm text-stone-400 mt-0.5">
                  Ends at {formatEventTime(event.ends_at)}
                </p>
              )}
            </div>
          </div>

          {/* Host */}
          {event.host && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-stone-400">Hosted by</span>
              {event.host.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.host.avatar_url}
                  alt={event.host.full_name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0">
                  <span className="text-brand-orange text-xs font-bold">
                    {event.host.full_name[0]}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-stone-700">{event.host.full_name}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap mb-8">
              {event.description}
            </p>
          )}

          {/* Meeting URL */}
          {event.meeting_url && (
            <div className="mb-8 p-4 rounded-2xl border border-stone-100 bg-stone-50">
              <p className="text-sm font-medium text-stone-700 mb-1.5">📹 Meeting link</p>
              {meetingVisible ? (
                <a
                  href={event.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-orange hover:underline break-all"
                >
                  {event.meeting_url}
                </a>
              ) : (
                <p className="text-sm text-stone-400 italic">
                  {event.user_rsvp?.status === 'going'
                    ? 'Link will be visible 24 hours before the event starts.'
                    : 'RSVP to see the meeting link.'}
                </p>
              )}
            </div>
          )}

          {/* Attendees */}
          <div>
            <h2 className="text-base font-semibold text-stone-900 mb-3">
              Who&apos;s going{event.going_count > 0 ? ` (${event.going_count})` : ''}
            </h2>
            <AttendeesSection attendees={event.attendees} goingCount={event.going_count} />
          </div>
        </div>

        {/* Right: sticky RSVP card */}
        <div className="lg:w-72 shrink-0">
          <div className="sticky top-8 bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 className="font-semibold text-stone-900 mb-1">
              {isPast ? 'Event ended' : 'Join this event'}
            </h3>
            <p className="text-sm text-stone-500 mb-4">{formatEventDate(event.starts_at)}</p>

            {event.max_seats !== null && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                  <span>{event.going_count} going</span>
                  <span>{seatsLeft} seats left</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-orange rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (event.going_count / event.max_seats) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <RsvpButton
              eventId={event.id}
              initialStatus={event.user_rsvp?.status ?? null}
              isPast={isPast}
              maxSeats={event.max_seats}
              goingCount={event.going_count}
            />

            {!isPast && event.user_rsvp?.status === 'going' && event.meeting_url && !meetingVisible && (
              <p className="text-xs text-stone-400 mt-2 text-center">
                Meeting link unlocks 24h before start
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
