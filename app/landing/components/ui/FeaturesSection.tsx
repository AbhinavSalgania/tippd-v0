"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/app/landing/components/figma/ImageWithFallback";
import { Card, CardContent } from "@/app/landing/components/ui/card";
import { AnimatedStatCard } from "@/app/landing/components/ui/AnimatedStatCard";
import { useScrollAnimation } from "@/app/landing/hooks/useScrollAnimation";
import {
  LightningIcon,
  TargetIcon,
  EyeIcon,
  LockIcon,
} from "@/app/landing/components/ui/AnimatedFeatureIcons";

const serviceDayImage = "/landing/assets/service-day.png";
const summaryImage = "/landing/assets/summary.png";

type IconComponent = typeof LightningIcon;

const features: Array<{
  title: string;
  description: string;
  IconComponent: IconComponent;
  span: string;
}> = [
  {
    title: "Manager Approval",
    description: "You review every result before staff sees it. Approve or edit—you control when it goes out.",
    IconComponent: TargetIcon,
    span: "col-span-1",
  },
  {
    title: "Consistent Calculations",
    description: "Your house rules, applied the same way every shift. No manager variance.",
    IconComponent: LightningIcon,
    span: "col-span-1",
  },
  {
    title: "Staff Transparency",
    description: "Everyone logs in and sees exactly how their tips were calculated. Kills the \"how did you get that number?\" conversation.",
    IconComponent: EyeIcon,
    span: "col-span-1",
  },
  {
    title: "Audit Trail",
    description: "Every shift generates a record you can show to staff, payroll, or your accountant. No more recreating the math months later.",
    IconComponent: LockIcon,
    span: "col-span-1",
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { IconComponent } = feature;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${index * 80}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="bg-white border-0 shadow-[0_2px_16px_rgba(11,31,24,0.06)] hover:shadow-[0_8px_30px_rgba(11,31,24,0.12)] transition-all duration-300 group h-full">
        <CardContent className="p-5 md:p-6 pt-6 md:pt-6">
          <div className="mb-3 group-hover:scale-105 transition-transform duration-300 inline-block">
            <IconComponent isHovered={isHovered} />
          </div>
          <h3 className="font-display font-semibold text-base md:text-lg text-[#0B1F18] mb-2 leading-snug">
            {feature.title}
          </h3>
          <p className="text-[#0B1F18]/65 leading-relaxed text-sm md:text-[15px]">
            {feature.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function VisualCard({ title, description, image, alt, index }: { title: string; description: string; image: string; alt: string; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <Card className="bg-white border-0 shadow-[0_4px_24px_rgba(11,31,24,0.08)] overflow-hidden hover:shadow-[0_8px_40px_rgba(11,31,24,0.12)] transition-shadow duration-300 h-full">
        <CardContent className="p-0">
          <div className="p-5 md:p-6 bg-[#E3F5EC]/50">
            <h3 className="font-display font-semibold text-lg md:text-xl text-[#0B1F18] mb-1.5 leading-snug">
              {title}
            </h3>
            <p className="text-[#0B1F18]/65 text-sm md:text-[15px] leading-relaxed">
              {description}
            </p>
          </div>
          <div className="relative">
            <ImageWithFallback
              src={image}
              alt={alt}
              className="w-full h-auto"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 md:py-16 bg-[#E3F5EC]/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-4 leading-tight">
            The Single Source of Truth for Tips
          </h2>
          <p className="text-base md:text-lg text-[#0B1F18]/70 leading-relaxed">
            One system. Clear rules. No arguments.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="max-w-7xl mx-auto">
          {/* Top row - Feature cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-4 md:mb-5">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>

          {/* Bottom row - Large visual cards */}
          <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
            <VisualCard
              title="Daily Workflow Dashboard"
              description="Enter shift data in under 2 minutes. Review calculations for FOH and BOH before approving."
              image={serviceDayImage}
              alt="Service day entry interface"
              index={0}
            />
            <VisualCard
              title="Payroll-Ready Exports"
              description="Exports formatted for payroll systems like QuickBooks, ADP, and others."
              image={summaryImage}
              alt="Summary export interface"
              index={1}
            />
          </div>

          {/* Stats row */}
          <div className="text-center mb-4 mt-6">
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            <AnimatedStatCard value={90} suffix="%" label="Time Saved vs. Spreadsheets" variant="green" />
            <AnimatedStatCard value={2} suffix=" min" label="Average Processing Time" variant="yellow" />
            <AnimatedStatCard value={100} suffix="%" label="IRS Compliant" variant="white" />
          </div>
        </div>
      </div>
    </section>
  );
}
