"use client";

import { ImageWithFallback } from "@/app/landing/components/figma/ImageWithFallback";
import { Card, CardContent } from "@/app/landing/components/ui/card";
import { useScrollAnimation } from "@/app/landing/hooks/useScrollAnimation";
import { useCountAnimation } from "@/app/landing/hooks/useCountAnimation";

const employeeDashboard = "/landing/assets/employee-dashboard.png";

function BenefitStatCard({ value, suffix, label, isNumber = true }: { value: number | string; suffix: string; label: string; isNumber?: boolean }) {
  const { ref, count } = useCountAnimation({ end: typeof value === "number" ? value : 0, duration: 2000 });

  return (
    <Card className="bg-[#E3F5EC] border-0 shadow-[0_2px_12px_rgba(11,31,24,0.04)]">
      <CardContent className="p-5 md:p-6 text-center">
        <div ref={ref} className="font-mono-data text-3xl md:text-4xl font-bold text-[#26D07C] mb-1">
          {isNumber ? `${count}${suffix}` : value}
        </div>
        <div className="text-sm md:text-[15px] text-[#0B1F18]/70 font-medium">{label}</div>
      </CardContent>
    </Card>
  );
}

export function EmployeeBenefitSection() {
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.2 });
  return (
    <section id="benefits" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {/* Left: Visual */}
          <div
            ref={imageRef}
            className="order-2 lg:order-1 transition-all duration-700 ease-out"
            style={{
              opacity: imageVisible ? 1 : 0,
              transform: imageVisible ? "translateX(0)" : "translateX(-30px)",
            }}
          >
            <Card className="overflow-hidden border-0 shadow-[0_8px_40px_rgba(11,31,24,0.12)]">
              <CardContent className="p-0">
                <ImageWithFallback
                  src={employeeDashboard}
                  alt="Employee view of tip breakdown"
                  className="w-full h-auto"
                />
              </CardContent>
            </Card>

            {/* Floating stat cards */}
            <div className="mt-5 md:mt-6 grid grid-cols-2 gap-4 md:gap-5">
              <BenefitStatCard value={40} suffix="%" label="Lower Turnover" isNumber={true} />
              <BenefitStatCard value="Zero" suffix="" label="Payout Disputes" isNumber={false} />
            </div>
          </div>

          {/* Right: Content */}
          <div
            ref={contentRef}
            className="space-y-6 md:space-y-7 order-1 lg:order-2 transition-all duration-700 ease-out"
            style={{
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? "translateX(0)" : "translateX(30px)",
            }}
          >
            <div>
              <div className="inline-block px-4 py-1.5 bg-[#D4F49C] rounded-full text-sm font-semibold text-[#0B1F18] mb-4">
                Your Team Will Love It Too
              </div>

              <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-4 leading-tight">
                Build Trust, Reduce Turnover, Keep Your Best Staff
              </h2>

              <p className="text-base md:text-lg text-[#0B1F18]/70 leading-relaxed">
                When your employees see exactly how their tips are calculated, they trust you more. And when they trust you, they stay longer.
              </p>
            </div>

            <div className="space-y-4 md:space-y-5">
              <div className="flex gap-3 md:gap-4">
                <div className="flex-shrink-0 size-10 md:size-11 rounded-xl bg-[#E3F5EC] flex items-center justify-center text-lg md:text-xl shadow-sm">
                  👁️
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base md:text-lg text-[#0B1F18] mb-1.5 leading-snug">
                    Complete Transparency
                  </h3>
                  <p className="text-[#0B1F18]/65 leading-relaxed text-sm md:text-[15px]">
                    Staff can see their individual tip breakdown anytime, eliminating questions and building confidence in your management.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 md:gap-4">
                <div className="flex-shrink-0 size-10 md:size-11 rounded-xl bg-[#E3F5EC] flex items-center justify-center text-lg md:text-xl shadow-sm">
                  ✅
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base md:text-lg text-[#0B1F18] mb-1.5 leading-snug">
                    Zero Disputes
                  </h3>
                  <p className="text-[#0B1F18]/65 leading-relaxed text-sm md:text-[15px]">
                    No more "why did I get less than yesterday?" Mathematical clarity means zero arguments at shift end.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 md:gap-4">
                <div className="flex-shrink-0 size-10 md:size-11 rounded-xl bg-[#E3F5EC] flex items-center justify-center text-lg md:text-xl shadow-sm">
                  📈
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base md:text-lg text-[#0B1F18] mb-1.5 leading-snug">
                    Higher Retention
                  </h3>
                  <p className="text-[#0B1F18]/65 leading-relaxed text-sm md:text-[15px]">
                    Fair, transparent tip distribution increases retention rates by 40% on average. Happy staff = better service.
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-[#26D07C]/10 to-[#D4F49C]/10 border border-[#26D07C]/25 shadow-sm">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start gap-2.5 md:gap-3 mb-1.5">
                  <span className="text-lg md:text-xl">💡</span>
                  <h4 className="font-display font-semibold text-base md:text-lg text-[#0B1F18] leading-snug">
                    Staff Satisfaction = Better Service
                  </h4>
                </div>
                <p className="text-[#0B1F18]/70 leading-relaxed text-sm md:text-[15px] pl-7 md:pl-8">
                  Happy, trusted employees provide better customer experiences. Better service means higher tips and repeat customers. It's a compounding advantage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
