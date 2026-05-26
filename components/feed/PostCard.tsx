'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { toggleLike, deletePost } from '@/lib/actions/posts'
import { timeAgo } from '@/lib/utils'
import type { PostWithMeta } from '@/types/feed'
import { ReplyThread } from './ReplyThread'

const CLAMP_LINES = 4

export function PostCard({
  post,
  currentUserId,
  onDeleted,
}: {
  post: PostWithMeta
  currentUserId: string
  onDeleted: () => void
}) {
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [hasLiked, setHasLiked] = useState(post.user_has_liked)
  const [showReplies, setShowReplies] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const contentRef = useRef<HTMLParagraphElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const isOwn = currentUserId === post.author_id

  // Detect whether the content is actually clamped
  useEffect(() => {
    const el = contentRef.current
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight + 2)
    }
  }, [post.content])

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  async function handleLike() {
    const wasLiked = hasLiked
    const prevCount = likeCount
    setHasLiked(!wasLiked)
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1)
    const result = await toggleLike(post.id)
    if (result.error) {
      setHasLiked(wasLiked)
      setLikeCount(prevCount)
    }
  }

  async function handleDelete() {
    setShowMenu(false)
    setIsDeleting(true)
    const result = await deletePost(post.id)
    if (result.error) {
      setIsDeleting(false)
    } else {
      onDeleted()
    }
  }

  if (isDeleting) return null

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <Link href={`/profile/${post.author_id}`} className="shrink-0">
            {post.author.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.full_name}
                className="w-10 h-10 rounded-full object-cover hover:opacity-90 transition-opacity"
              />
            ) : (
              <AuthorAvatar name={post.author.full_name} />
            )}
          </Link>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <Link
                href={`/profile/${post.author_id}`}
                className="font-semibold text-stone-900 text-sm hover:text-brand-orange transition-colors"
              >
                {post.author.full_name}
              </Link>
              <span className="text-stone-400 text-xs">{timeAgo(post.created_at)}</span>
            </div>
            <Link
              href={`/feed?channel=${post.channel.slug}`}
              className="text-xs text-brand-green font-medium hover:underline"
            >
              #{post.channel.slug}
            </Link>
          </div>
        </div>

        {/* Own post menu */}
        {isOwn && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
              aria-label="Post options"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-7 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-max">
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-3">
        <p
          ref={contentRef}
          className={`text-sm text-stone-700 leading-relaxed whitespace-pre-wrap ${
            !isExpanded ? 'line-clamp-4' : ''
          }`}
        >
          {post.content}
        </p>
        {isClamped && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-brand-orange font-semibold mt-1 hover:underline"
          >
            Read more
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            hasLiked ? 'text-brand-orange font-semibold' : 'text-stone-400 hover:text-brand-orange'
          }`}
        >
          <span>{hasLiked ? '👍' : '👍'}</span>
          <span>{likeCount > 0 ? likeCount : ''}</span>
        </button>

        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          <span>💬</span>
          <span>{post.reply_count > 0 ? post.reply_count : 'Reply'}</span>
        </button>
      </div>

      {/* Inline reply thread */}
      {showReplies && (
        <ReplyThread
          postId={post.id}
          channelId={post.channel_id}
          currentUserId={currentUserId}
        />
      )}
    </article>
  )
}

function AuthorAvatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center">
      <span className="text-brand-orange font-bold text-sm">{initials || '?'}</span>
    </div>
  )
}
