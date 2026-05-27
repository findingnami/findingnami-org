export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl font-extrabold text-stone-900 mb-4">
          Finding Nami
        </h1>
        <p className="text-lg text-stone-600 mb-3">
          Your community for building a remote career on your own terms.
        </p>
        <p className="text-base text-stone-500 mb-1">
          Just enter your email to get started.
        </p>
        <p className="text-sm text-stone-400 mb-8">
          No password needed. We&apos;ll send you a magic link and you&apos;re in.
        </p>
        <a
          href="/login"
          className="inline-block bg-brand-orange text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition"
        >
          Join the community
        </a>
      </div>
    </main>
  );
}
