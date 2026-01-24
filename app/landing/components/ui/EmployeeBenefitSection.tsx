"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/app/landing/components/figma/ImageWithFallback";
import { Card, CardContent } from "@/app/landing/components/ui/card";
import { useScrollAnimation } from "@/app/landing/hooks/useScrollAnimation";
import { useCountAnimation } from "@/app/landing/hooks/useCountAnimation";
import {
  EyeBenefitIcon,
  CheckmarkIcon,
  ChartUpIcon,
} from "@/app/landing/components/ui/AnimatedBenefitIcons";

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

function BenefitItem({ icon: IconComponent, title, description }: { icon: typeof EyeBenefitIcon; title: string; description: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex gap-3 md:gap-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-shrink-0 size-10 md:size-11 rounded-xl bg-[#E3F5EC] flex items-center justify-center shadow-sm overflow-hidden">
        <IconComponent isHovered={isHovered} />
      </div>
      <div>
        <h3 className="font-display font-semibold text-base md:text-lg text-[#0B1F18] mb-1.5 leading-snug">
          {title}
        </h3>
        <p className="text-[#0B1F18]/65 leading-relaxed text-sm md:text-[15px]">
          {description}
        </p>
      </div>
    </div>
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
              <BenefitStatCard value="Lower" suffix="" label="Turnover" isNumber={false} />
              <BenefitStatCard value="Fewer" suffix="" label="Payout Disputes" isNumber={false} />
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
                Staff Transparency
              </div>

              <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-4 leading-tight">
                When Staff Trust the Numbers, They Stay Longer
              </h2>

              <p className="text-base md:text-lg text-[#0B1F18]/70 leading-relaxed">
                Clear breakdowns stop the questions. Consistent calculations build confidence. Transparency turns arguments into trust.
              </p>
            </div>

            <div className="space-y-4 md:space-y-5">
              <BenefitItem
                icon={EyeBenefitIcon}
                title="See Their Own Breakdown"
                description="Staff can log in and see exactly how their tips were calculated. No more 'trust me, I did the math.'"
              />
              <BenefitItem
                icon={CheckmarkIcon}
                title="Fewer Disputes"
                description="The system shows the work. Point systems, hourly splits, support staff percentages—all visible. No perception that something's off."
              />
              <BenefitItem
                icon={ChartUpIcon}
                title="Built-In Fairness"
                description="The same rules apply every time. No manager variance, no perception that closing gets better tips than lunch."
              />
            </div>

            <Card className="bg-gradient-to-br from-[#26D07C]/10 to-[#D4F49C]/10 border border-[#26D07C]/25 shadow-sm">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start gap-2.5 md:gap-3 mb-1.5">
                  <h4 className="font-display font-semibold text-base md:text-lg text-[#0B1F18] leading-snug">
                    You're Not Moving Money
                  </h4>
                </div>
                <p className="text-[#0B1F18]/70 leading-relaxed text-sm md:text-[15px]">
                  Tippd is the system of record for tip calculations. You still handle payouts however you normally do (cash, Venmo, payroll add-on, etc.). Tippd just makes the math clear, defensible, and trusted.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
