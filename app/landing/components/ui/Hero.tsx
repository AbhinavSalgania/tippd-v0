"use client";

import { ImageWithFallback } from "@/app/landing/components/figma/ImageWithFallback";
import { Button } from "@/app/landing/components/ui/button";
import { AnimatedCheckmark } from "@/app/landing/components/ui/AnimatedCheckmark";
import { useParallax } from "@/app/landing/hooks/useParallax";

const heroImage = "/landing/assets/tippdhero.png";

export function Hero() {
  const cardParallax = useParallax({ speed: -0.05 });
  return (
    <section className="relative overflow-hidden pt-20 md:pt-24 pb-12 md:pb-16 min-h-[85vh] md:min-h-[90vh] flex items-center bg-gradient-to-b from-[#E3F5EC]/45 to-white">
      <div className="pointer-events-none absolute -top-24 left-0 h-[600px] w-[600px] bg-[radial-gradient(circle_at_30%_20%,rgba(38,208,124,0.18),rgba(38,208,124,0)_60%)] blur-3xl" />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 md:space-y-7 lg:pr-6">
            <h1 className="max-w-[560px] font-display font-bold text-5xl md:text-6xl lg:text-7xl text-[#0B1F18] leading-[1.08] tracking-[-0.02em]">
              The Financial Operating System for Hospitality
            </h1>
            <p className="max-w-[540px] text-lg md:text-xl text-[#0B1F18]/70 leading-relaxed">
              Stop losing your best staff to tip disputes. Mathematical fairness that employees trust and managers love.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-0">
              <Button className="h-11 rounded-full bg-[#26D07C] px-7 text-[#0B1F18] hover:bg-[#1FB869] font-semibold shadow-[0_8px_24px_rgba(38,208,124,0.3)] text-[15px]">
                Start Free Trial
              </Button>
              <Button
                variant="ghost"
                className="h-11 rounded-full border border-[#0B1F18]/20 px-7 text-[#0B1F18] hover:bg-[#0B1F18]/5 text-[15px]"
              >
                See It In Action
              </Button>
            </div>
            <p className="text-sm text-[#0B1F18]/50 -mt-1">
              No credit card required • Set up in 5 minutes • Cancel anytime
            </p>
            <div className="pt-6 border-t border-[#0B1F18]/5">
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
          <div className="relative lg:pl-4">
            <div
              className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(11,31,24,0.2)] ring-1 ring-black/5"
              style={{
                transform: "perspective(1200px) rotateY(-5deg) rotateX(2deg)",
                transformStyle: "preserve-3d",
              }}
            >
              <ImageWithFallback
                src={heroImage}
                alt="Tippd Dashboard showing employee earnings"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5 pointer-events-none" />
            </div>
            <div
              className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-white rounded-xl shadow-[0_12px_40px_rgba(11,31,24,0.15)] p-4 md:p-5 border border-[#0B1F18]/5 max-w-[280px] md:max-w-xs"
              style={{
                transform: `perspective(1200px) rotateY(-3deg) ${cardParallax.transform}`,
                transformStyle: "preserve-3d",
                transition: "transform 0.3s ease-out",
              }}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="size-10 md:size-12 bg-gradient-to-br from-[#26D07C] to-[#1FB869] rounded-full flex items-center justify-center flex-shrink-0">
                  <AnimatedCheckmark className="size-5 md:size-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-[#0B1F18] mb-0.5 text-sm md:text-base">Shift Closed</div>
                  <div className="text-xs md:text-sm text-[#0B1F18]/60">
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
