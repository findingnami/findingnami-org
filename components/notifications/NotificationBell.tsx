'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  getRecentNotifications,
  markAllRead,
  markNotificationRead,
  type Notification,
} from '@/lib/actions/notifications'

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const diff = Math.floor((now - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function NotificationBell({
  initialUnreadCount,
}: {
  initialUnreadCount: number
}) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [loaded, setLoaded] = useState(false)
  const [marking, setMarking] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Realtime: increment unread count when a new notification arrives
  useEffect(() => {
    const channel = supabase
      .channel('notifications:bell')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => {
          setUnreadCount((n) => n + 1)
          // If dropdown is open, refresh the list
          if (open) loadNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function loadNotifications() {
    const result = await getRecentNotifications()
    setNotifications(result.notifications)
    setUnreadCount(result.unreadCount)
    setLoaded(true)
  }

  async function handleOpen() {
    setOpen((prev) => !prev)
    if (!loaded) {
      await loadNotifications()
    }
  }

  async function handleMarkAll() {
    if (marking) return
    setMarking(true)
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await markAllRead()
    setMarking(false)
  }

  async function handleMarkOne(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
    await markNotificationRead(id)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
        aria-label="Notifications"
      >
        {/* Bell icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-stone-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={marking}
                className="text-xs text-brand-orange font-semibold hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {!loaded ? (
              <div className="p-6 text-center text-sm text-stone-400">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-stone-400">You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onRead={handleMarkOne}
                  onClose={() => setOpen(false)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-xs text-center text-brand-orange font-semibold hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationRow({
  notification: n,
  onRead,
  onClose,
}: {
  notification: Notification
  onRead: (id: string) => void
  onClose: () => void
}) {
  function handleClick() {
    if (!n.is_read) onRead(n.id)
    onClose()
  }

  return (
    <Link
      href={n.link ?? '/notifications'}
      onClick={handleClick}
      className={`flex gap-3 px-4 py-3 hover:bg-stone-50 transition-colors ${
        n.is_read ? '' : 'bg-brand-orange/5'
      }`}
    >
      {/* Unread dot */}
      <div className="mt-1.5 shrink-0">
        {n.is_read ? (
          <div className="w-2 h-2 rounded-full bg-transparent" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-brand-orange" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-800 font-medium leading-snug">{n.title}</p>
        {n.body && (
          <p className="text-xs text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
        )}
        <p className="text-[11px] text-stone-400 mt-1">{timeAgo(n.created_at)}</p>
      </div>
    </Link>
  )
}
