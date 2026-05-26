import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getChannelFollows } from '@/lib/actions/settings'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { ChannelsTab } from '@/components/settings/ChannelsTab'
import { AccountTab } from '@/components/settings/AccountTab'

export const metadata = { title: 'Settings — Finding Nami' }

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'channels', label: 'Channels' },
  { key: 'account', label: 'Account' },
] as const

type Tab = (typeof TABS)[number]['key']

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: { tab?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tabParam = searchParams?.tab
  const activeTab: Tab =
    tabParam && TABS.some((t) => t.key === tabParam) ? (tabParam as Tab) : 'profile'

  const [{ data: profile }, { data: channels }, followedIds] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('channels')
      .select('id, slug, name, description')
      .eq('is_public', true)
      .order('name'),
    getChannelFollows(),
  ])

  if (!profile) redirect('/onboarding')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-stone-900 mb-6">Settings</h1>

      {/* Tab nav — horizontal pills */}
      <div className="flex gap-1 bg-stone-100 rounded-2xl p-1 mb-8">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/settings?tab=${tab.key}`}
            className={`flex-1 text-center text-sm font-semibold py-2 rounded-xl transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {activeTab === 'profile' && <ProfileForm profile={profile} />}
        {activeTab === 'channels' && (
          <ChannelsTab
            channels={channels ?? []}
            initialFollowedIds={followedIds}
          />
        )}
        {activeTab === 'account' && <AccountTab email={user.email ?? ''} />}
      </div>
    </div>
  )
}
