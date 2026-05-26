'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const INDUSTRIES = [
  'Technology',
  'Marketing & Communications',
  'Finance & Accounting',
  'Healthcare',
  'Education',
  'Creative & Design',
  'Operations & Admin',
  'Customer Success',
  'HR & People',
  'Legal',
  'Sales',
  'Other',
]

const GOAL_OPTIONS = [
  { value: 'negotiating-wfh', label: '🏠 Negotiating WFH' },
  { value: 'job-hunting', label: '🔍 Job Hunting' },
  { value: 'freelancing', label: '💼 Going Freelance' },
  { value: 'already-remote', label: '✅ Already Remote' },
]

const STAGE_OPTIONS = [
  { value: 'early', label: 'Early career' },
  { value: 'mid', label: 'Mid career' },
  { value: 'senior', label: 'Senior' },
]

type Props = {
  goal: string
  industry: string
  stage: string
  q: string
}

export function MemberFilters({ goal, industry, stage, q }: Props) {
  const router = useRouter()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(q)

  useEffect(() => {
    setSearchValue(q)
  }, [q])

  const hasFilters = !!(goal || industry || stage || q)
  const activeCount = [goal, industry, stage, q].filter(Boolean).length

  function navigate(overrides: Record<string, string>) {
    const params = new URLSearchParams()
    const vals = { goal, industry, stage, q, ...overrides }
    if (vals.goal) params.set('goal', vals.goal)
    if (vals.industry) params.set('industry', vals.industry)
    if (vals.stage) params.set('stage', vals.stage)
    if (vals.q) params.set('q', vals.q)
    const qs = params.toString()
    router.push(qs ? `/members?${qs}` : '/members')
  }

  function clearAll() {
    setSearchValue('')
    router.push('/members')
  }

  const pillBase =
    'h-9 px-3.5 rounded-full text-sm border transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-orange/30'
  const pillActive = 'bg-brand-orange/10 border-brand-orange text-brand-orange'
  const pillInactive = 'bg-white border-gray-200 text-stone-500 hover:border-stone-300'

  return (
    <div>
      {/* ── Desktop filter row ── */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        <select
          value={goal}
          onChange={(e) => navigate({ goal: e.target.value })}
          className={`${pillBase} ${goal ? pillActive : pillInactive}`}
        >
          <option value="">Remote goal</option>
          {GOAL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={industry}
          onChange={(e) => navigate({ industry: e.target.value })}
          className={`${pillBase} ${industry ? pillActive : pillInactive}`}
        >
          <option value="">Industry</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>

        <select
          value={stage}
          onChange={(e) => navigate({ stage: e.target.value })}
          className={`${pillBase} ${stage ? pillActive : pillInactive}`}
        >
          <option value="">Career stage</option>
          {STAGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            navigate({ q: searchValue.trim() })
          }}
        >
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by name…"
            className={`h-9 px-3.5 rounded-full text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange/30 ${
              q
                ? 'border-brand-orange bg-brand-orange/10 text-brand-orange placeholder-brand-orange/60'
                : 'border-gray-200 text-stone-700 placeholder-stone-400'
            }`}
          />
        </form>

        {hasFilters && (
          <button onClick={clearAll} className="text-brand-orange text-sm underline">
            Clear filters
          </button>
        )}
      </div>

      {/* ── Mobile toggle + drawer ── */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-1.5 h-9 px-3.5 rounded-full text-sm border transition-colors ${
              hasFilters
                ? 'bg-brand-orange/10 border-brand-orange text-brand-orange'
                : 'border-gray-200 text-stone-600 bg-white'
            }`}
          >
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="bg-brand-orange text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
          {hasFilters && (
            <button onClick={clearAll} className="text-brand-orange text-sm underline">
              Clear all
            </button>
          )}
        </div>

        {filtersOpen && (
          <div className="mt-3 space-y-2.5 p-4 bg-gray-50 rounded-2xl">
            <select
              value={goal}
              onChange={(e) => navigate({ goal: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
            >
              <option value="">Remote goal — All</option>
              {GOAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              value={industry}
              onChange={(e) => navigate({ industry: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
            >
              <option value="">Industry — All</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            <select
              value={stage}
              onChange={(e) => navigate({ stage: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
            >
              <option value="">Career stage — All</option>
              {STAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                navigate({ q: searchValue.trim() })
                setFiltersOpen(false)
              }}
            >
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search by name…"
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
