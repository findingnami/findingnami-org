import Link from 'next/link'
import { CreateEventForm } from '@/components/events/CreateEventForm'

export default function NewEventPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-6"
      >
        ← Back to events
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Create an event</h1>
        <p className="text-sm text-stone-500 mt-1">
          Host a workshop, webinar, or Q&amp;A for the Finding Nami community
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <CreateEventForm />
      </div>
    </main>
  )
}
