import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
      {/* Text content */}
      <div className="flex-1 flex flex-col items-start">
        {/* Founding member badge */}
        <span className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green text-sm font-medium px-4 py-1 rounded-full mb-6">
          🌊 First 50 founding member spots open
        </span>

        <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 leading-tight mb-5">
          Tired of spending 3 hours a day on heavy traffic?{" "}
          <span className="text-brand-orange">You deserve a career that fits your life.</span>
        </h1>

        <p className="text-lg text-stone-500 font-medium leading-relaxed mb-8 max-w-xl">
          Finding Nami is a community for Filipina professionals who are ready to
          transition to remote work — and want the support, skills, and connections
          to actually make it happen.
        </p>

        <Link
          href="/signup"
          className="bg-brand-orange text-white rounded-full px-8 py-4 text-base font-bold hover:opacity-90 transition-opacity inline-block"
        >
          Join for free — founding member spots open
        </Link>
        <p className="text-sm text-stone-400 mt-3">Free to join. No credit card needed.</p>
      </div>

      {/* Decorative shape */}
      <div className="flex-1 flex items-center justify-center w-full max-w-sm md:max-w-none">
        <div className="relative w-72 h-72 md:w-80 md:h-80">
          {/* Outer soft blob */}
          <div className="absolute inset-0 bg-brand-orange/10 rounded-[60%_40%_50%_50%/50%_60%_40%_50%]" />
          {/* Inner accent blob */}
          <div className="absolute inset-8 bg-brand-green/15 rounded-[40%_60%_55%_45%/45%_55%_60%_40%]" />
          {/* Floating pill cards */}
          <div className="absolute top-6 left-4 bg-white shadow-md rounded-2xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-stone-700">
            <span className="text-brand-orange text-base">✓</span> Got my first remote offer!
          </div>
          <div className="absolute bottom-10 right-2 bg-white shadow-md rounded-2xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-stone-700">
            <span className="text-brand-green text-base">🎯</span> 3 months in 🌊
          </div>
          <div className="absolute bottom-4 left-8 bg-brand-orange/90 text-white shadow-md rounded-2xl px-4 py-2.5 text-sm font-semibold">
            Mahal ko ang WFH ✨
          </div>
        </div>
      </div>
    </section>
  );
}
