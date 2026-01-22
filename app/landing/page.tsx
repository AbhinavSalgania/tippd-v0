import { Header } from "@/app/landing/components/ui/Header";
import { Hero } from "@/app/landing/components/ui/Hero";
import { ProblemSection } from "@/app/landing/components/ui/ProblemSection";
import { FeaturesSection } from "@/app/landing/components/ui/FeaturesSection";
import { EmployeeBenefitSection } from "@/app/landing/components/ui/EmployeeBenefitSection";
import { ROICalculator } from "@/app/landing/components/ui/ROICalculator";
import { ComplianceSection } from "@/app/landing/components/ui/ComplianceSection";
import { TestimonialsSection } from "@/app/landing/components/ui/TestimonialsSection";
import { PricingSection } from "@/app/landing/components/ui/PricingSection";
import { CTASection } from "@/app/landing/components/ui/CTASection";
import { Footer } from "@/app/landing/components/ui/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <FeaturesSection />
        <EmployeeBenefitSection />
        <ROICalculator />
        <ComplianceSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
