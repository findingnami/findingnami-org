import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10 md:gap-16">
      {/* Text content */}
      <div className="flex-1 flex flex-col items-start">
        {/* Founding member badge */}
        <span className="inline-flex items-center gap-1.5 bg-brand-orange/10 text-brand-orange text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          🌊 First 50 founding member spots open
        </span>

        <h1 className="text-4xl md:text-[2.75rem] font-extrabold text-stone-900 leading-[1.15] tracking-tight mb-5">
          Tired of spending 3 hours a day on heavy traffic?{" "}
          <br className="hidden md:block" />
          <span className="text-brand-green">
            You deserve a career that fits your life.
          </span>
        </h1>

        <p className="text-lg text-stone-500 leading-relaxed mb-8 max-w-lg">
          Finding Nami is a community for Filipina professionals who are ready to
          transition to remote work — and want the support, skills, and connections
          to actually make it happen.
        </p>

        <Link
          href="/signup"
          className="bg-brand-green text-white rounded-full px-8 py-4 text-base font-bold hover:opacity-90 transition-opacity inline-block"
        >
          Join for free — founding member spots open
        </Link>
        <p className="text-sm text-stone-400 mt-3">Free to join. No credit card needed.</p>
      </div>

      {/* Hero image */}
      <div className="flex-1 w-full">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl">
          <Image
            src="/hero.webp"
            alt="Filipina professionals on a remote video call"
            width={640}
            height={427}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
