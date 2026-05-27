import Link from "next/link";

export default function FoundingCTA() {
  return (
    <section className="bg-brand-orange/10 py-20">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-5">
          Be one of our first 50 founding members
        </h2>
        <p className="text-stone-600 leading-relaxed mb-8 text-lg">
          Founding members get free access, a permanent badge on their profile,
          and the chance to shape what Finding Nami becomes.
          <br className="hidden md:block" />
          We&apos;re just getting started — and we want you with us from day one.
        </p>
        <Link
          href="/signup"
          className="bg-brand-orange text-white rounded-full px-8 py-4 text-base font-bold hover:opacity-90 transition-opacity inline-block mb-4"
        >
          Claim your founding member spot
        </Link>
        <p className="text-sm text-stone-400">Only 50 spots remaining</p>
      </div>
    </section>
  );
}
