'use client'

import { useState } from 'react'
import type { EventAttendee } from '@/types/events'

const GOAL_LABELS: Record<string, string> = {
  exploring: 'Exploring remote work',
  'job-hunting': 'Job hunting remotely',
  freelancing: 'Freelancing',
  'already-remote': 'Already remote',
  'negotiating-wfh': 'Negotiating WFH',
}

type Props = {
  attendees: EventAttendee[]
  goingCount: number
}

function AttendeeAvatar({ profile }: { profile: EventAttendee['profile'] }) {
  if (profile.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt={profile.full_name}
        className="w-9 h-9 rounded-full object-cover border-2 border-white"
      />
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-brand-orange/20 flex items-center justify-center border-2 border-white shrink-0">
      <span className="text-brand-orange text-sm font-bold">
        {profile.full_name[0]?.toUpperCase()}
      </span>
    </div>
  )
}

export function AttendeesSection({ attendees, goingCount }: Props) {
  const [open, setOpen] = useState(false)
  const going = attendees.filter((a) => a.status === 'going')
  const visible = going.slice(0, 8)
  const overflow = going.length - 8

  if (going.length === 0) {
    return (
      <p className="text-sm text-stone-400">No one has RSVPed yet. Be the first!</p>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2.5">
          {visible.map((a) => (
            <div key={a.user_id} title={a.profile.full_name}>
              <AttendeeAvatar profile={a.profile} />
            </div>
          ))}
        </div>
        {overflow > 0 && (
          <span className="text-sm text-stone-500">+{overflow} more</span>
        )}
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-brand-orange hover:underline ml-1"
        >
          See all
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h3 className="font-semibold text-stone-900">
                Who&apos;s going ({goingCount})
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {going.map((a) => (
                <div key={a.user_id} className="flex items-center gap-3">
                  <AttendeeAvatar profile={a.profile} />
                  <div>
                    <p className="text-sm font-medium text-stone-900">{a.profile.full_name}</p>
                    <p className="text-xs text-stone-400">@{a.profile.username}</p>
                    {a.profile.remote_goal && (
                      <span className="inline-block mt-0.5 text-xs bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">
                        {GOAL_LABELS[a.profile.remote_goal] ?? a.profile.remote_goal}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
