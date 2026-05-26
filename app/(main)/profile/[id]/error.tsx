'use client'

import Link from 'next/link'

export default function ProfileError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-stone-700 font-semibold mb-2">Could not load this profile.</p>
      <p className="text-stone-400 text-sm mb-6">It may have been removed or there was a hiccup.</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="bg-brand-orange text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-orange/90 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/members"
          className="text-sm font-semibold text-stone-600 border border-gray-200 px-5 py-2.5 rounded-xl hover:border-stone-300 transition-colors"
        >
          Browse members
        </Link>
      </div>
    </div>
  )
}
