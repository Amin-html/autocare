import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { PopularServices } from "@/components/sections/PopularServices";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FinalBanner } from "@/components/sections/FinalBanner";

export default function Home() {
  return (
    <div className="min-h-screen bg-night text-fg">
      <PublicNavbar />
      <main>
        <Hero />
        <PopularServices />
        <HowItWorks />
        <FinalBanner />
      </main>
      <Footer />
    </div>
  );
}
