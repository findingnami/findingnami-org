const testimonials = [
  {
    quote:
      "I never thought remote work was possible for someone in my industry. Finding Nami showed me exactly what skills to build and who to talk to. Nakuha ko ang first remote offer ko after 3 months.",
    name: "Jasmine R.",
    role: "Former BPO team lead, now remote customer success manager",
  },
  {
    quote:
      "The community is so warm — parang may ate ka talaga na nagga-guide sa'yo. Hindi ako nag-iisa sa journey.",
    name: "Trisha M.",
    role: "HR professional transitioning to remote consulting",
  },
  {
    quote:
      "I was already working hybrid but wanted full remote. The WFH negotiation resources here helped me finally have that conversation with my boss. It worked.",
    name: "Carla V.",
    role: "Marketing manager, now fully remote",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 text-center mb-12">
        From the community
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="bg-white border border-stone-100 rounded-2xl p-7 flex flex-col gap-4"
          >
            {/* Stars */}
            <p className="text-brand-orange text-lg tracking-wide">★★★★★</p>
            <p className="text-stone-700 leading-relaxed flex-1">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div>
              <p className="font-bold text-stone-900 text-sm">{t.name}</p>
              <p className="text-stone-400 text-xs mt-0.5">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-stone-400 mt-8">
        * Testimonials are representative of the community experience and will be updated with real member stories as the community grows.
      </p>
    </section>
  );
}
