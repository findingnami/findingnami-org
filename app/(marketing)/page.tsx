import MarketingNav from "@/components/marketing/MarketingNav";
import HeroSection from "@/components/marketing/HeroSection";
import FeaturesSection from "@/components/marketing/FeaturesSection";
import ForYouSection from "@/components/marketing/ForYouSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import FoundingCTA from "@/components/marketing/FoundingCTA";
import Footer from "@/components/marketing/Footer";
import FadeIn from "@/components/ui/FadeIn";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      <MarketingNav />

      <HeroSection />

      <FadeIn>
        {/* Social proof bar */}
        <div className="bg-stone-50 border-y border-stone-100 py-4">
          <p className="text-center text-sm text-stone-400 font-medium tracking-wide">
            Joined by Filipina professionals from{" "}
            <span className="text-stone-500">BPO</span>
            {" · "}
            <span className="text-stone-500">Corporate</span>
            {" · "}
            <span className="text-stone-500">Freelance</span>
            {" · "}
            <span className="text-stone-500">OFW returnees</span>
          </p>
        </div>
      </FadeIn>

      <FadeIn>
        <FeaturesSection />
      </FadeIn>

      <FadeIn>
        <ForYouSection />
      </FadeIn>

      <FadeIn>
        <TestimonialsSection />
      </FadeIn>

      <FadeIn>
        <FoundingCTA />
      </FadeIn>

      <FadeIn>
        <Footer />
      </FadeIn>
    </main>
  );
}
