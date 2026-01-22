import { ImageWithFallback } from "@/app/landing/components/figma/ImageWithFallback";
import { Button } from "@/app/landing/components/ui/button";

const heroImage = "/landing/assets/tippdhero.png";

export function Hero() {
  return (
    <section className="pt-24 md:pt-28 pb-16 md:pb-24 bg-gradient-to-br from-[#E3F5EC]/50 via-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-[#0B1F18] leading-tight">
              Operating System for Hospitality
            </h1>
            <p className="text-xl md:text-2xl text-[#0B1F18]/70 leading-relaxed">
              Automate tip pooling, ensure 100% IRS compliance, and eliminate BOH disputes. The only platform that
              mathematically guarantees fairness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button className="bg-[#26D07C] text-[#0B1F18] hover:bg-[#1FB869] font-semibold shadow-sm">
                Start Free Trial
              </Button>
              <Button variant="ghost" className="text-[#0B1F18] border border-[#0B1F18]/10">
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl bg-white shadow-2xl overflow-hidden border border-[#0B1F18]/5">
              <ImageWithFallback
                src={heroImage}
                alt="Tippd product dashboard preview"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
