'use client'

import { useState } from 'react'
import Link from 'next/link'
import { markAllRead, markNotificationRead, type Notification } from '@/lib/actions/notifications'

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const diff = Math.floor((now - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  const days = Math.floor(diff / 86400)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDateGroup(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return 'Earlier this week'
  return 'Older'
}

const GROUP_ORDER = ['Today', 'Yesterday', 'Earlier this week', 'Older']

export function NotificationsList({
  initialNotifications,
}: {
  initialNotifications: Notification[]
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [marking, setMarking] = useState(false)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  async function handleMarkAll() {
    if (marking) return
    setMarking(true)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await markAllRead()
    setMarking(false)
  }

  async function handleMarkOne(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    await markNotificationRead(id)
  }

  // Group by date
  const groups = new Map<string, Notification[]>()
  for (const n of notifications) {
    const group = getDateGroup(n.created_at)
    if (!groups.has(group)) groups.set(group, [])
    groups.get(group)!.push(n)
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <p className="text-stone-700 font-semibold mb-1">All quiet here</p>
        <p className="text-stone-400 text-sm max-w-xs leading-relaxed">
          When someone replies to your post or posts in a channel you follow, you&apos;ll see it here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleMarkAll}
            disabled={marking}
            className="text-sm text-brand-orange font-semibold hover:underline disabled:opacity-50"
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* Grouped notifications */}
      {GROUP_ORDER.filter((g) => groups.has(g)).map((groupLabel) => (
        <div key={groupLabel}>
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 px-1">
            {groupLabel}
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {groups.get(groupLabel)!.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={handleMarkOne}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function NotificationItem({
  notification: n,
  onRead,
}: {
  notification: Notification
  onRead: (id: string) => void
}) {
  function handleClick() {
    if (!n.is_read) onRead(n.id)
  }

  const typeIcon =
    n.type === 'reply_to_post' ? (
      <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </div>
    ) : (
      <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </div>
    )

  return (
    <Link
      href={n.link ?? '/feed'}
      onClick={handleClick}
      className={`flex items-start gap-4 px-5 py-4 hover:bg-stone-50 transition-colors ${
        n.is_read ? '' : 'bg-brand-orange/5'
      }`}
    >
      {typeIcon}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${n.is_read ? 'text-stone-600' : 'text-stone-800 font-medium'}`}>
            {n.title}
          </p>
          {!n.is_read && (
            <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-orange shrink-0" />
          )}
        </div>
        {n.body && (
          <p className="text-sm text-stone-400 mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
        )}
        <p className="text-xs text-stone-400 mt-1">{timeAgo(n.created_at)}</p>
      </div>
    </Link>
  )
}
