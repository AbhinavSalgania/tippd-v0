"use client";

import { Button } from "@/app/landing/components/ui/button";
import { Input } from "@/app/landing/components/ui/input";
import { useCountAnimation } from "@/app/landing/hooks/useCountAnimation";

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, count } = useCountAnimation({ end: value, duration: 2000 });

  return (
    <div ref={ref}>
      <div className="font-mono-data text-3xl md:text-4xl font-bold mb-1.5">
        {count}{suffix}
      </div>
      <div className="text-[#0B1F18]/75 font-medium text-sm">{label}</div>
    </div>
  );
}

export function CTASection() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-[#26D07C] to-[#1FB869] text-[#0B1F18] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.2),transparent_50%)] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-5 leading-tight">
            Try It. See If It Works for You.
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-[#0B1F18]/80 mb-8 md:mb-10 leading-relaxed">
            No sales call required. No credit card. Set up your first shift and see if Tippd fits your operation.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-xl mx-auto mb-6 md:mb-8">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white border-0 h-12 md:h-14 text-base md:text-lg text-[#0B1F18] placeholder:text-[#0B1F18]/40 shadow-[0_4px_20px_rgba(11,31,24,0.15)]"
            />
            <Button
              variant="ghost"
              size="lg"
              className="!bg-[#0B1F18] !text-white hover:!bg-[#0B1F18]/90 h-12 md:h-14 px-7 md:px-8 whitespace-nowrap font-semibold shadow-[0_4px_20px_rgba(11,31,24,0.25)] text-[15px] md:text-base"
            >
              Start Free Trial
              <svg
                className="ml-2 size-4 md:size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Button>
          </div>

          <p className="text-[#0B1F18]/70 text-sm mb-10 md:mb-12">
            Free for 14 days • No credit card • Cancel anytime
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6 pt-10 md:pt-12 border-t border-[#0B1F18]/10">
            <StatCard value={2} suffix=" min" label="To enter a shift" />
            <StatCard value={10} suffix=" min" label="To set up your account" />
            <StatCard value={0} suffix="" label="Integrations required" />
          </div>
        </div>
      </div>
    </section>
  );
}
