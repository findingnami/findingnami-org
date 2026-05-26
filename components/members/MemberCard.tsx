import Link from 'next/link'
import type { MemberListItem } from '@/types/members'

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

function InitialsAvatar({ name, sizeClass }: { name: string; sizeClass: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div
      className={`${sizeClass} rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0`}
    >
      <span className="text-brand-orange font-bold">{initials}</span>
    </div>
  )
}

type Props = {
  member: MemberListItem
  variant?: 'grid' | 'spotlight'
}

export function MemberCard({ member, variant = 'grid' }: Props) {
  const goal = member.remote_goal ? GOAL_BADGES[member.remote_goal] : null
  const stageLabel = member.career_stage ? STAGE_LABELS[member.career_stage] : null

  if (variant === 'spotlight') {
    return (
      <Link
        href={`/profile/${member.id}`}
        className="flex flex-col items-center gap-2 flex-1 min-w-[130px] max-w-[200px] py-2 hover:opacity-80 transition-opacity"
      >
        {member.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatar_url}
            alt={member.full_name}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <InitialsAvatar name={member.full_name} sizeClass="w-20 h-20 text-xl" />
        )}
        <p className="font-semibold text-stone-900 text-sm text-center leading-snug">
          {member.full_name}
        </p>
        {goal && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full text-center ${goal.className}`}
          >
            {goal.label}
          </span>
        )}
      </Link>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:shadow-md transition-shadow relative">
      {member.is_mentor && (
        <span className="absolute top-3 right-3 bg-brand-orange/10 text-brand-orange text-xs font-semibold rounded-full px-2 py-0.5">
          Mentor
        </span>
      )}

      <div className="flex justify-center mb-3">
        {member.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatar_url}
            alt={member.full_name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <InitialsAvatar name={member.full_name} sizeClass="w-16 h-16 text-lg" />
        )}
      </div>

      <p className="font-semibold text-stone-900 text-sm leading-snug">{member.full_name}</p>

      {(member.industry || stageLabel) && (
        <p className="text-xs text-stone-400 mt-0.5">
          {[member.industry, stageLabel].filter(Boolean).join(' · ')}
        </p>
      )}

      {goal && (
        <span className={`inline-block mt-2.5 text-xs font-medium px-2.5 py-1 rounded-full ${goal.className}`}>
          {goal.label}
        </span>
      )}

      <div className="mt-3.5">
        <Link
          href={`/profile/${member.id}`}
          className="text-brand-orange font-semibold text-sm hover:underline"
        >
          View Profile →
        </Link>
      </div>
    </div>
  )
}
