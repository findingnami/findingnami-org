'use client'

import { useState, useRef } from 'react'
import { createPost } from '@/lib/actions/posts'
import type { PostWithMeta, PostAuthor } from '@/types/feed'

type Channel = { id: string; slug: string; name: string }
type UserProfile = PostAuthor & { id: string }

const DEFAULT_CHANNEL_SLUG = 'ask-the-community'
const MAX_CHARS = 2000
const COUNTER_THRESHOLD = 1500

export function PostComposer({
  channels,
  userProfile,
  onPostCreated,
}: {
  channels: Channel[]
  userProfile: UserProfile
  onPostCreated: (post: PostWithMeta) => void
}) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultChannel =
    channels.find((c) => c.slug === DEFAULT_CHANNEL_SLUG) ?? channels[0]
  const [selectedChannelId, setSelectedChannelId] = useState(defaultChannel?.id ?? '')

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedChannel = channels.find((c) => c.id === selectedChannelId)
  const isEmpty = content.trim().length === 0
  const isOver = content.length > MAX_CHARS

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value)
    if (error) setError(null)
    // Auto-resize
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }

  async function handleSubmit() {
    if (isEmpty || isOver || isSubmitting || !selectedChannelId) return
    setIsSubmitting(true)
    setError(null)

    // Optimistic post — uses a temp id replaced when realtime fires
    const optimisticPost: PostWithMeta = {
      id: `optimistic-${Date.now()}`,
      content: content.trim(),
      channel_id: selectedChannelId,
      parent_id: null,
      author_id: userProfile.id,
      is_pinned: false,
      created_at: new Date().toISOString(),
      author: {
        full_name: userProfile.full_name,
        avatar_url: userProfile.avatar_url,
        username: userProfile.username,
      },
      channel: {
        slug: selectedChannel?.slug ?? '',
        name: selectedChannel?.name ?? '',
      },
      like_count: 0,
      reply_count: 0,
      user_has_liked: false,
    }

    // Clear immediately for snappy UX
    setContent('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    onPostCreated(optimisticPost)

    const result = await createPost(optimisticPost.content, selectedChannelId)

    if (result.error) {
      setError(result.error)
      // Don't attempt to remove the optimistic post — realtime dedup handles it
    }

    setIsSubmitting(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex gap-3">
        {/* Avatar */}
        {userProfile.avatar_url ? (
          <img
            src={userProfile.avatar_url}
            alt={userProfile.full_name}
            className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5"
          />
        ) : (
          <ComposerAvatar name={userProfile.full_name} />
        )}

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
            placeholder="Share something with the community..."
            rows={2}
            className="w-full resize-none text-sm text-stone-900 placeholder-stone-400 outline-none border-none bg-transparent leading-relaxed"
          />

          {/* Controls row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <select
              value={selectedChannelId}
              onChange={(e) => setSelectedChannelId(e.target.value)}
              className="text-xs text-stone-500 border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-colors"
            >
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  #{ch.slug}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-3">
              {content.length >= COUNTER_THRESHOLD && (
                <span
                  className={`text-xs ${isOver ? 'text-red-500 font-semibold' : 'text-stone-400'}`}
                >
                  {MAX_CHARS - content.length}
                </span>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isEmpty || isOver || isSubmitting}
                className="bg-brand-orange text-white text-sm font-semibold px-4 py-1.5 rounded-xl hover:bg-orange-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  )
}

function ComposerAvatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 mt-0.5">
      <span className="text-brand-orange font-bold text-sm">{initials || '?'}</span>
    </div>
  )
}
