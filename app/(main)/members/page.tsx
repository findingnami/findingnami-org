import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMembers, getMemberCount } from '@/lib/supabase/queries'
import { MemberCard } from '@/components/members/MemberCard'
import { MemberFilters } from '@/components/members/MemberFilters'
import { MemberGrid } from '@/components/members/MemberGrid'

export const metadata = { title: 'Members — Finding Nami' }

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { goal?: string; industry?: string; stage?: string; q?: string }
}) {
  const goal = searchParams.goal ?? ''
  const industry = searchParams.industry ?? ''
  const stage = searchParams.stage ?? ''
  const q = searchParams.q ?? ''

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const filtersActive = !!(goal || industry || stage || q)
  const filters = {
    goal: goal || null,
    industry: industry || null,
    stage: stage || null,
    q: q || null,
  }

  const [{ members, hasMore }, total, spotlightResult] = await Promise.all([
    getMembers({ ...filters, limit: 24 }),
    getMemberCount(),
    filtersActive ? Promise.resolve(null) : getMembers({ limit: 3 }),
  ])

  const spotlight = spotlightResult?.members ?? []

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        <span className="bg-brand-green/10 text-brand-green text-sm font-semibold rounded-full px-3 py-1">
          {total} members
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-6">Meet the women of Finding Nami</p>

      {/* Filters */}
      <div className="mb-6">
        <MemberFilters goal={goal} industry={industry} stage={stage} q={q} />
      </div>

      {/* Recently joined spotlight */}
      {!filtersActive && spotlight.length > 0 && (
        <div className="bg-brand-orange/5 rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-3">
            Recently joined
          </p>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {spotlight.map((member) => (
              <MemberCard key={member.id} member={member} variant="spotlight" />
            ))}
          </div>
        </div>
      )}

      {/* Member grid with load-more */}
      <MemberGrid
        key={`${goal}-${industry}-${stage}-${q}`}
        initialMembers={members}
        hasMore={hasMore}
        filters={filters}
      />
    </main>
  )
}
