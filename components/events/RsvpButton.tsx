'use client'

import { useState } from 'react'
import { toggleRsvp } from '@/lib/actions/events'

type Props = {
  eventId: string
  initialStatus: 'going' | 'waitlist' | null
  isPast: boolean
  maxSeats: number | null
  goingCount: number
}

export function RsvpButton({ eventId, initialStatus, isPast, maxSeats, goingCount }: Props) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState(false)

  const isFull = maxSeats !== null && goingCount >= maxSeats && status !== 'going'

  if (isPast) {
    return (
      <div className="w-full py-2.5 px-4 text-sm text-center rounded-xl bg-stone-100 text-stone-400 cursor-not-allowed font-medium">
        Event ended
      </div>
    )
  }

  async function handleClick() {
    if (loading) return
    const prevStatus = status
    setStatus(status === null ? (isFull ? 'waitlist' : 'going') : null)
    setLoading(true)
    const result = await toggleRsvp(eventId)
    setLoading(false)
    if (result.error) {
      setStatus(prevStatus)
    } else {
      setStatus(result.newStatus)
    }
  }

  if (status === 'going') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full py-2.5 px-4 text-sm text-center rounded-xl font-semibold transition-colors disabled:opacity-60 bg-brand-orange text-white hover:bg-red-500"
      >
        {hovered ? 'Cancel RSVP' : 'Going ✓'}
      </button>
    )
  }

  if (status === 'waitlist') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full py-2.5 px-4 text-sm text-center rounded-xl font-semibold transition-colors disabled:opacity-60 border-2 border-brand-orange text-brand-orange hover:border-red-500 hover:text-red-500"
      >
        {hovered ? 'Leave waitlist' : 'On waitlist'}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full py-2.5 px-4 text-sm text-center rounded-xl font-semibold transition-colors disabled:opacity-60 ${
        isFull
          ? 'border-2 border-brand-orange text-brand-orange hover:bg-brand-orange/5'
          : 'bg-brand-orange text-white hover:bg-brand-orange/90'
      }`}
    >
      {loading ? '…' : isFull ? 'Join waitlist' : 'RSVP'}
    </button>
  )
}
