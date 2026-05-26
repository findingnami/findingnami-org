'use client'

export default function FeedError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-stone-700 font-semibold mb-2">Something went wrong loading the feed.</p>
      <p className="text-stone-400 text-sm mb-6">It&apos;s not you — let&apos;s try that again.</p>
      <button
        onClick={reset}
        className="bg-brand-orange text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-orange/90 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
