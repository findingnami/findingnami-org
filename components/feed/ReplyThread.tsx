'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createReply, fetchReplies } from '@/lib/actions/posts'
import { timeAgo } from '@/lib/utils'
import type { RawPostRow } from '@/types/feed'

const DEFAULT_VISIBLE = 3

export function ReplyThread({
  postId,
  channelId,
}: {
  postId: string
  channelId: string
}) {
  const [replies, setReplies] = useState<RawPostRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReplies(postId).then(({ replies: data }) => {
      setReplies(data)
      setIsLoading(false)
    })
  }, [postId])

  async function handleReply() {
    if (!replyText.trim() || isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    const result = await createReply(replyText.trim(), postId, channelId)
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    // Re-fetch to get the new reply with author info
    const { replies: updated } = await fetchReplies(postId)
    setReplies(updated)
    setReplyText('')
    setIsSubmitting(false)
    setShowAll(true) // Expand so user sees their reply
  }

  const visible = showAll ? replies : replies.slice(0, DEFAULT_VISIBLE)
  const hiddenCount = replies.length - DEFAULT_VISIBLE

  if (isLoading) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-50">
        <p className="text-xs text-stone-400">Loading replies…</p>
      </div>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
      {/* Reply list */}
      {visible.map((reply) => (
        <div key={reply.id} className="flex gap-2.5">
          {reply.author?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={reply.author.avatar_url}
              alt={reply.author.full_name}
              className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
            />
          ) : (
            <ReplyAvatar name={reply.author?.full_name ?? ''} />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <Link
                href={`/profile/${reply.author_id}`}
                className="text-xs font-semibold text-stone-800 hover:text-brand-orange transition-colors"
              >
                {reply.author?.full_name ?? 'Member'}
              </Link>
              <span className="text-xs text-stone-400">{timeAgo(reply.created_at)}</span>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed mt-0.5 whitespace-pre-wrap">
              {reply.content}
            </p>
          </div>
        </div>
      ))}

      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-brand-orange font-semibold hover:underline"
        >
          View all {replies.length} replies
        </button>
      )}

      {/* Reply composer */}
      <div className="flex gap-2 mt-2">
        <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-brand-orange text-xs font-bold">You</span>
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => {
              setReplyText(e.target.value)
              if (error) setError(null)
            }}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
            placeholder="Write a reply…"
            maxLength={500}
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors placeholder-stone-400"
          />
          <button
            type="button"
            onClick={handleReply}
            disabled={!replyText.trim() || isSubmitting}
            className="text-sm font-semibold text-brand-orange hover:text-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed px-2"
          >
            {isSubmitting ? '…' : 'Reply'}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function ReplyAvatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center shrink-0 mt-0.5">
      <span className="text-brand-green font-bold text-xs">{initials || '?'}</span>
    </div>
  )
}
