import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getEvents } from '@/lib/actions/events'
import { EventCard } from '@/components/events/EventCard'

export const metadata = { title: 'Events — Finding Nami' }

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const tab = searchParams.tab === 'past' ? 'past' : 'upcoming'

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const events = await getEvents(tab)

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Events</h1>
        <Link
          href="/events/new"
          className="px-4 py-2 bg-brand-orange text-white text-sm font-semibold rounded-xl hover:bg-brand-orange/90 transition-colors"
        >
          + Create event
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-stone-100 rounded-xl p-1 w-fit">
        <Link
          href="/events"
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'upcoming'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Upcoming
        </Link>
        <Link
          href="/events?tab=past"
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'past'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Past
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">{tab === 'upcoming' ? '📅' : '🗓️'}</div>
          <h3 className="text-lg font-semibold text-stone-900 mb-1">
            {tab === 'upcoming' ? 'No upcoming events' : 'No past events yet'}
          </h3>
          <p className="text-sm text-stone-400">
            {tab === 'upcoming'
              ? 'Be the first to host something for the community!'
              : 'Check back after your first events have passed.'}
          </p>
          {tab === 'upcoming' && (
            <Link
              href="/events/new"
              className="inline-block mt-5 px-5 py-2.5 bg-brand-orange text-white text-sm font-semibold rounded-xl hover:bg-brand-orange/90 transition-colors"
            >
              Create an event
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} isPast={tab === 'past'} />
          ))}
        </div>
      )}
    </main>
  )
}
