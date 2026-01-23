import { ImageWithFallback } from "@/app/landing/components/figma/ImageWithFallback";
import { Button } from "@/app/landing/components/ui/button";

const heroImage = "/landing/assets/tippdhero.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 md:pt-32 pb-20 md:pb-28 bg-gradient-to-b from-[#E3F5EC]/45 to-white">
      <div className="pointer-events-none absolute -top-24 left-0 h-[600px] w-[600px] bg-[radial-gradient(circle_at_30%_20%,rgba(38,208,124,0.18),rgba(38,208,124,0)_60%)] blur-3xl" />
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 md:space-y-10 lg:pr-6">
            <h1 className="max-w-[560px] font-display font-bold text-6xl md:text-7xl lg:text-8xl text-[#0B1F18] leading-[1.05] tracking-[-0.02em]">
              The Financial Operating System for Hospitality
            </h1>
            <p className="max-w-[560px] text-xl md:text-2xl text-[#0B1F18]/70 leading-relaxed">
              Automate tip pooling, ensure 100% IRS compliance, and eliminate BOH disputes. The only platform that
              mathematically guarantees fairness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              <Button className="h-12 rounded-full bg-[#26D07C] px-8 text-[#0B1F18] hover:bg-[#1FB869] font-semibold shadow-[0_12px_30px_rgba(38,208,124,0.35)]">
                Start Free Trial
              </Button>
              <Button
                variant="ghost"
                className="h-12 rounded-full border border-[#0B1F18]/20 px-8 text-[#0B1F18] hover:bg-[#0B1F18]/5"
              >
                Request Demo
              </Button>
            </div>
            <p className="text-sm text-[#0B1F18]/50">
              No credit card required • Set up in 5 minutes • Cancel anytime
            </p>
            <div className="pt-8 border-t border-[#0B1F18]/5">
              <p className="text-xs font-semibold text-[#0B1F18]/50 uppercase tracking-wide mb-4">
                Deep-Stack Integration With
              </p>
              <div className="flex flex-wrap items-center gap-6 md:gap-8">
                {["Toast", "Square", "Clover", "Lightspeed"].map((pos) => (
                  <span key={pos} className="text-[#0B1F18]/40 font-semibold text-sm">
                    {pos}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="relative">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5"
              style={{
                transform: "perspective(1200px) rotateY(-5deg) rotateX(2deg)",
                transformStyle: "preserve-3d",
              }}
            >
              <ImageWithFallback
                src={heroImage}
                alt="Tippd Dashboard showing employee earnings"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5 pointer-events-none" />
            </div>
            <div
              className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-2xl p-5 border border-[#0B1F18]/5 max-w-xs"
              style={{
                transform: "perspective(1200px) rotateY(-3deg)",
                transformStyle: "preserve-3d",
              }}
            >
              <div className="flex items-center gap-4">
                <div className="size-12 bg-gradient-to-br from-[#26D07C] to-[#1FB869] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-[#0B1F18] mb-0.5">Shift Closed</div>
                  <div className="text-sm text-[#0B1F18]/60">
                    <span className="font-mono-data text-[#26D07C] font-semibold">$450.00</span> distributed to 5 staff
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
