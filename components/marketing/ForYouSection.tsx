const items = [
  "You're spending more time commuting than actually living",
  "You want to work from home but don't know where to start",
  "You've tried applying to remote jobs but keep getting ignored",
  "You're thinking about freelancing but it feels overwhelming",
  "You want a mentor who's already been through it",
  "You're done waiting for your company to give you permission",
];

export default function ForYouSection() {
  return (
    <section className="bg-stone-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-10">
          Finding Nami is for you if…
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-brand-orange/10 flex items-center justify-center">
                <svg className="w-3 h-3 text-brand-orange" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                </svg>
              </span>
              <p className="text-stone-700 font-medium leading-snug">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
