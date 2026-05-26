import Link from 'next/link'
import { formatEventDate } from '@/lib/utils'
import { RsvpButton } from './RsvpButton'
import type { EventListItem } from '@/types/events'

const GRADIENTS = [
  'from-orange-200 to-amber-100',
  'from-green-200 to-teal-100',
  'from-purple-200 to-pink-100',
  'from-sky-200 to-blue-100',
  'from-rose-200 to-orange-100',
]

function gradientFor(id: string) {
  const hash = id.charCodeAt(0) + (id.charCodeAt(1) || 0)
  return GRADIENTS[hash % GRADIENTS.length]
}

type Props = {
  event: EventListItem
  isPast?: boolean
}

export function EventCard({ event, isPast = false }: Props) {
  const seatsLabel = event.max_seats
    ? `${event.rsvp_count} / ${event.max_seats} going`
    : `${event.rsvp_count} going`

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <Link href={`/events/${event.id}`} className="block shrink-0">
        {event.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.cover_url}
            alt={event.title}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div
            className={`w-full h-40 bg-gradient-to-br ${gradientFor(event.id)} flex items-center justify-center`}
          >
            <span className="text-4xl opacity-50">📅</span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/events/${event.id}`}>
          <h3 className="font-semibold text-stone-900 text-base leading-snug hover:text-brand-orange transition-colors line-clamp-2">
            {event.title}
          </h3>
        </Link>

        <p className="text-xs text-stone-500 mt-1.5">{formatEventDate(event.starts_at)}</p>

        {event.host && (
          <div className="flex items-center gap-1.5 mt-2.5">
            {event.host.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.host.avatar_url}
                alt={event.host.full_name}
                className="w-5 h-5 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0">
                <span className="text-brand-orange text-xs font-bold">
                  {event.host.full_name[0]}
                </span>
              </div>
            )}
            <span className="text-xs text-stone-500 truncate">{event.host.full_name}</span>
          </div>
        )}

        <p className="text-xs text-stone-400 mt-1.5">{seatsLabel}</p>

        <div className="mt-auto pt-3">
          <RsvpButton
            eventId={event.id}
            initialStatus={event.user_rsvp_status}
            isPast={isPast}
            maxSeats={event.max_seats}
            goingCount={event.rsvp_count}
          />
        </div>
      </div>
    </div>
  )
}
