import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Wave illustration */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-brand-orange/10" />
          <div className="absolute inset-4 rounded-full bg-brand-orange/15" />
          <div className="absolute inset-8 rounded-full bg-brand-orange/20 flex items-center justify-center">
            <span className="text-2xl">🌊</span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-stone-900 mb-2">
          This page does not exist
        </h1>
        <p className="text-stone-500 leading-relaxed mb-8">
          The link may be broken, or the page may have moved. The community is still here —
          come find your nami.
        </p>

        <Link
          href="/feed"
          className="inline-block bg-brand-orange text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-orange/90 transition-colors"
        >
          Go to the feed
        </Link>
      </div>
    </div>
  )
}
