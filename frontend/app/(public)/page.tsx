import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ServicesPreview } from "@/components/sections/ServicesPreview";

export default function Home() {
  return (
    <div className="min-h-screen bg-night text-fg">
      <PublicNavbar />
      <main>
        <Hero />
        <ServicesPreview />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
