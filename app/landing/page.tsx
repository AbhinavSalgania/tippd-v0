import { Header } from "@/app/landing/components/ui/Header";
import { Hero } from "@/app/landing/components/ui/Hero";
import { ProblemSection } from "@/app/landing/components/ui/ProblemSection";
import { HowItWorksSection } from "@/app/landing/components/ui/HowItWorksSection";
import { FeaturesSection } from "@/app/landing/components/ui/FeaturesSection";
import { ROICalculator } from "@/app/landing/components/ui/ROICalculator";
import { TestimonialsSection } from "@/app/landing/components/ui/TestimonialsSection";
import { EmployeeBenefitSection } from "@/app/landing/components/ui/EmployeeBenefitSection";
import { PricingSection } from "@/app/landing/components/ui/PricingSection";
import { FAQSection } from "@/app/landing/components/ui/FAQSection";
import { CTASection } from "@/app/landing/components/ui/CTASection";
import { Footer } from "@/app/landing/components/ui/Footer";
import { ScrollProgress } from "@/app/landing/components/ui/ScrollProgress";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <ScrollProgress />
      <Header />
      <main className="md:snap-y md:snap-proximity">
        <Hero />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ROICalculator />
        <TestimonialsSection />
        <EmployeeBenefitSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
