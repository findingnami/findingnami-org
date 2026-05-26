import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMemberProfile } from '@/lib/supabase/queries'
import { ProfilePostCard } from '@/components/members/ProfilePostCard'
import { formatEventDate } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const profile = await getMemberProfile(params.id)
  if (!profile) return { title: 'Member — Finding Nami' }
  return {
    title: `${profile.full_name} — Finding Nami`,
    description: profile.bio ?? `${profile.full_name}'s profile on Finding Nami`,
  }
}

const GOAL_BADGES: Record<string, { label: string; className: string }> = {
  'negotiating-wfh': { label: '🏠 Negotiating WFH', className: 'bg-blue-50 text-blue-600' },
  'job-hunting': { label: '🔍 Job Hunting', className: 'bg-purple-50 text-purple-600' },
  freelancing: { label: '💼 Going Freelance', className: 'bg-yellow-50 text-yellow-700' },
  'already-remote': {
    label: '✅ Already Remote',
    className: 'bg-brand-green/10 text-brand-green',
  },
}

const STAGE_LABELS: Record<string, string> = {
  early: 'Early career',
  mid: 'Mid career',
  senior: 'Senior',
  exec: 'Executive',
}

const WORK_SETUP_LABELS: Record<string, string> = {
  'on-site': 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
  freelance: 'Freelance',
}

const GOAL_SHORT_LABELS: Record<string, string> = {
  'negotiating-wfh': 'Negotiating WFH',
  'job-hunting': 'Job Hunting',
  freelancing: 'Going Freelance',
  'already-remote': 'Already Remote',
}

function memberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = await getMemberProfile(params.id)
  if (!profile) notFound()

  const isOwnProfile = user?.id === params.id
  const goalBadge = profile.remote_goal ? GOAL_BADGES[profile.remote_goal] : null
  const stageLabel = profile.career_stage ? STAGE_LABELS[profile.career_stage] : null

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Left column ── */}
        <div className="flex-1 min-w-0">
          {/* Profile header card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
            {/* Cover banner */}
            <div className="h-32 sm:h-40 bg-gradient-to-r from-brand-orange/10 to-brand-green/10 relative">
              {/* Avatar overlapping cover */}
              <div className="absolute -bottom-12 left-6">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-brand-orange/20 border-4 border-white shadow-sm flex items-center justify-center">
                    <span className="text-brand-orange font-bold text-2xl">
                      {profile.full_name
                        .trim()
                        .split(/\s+/)
                        .map((w) => w[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* Edit button for own profile */}
              {isOwnProfile && (
                <div className="absolute top-4 right-4">
                  <Link
                    href="/settings"
                    className="border border-gray-200 bg-white text-gray-700 rounded-xl px-4 py-2 text-sm hover:border-brand-orange hover:text-brand-orange transition-colors"
                  >
                    Edit Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Profile info — offset for avatar overlap */}
            <div className="pt-16 px-6 pb-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
                  {(profile.industry || stageLabel) && (
                    <p className="text-gray-500 text-sm mt-0.5">
                      {[profile.industry, stageLabel].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {goalBadge && (
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${goalBadge.className}`}>
                    {goalBadge.label}
                  </span>
                )}
                {profile.is_mentor && (
                  <span className="text-brand-orange font-semibold text-sm">✦ Nami Mentor</span>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700 text-sm leading-relaxed mt-4">{profile.bio}</p>
              )}

              {/* LinkedIn + member since */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-200 text-gray-600 text-sm px-3 py-1.5 rounded-xl hover:border-brand-orange hover:text-brand-orange transition-colors"
                  >
                    LinkedIn ↗
                  </a>
                )}
                <p className="text-gray-400 text-xs">
                  Member since {memberSince(profile.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* This is me section */}
          {(profile.current_work_setup || profile.remote_goal || profile.industry) && (
            <div className="bg-gray-50 rounded-2xl p-4 grid grid-cols-3 gap-4 text-center text-sm mb-5">
              <div>
                <p className="text-lg mb-1">🏢</p>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Work setup</p>
                <p className="text-stone-700 font-medium mt-0.5 text-xs sm:text-sm">
                  {profile.current_work_setup
                    ? WORK_SETUP_LABELS[profile.current_work_setup] ?? profile.current_work_setup
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-lg mb-1">🎯</p>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Remote goal
                </p>
                <p className="text-stone-700 font-medium mt-0.5 text-xs sm:text-sm">
                  {profile.remote_goal
                    ? GOAL_SHORT_LABELS[profile.remote_goal] ?? profile.remote_goal
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-lg mb-1">💼</p>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Industry</p>
                <p className="text-stone-700 font-medium mt-0.5 text-xs sm:text-sm">
                  {profile.industry ?? '—'}
                </p>
              </div>
            </div>
          )}

          {/* Recent posts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-semibold text-stone-900 mb-1">Recent posts</h2>
            {profile.recent_posts.length === 0 ? (
              <p className="text-sm text-stone-400 py-4">
                {profile.full_name.split(' ')[0]} hasn&apos;t posted yet. Check back soon!
              </p>
            ) : (
              <>
                <div className="divide-y divide-stone-100">
                  {profile.recent_posts.map((post) => (
                    <ProfilePostCard key={post.id} post={post} />
                  ))}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/feed?author=${profile.id}`}
                    className="text-brand-orange text-sm font-semibold hover:underline"
                  >
                    See all posts →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Right column: activity sidebar ── */}
        <div className="lg:w-72 shrink-0 space-y-4">
          {/* Upcoming events */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Hosting soon</h3>
            {profile.upcoming_events.length === 0 ? (
              <p className="text-sm text-stone-400">No upcoming events.</p>
            ) : (
              <div className="space-y-3">
                {profile.upcoming_events.map((ev) => (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.id}`}
                    className="block group"
                  >
                    <p className="text-sm font-medium text-stone-800 group-hover:text-brand-orange transition-colors line-clamp-2">
                      {ev.title}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">{formatEventDate(ev.starts_at)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Member stats</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-500">Posts</span>
                <span className="text-sm font-semibold text-stone-800">{profile.post_count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-500">Events hosted</span>
                <span className="text-sm font-semibold text-stone-800">{profile.event_count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-500">Member since</span>
                <span className="text-sm font-semibold text-stone-800">
                  {memberSince(profile.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
