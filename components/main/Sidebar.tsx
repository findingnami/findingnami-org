'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'

type Channel = { id: string; slug: string; name: string }
type Profile = {
  id: string
  full_name: string
  avatar_url: string | null
  username: string
} | null

const NAV_ITEMS = [
  { href: '/feed', label: 'Feed', icon: '🏠' },
  { href: '/events', label: 'Events', icon: '📅' },
  { href: '/members', label: 'Members', icon: '👩‍💻' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

function InitialsAvatar({
  name,
  size = 'md',
}: {
  name: string
  size?: 'sm' | 'md'
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div
      className={`${sizeClass} rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0`}
    >
      <span className="text-brand-orange font-bold">{initials}</span>
    </div>
  )
}

export function Sidebar({ profile, channels }: { profile: Profile; channels: Channel[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeChannel = searchParams.get('channel')

  const profileHref = profile ? `/profile/${profile.id}` : '/profile'

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-100 flex-col z-20 overflow-y-auto">
        {/* Wordmark */}
        <div className="px-5 py-5">
          <span className="text-brand-orange font-extrabold text-xl tracking-tight">
            Finding Nami
          </span>
        </div>

        {/* Primary nav */}
        <nav className="px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-orange/10 text-brand-orange font-semibold'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
          {/* Profile link needs dynamic ID */}
          <Link
            href={profileHref}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              pathname.startsWith('/profile')
                ? 'bg-brand-orange/10 text-brand-orange font-semibold'
                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <span>👤</span>
            My Profile
          </Link>
        </nav>

        {/* Channels */}
        {channels.length > 0 && (
          <div className="mt-6 px-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Channels
            </p>
            <div className="space-y-0.5">
              {channels.map((ch) => {
                const isActive = pathname === '/feed' && activeChannel === ch.slug
                return (
                  <Link
                    key={ch.id}
                    href={`/feed?channel=${ch.slug}`}
                    className={`block px-2 py-1.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'text-brand-orange font-semibold'
                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    #{ch.slug}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* User info + sign out */}
        {profile && (
          <div className="px-4 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2.5 mb-3">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
              ) : (
                <InitialsAvatar name={profile.full_name} />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs text-stone-400 truncate">@{profile.username}</p>
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full text-left text-xs text-stone-400 hover:text-stone-600 transition-colors py-1"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20 flex">
        {[...NAV_ITEMS, { href: profileHref, label: 'Profile', icon: '👤' }].map((item) => {
          const isActive =
            item.href === profileHref
              ? pathname.startsWith('/profile')
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs transition-colors ${
                isActive ? 'text-brand-orange' : 'text-stone-400'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="hidden xs:block">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
