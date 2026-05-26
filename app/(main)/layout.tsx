import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/main/Sidebar'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { getRecentNotifications } from '@/lib/actions/notifications'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { data: channels }, { unreadCount }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username')
      .eq('id', user?.id ?? '')
      .single(),
    supabase
      .from('channels')
      .select('id, slug, name')
      .eq('is_public', true)
      .order('name'),
    user ? getRecentNotifications() : Promise.resolve({ notifications: [], unreadCount: 0 }),
  ])

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar — wrapped in Suspense because Sidebar uses useSearchParams */}
      <Suspense fallback={<div className="hidden md:block w-60 shrink-0" />}>
        <Sidebar profile={profile} channels={channels ?? []} />
      </Suspense>

      {/* Fixed top header — visible on all screen sizes */}
      <header className="fixed top-0 right-0 left-0 md:left-60 h-14 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
        {/* Mobile: Finding Nami logo / wordmark */}
        <Link href="/feed" className="md:hidden font-extrabold text-brand-orange text-lg tracking-tight">
          Finding Nami
        </Link>
        {/* Desktop: empty left side (sidebar handles nav) */}
        <div className="hidden md:block" />

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          <NotificationBell initialUnreadCount={unreadCount} />

          {profile?.avatar_url ? (
            <Link href="/settings" className="ml-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? ''}
                className="w-8 h-8 rounded-full object-cover border border-gray-200 hover:opacity-80 transition-opacity"
              />
            </Link>
          ) : (
            <Link
              href="/settings"
              className="ml-1 w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <span className="text-brand-orange font-bold text-xs">
                {(profile?.full_name ?? '?')
                  .trim()
                  .split(/\s+/)
                  .map((w: string) => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </span>
            </Link>
          )}
        </div>
      </header>

      {/* Main content — offset for fixed sidebar on md+, fixed header top, bottom bar on mobile */}
      <main className="flex-1 min-w-0 md:ml-60 pt-14 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
}
