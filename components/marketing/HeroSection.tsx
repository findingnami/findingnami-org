import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[560px] md:min-h-[640px] flex items-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/hero.webp"
        alt="Filipina professionals on a remote video call"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Dark gradient overlay — left-heavy so text stays legible */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/60 to-stone-900/10" />

      {/* Text content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 flex flex-col items-start max-w-2xl">
        {/* Founding member badge */}
        <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
          🌊 First 50 founding member spots open
        </span>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-[1.15] tracking-tight mb-5 drop-shadow-md">
          Tired of spending 3 hours a day on heavy traffic?{" "}
          <br className="hidden md:block" />
          <span className="text-brand-orange">
            You deserve a career that fits your life.
          </span>
        </h1>

        <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg drop-shadow-sm">
          Finding Nami is a community for Filipina professionals who are ready to
          transition to remote work — and want the support, skills, and connections
          to actually make it happen.
        </p>

        <Link
          href="/signup"
          className="bg-brand-green text-white rounded-full px-8 py-4 text-base font-bold hover:opacity-90 transition-opacity inline-block shadow-lg"
        >
          Join for free — founding member spots open
        </Link>
        <p className="text-sm text-white/50 mt-3">Free to join. No credit card needed.</p>
      </div>
    </section>
  );
}
