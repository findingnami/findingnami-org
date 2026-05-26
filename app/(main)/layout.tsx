import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/main/Sidebar'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { data: channels }] = await Promise.all([
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
  ])

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar — wrapped in Suspense because Sidebar uses useSearchParams */}
      <Suspense fallback={<div className="hidden md:block w-60 shrink-0" />}>
        <Sidebar profile={profile} channels={channels ?? []} />
      </Suspense>

      {/* Main content — offset for fixed sidebar on md+, bottom bar on mobile */}
      <main className="flex-1 min-w-0 md:ml-60 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
}
