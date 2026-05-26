'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createEvent } from '@/lib/actions/events'
import { phtToISO, nextFullHourPHT } from '@/lib/utils'

const INPUT =
  'w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors'
const LABEL = 'block text-sm font-medium text-stone-700 mb-1.5'

export function CreateEventForm() {
  const defaultStart = nextFullHourPHT()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startsAt, setStartsAt] = useState(defaultStart)
  const [endsAt, setEndsAt] = useState('')
  const [maxSeats, setMaxSeats] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let cover_url: string | null = null

    if (coverFile) {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const ext = coverFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('event-covers')
          .upload(path, coverFile, { upsert: true })
        if (uploadError) {
          setError('Failed to upload cover image. Please try again.')
          setLoading(false)
          return
        }
        const { data } = supabase.storage.from('event-covers').getPublicUrl(path)
        cover_url = data.publicUrl
      }
    }

    const result = await createEvent({
      title,
      description: description || null,
      starts_at: phtToISO(startsAt),
      ends_at: endsAt ? phtToISO(endsAt) : null,
      max_seats: maxSeats ? parseInt(maxSeats, 10) : null,
      meeting_url: meetingUrl || null,
      cover_url,
    })

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div>
        <label className={LABEL}>
          Event title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Freelancing 101: Getting Your First Client"
          required
          maxLength={120}
          className={INPUT}
        />
      </div>

      <div>
        <label className={LABEL}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What will this event cover? Who should attend?"
          rows={4}
          maxLength={2000}
          className={`${INPUT} resize-none`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>
            Starts <span className="text-red-400">*</span>
          </label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            className={INPUT}
          />
          <p className="text-xs text-stone-400 mt-1">Philippine Time (PHT)</p>
        </div>
        <div>
          <label className={LABEL}>Ends</label>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            min={startsAt}
            className={INPUT}
          />
          <p className="text-xs text-stone-400 mt-1">Philippine Time (PHT)</p>
        </div>
      </div>

      <div>
        <label className={LABEL}>Meeting URL</label>
        <input
          type="url"
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
          placeholder="https://zoom.us/j/..."
          className={INPUT}
        />
        <p className="text-xs text-stone-400 mt-1">
          Shown to RSVPed attendees 24 hours before the event
        </p>
      </div>

      <div>
        <label className={LABEL}>Max seats</label>
        <input
          type="number"
          value={maxSeats}
          onChange={(e) => setMaxSeats(e.target.value)}
          placeholder="Leave blank for unlimited"
          min={1}
          max={9999}
          className={INPUT}
        />
      </div>

      <div>
        <label className={LABEL}>Cover image</label>
        {coverPreview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPreview}
              alt="Cover preview"
              className="w-full h-40 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={() => {
                setCoverFile(null)
                setCoverPreview(null)
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-sm flex items-center justify-center hover:bg-black/70"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-32 rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-brand-orange/40 hover:text-brand-orange transition-colors"
          >
            <span className="text-2xl">📸</span>
            <span className="text-sm">Click to upload a cover image</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !title.trim() || !startsAt}
        className="w-full py-3 rounded-xl bg-brand-orange text-white font-semibold text-sm hover:bg-brand-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating event…' : 'Create event'}
      </button>
    </form>
  )
}
