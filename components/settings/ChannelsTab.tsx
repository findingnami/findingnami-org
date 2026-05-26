'use client'

import { useState } from 'react'
import { toggleChannelFollow } from '@/lib/actions/settings'

type Channel = { id: string; slug: string; name: string; description: string | null }

export function ChannelsTab({
  channels,
  initialFollowedIds,
}: {
  channels: Channel[]
  initialFollowedIds: string[]
}) {
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set(initialFollowedIds))
  const [toggling, setToggling] = useState<Set<string>>(new Set())

  async function handleToggle(channelId: string) {
    if (toggling.has(channelId)) return
    setToggling((prev) => new Set(Array.from(prev).concat(channelId)))

    // Optimistic update
    setFollowedIds((prev) => {
      const next = new Set(prev)
      if (next.has(channelId)) {
        next.delete(channelId)
      } else {
        next.add(channelId)
      }
      return next
    })

    await toggleChannelFollow(channelId)
    setToggling((prev) => {
      const next = new Set(prev)
      next.delete(channelId)
      return next
    })
  }

  return (
    <div>
      <p className="text-sm text-stone-500 mb-5 leading-relaxed">
        Follow channels to get notified when new posts are shared there. You can change these any
        time.
      </p>

      <div className="space-y-2">
        {channels.map((ch) => {
          const isFollowed = followedIds.has(ch.id)
          const isBusy = toggling.has(ch.id)

          return (
            <div
              key={ch.id}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-colors ${
                isFollowed
                  ? 'bg-brand-orange/5 border-brand-orange/30'
                  : 'bg-white border-gray-100'
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-800">#{ch.slug}</p>
                {ch.description && (
                  <p className="text-xs text-stone-400 mt-0.5 truncate">{ch.description}</p>
                )}
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isFollowed}
                onClick={() => handleToggle(ch.id)}
                disabled={isBusy}
                className={`relative shrink-0 ml-4 w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange disabled:opacity-60 ${
                  isFollowed ? 'bg-brand-orange' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    isFollowed ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-stone-400 mt-5">
        {followedIds.size} of {channels.length} channels followed
      </p>
    </div>
  )
}
