'use client'

import { useState } from 'react'
import { getMembers } from '@/lib/supabase/queries'
import { MemberCard } from './MemberCard'
import type { MemberListItem } from '@/types/members'
import type { GetMembersOptions } from '@/lib/supabase/queries'

type Props = {
  initialMembers: MemberListItem[]
  hasMore: boolean
  filters: GetMembersOptions
}

export function MemberGrid({ initialMembers, hasMore: initialHasMore, filters }: Props) {
  const [members, setMembers] = useState(initialMembers)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)

  async function loadMore() {
    if (loading || !hasMore) return
    const cursor = members[members.length - 1]?.created_at
    setLoading(true)
    const result = await getMembers({ ...filters, cursor, limit: 24 })
    setMembers((prev) => [...prev, ...result.members])
    setHasMore(result.hasMore)
    setLoading(false)
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-stone-700 font-medium mb-1">No members found with those filters.</p>
        <p className="text-sm text-stone-400">
          Try broadening your search — there are some incredible women in here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <MemberCard key={m.id} member={m} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2.5 border border-stone-200 text-stone-600 text-sm font-medium rounded-xl hover:border-brand-orange hover:text-brand-orange transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  )
}
