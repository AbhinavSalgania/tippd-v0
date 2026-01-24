"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/landing/components/ui/card";
import { useScrollAnimation } from "@/app/landing/hooks/useScrollAnimation";
import {
  PlugIcon,
  GearIcon,
  BoltIcon,
} from "@/app/landing/components/ui/AnimatedHowItWorksIcons";

type IconComponent = typeof PlugIcon;

const steps: Array<{
  number: string;
  title: string;
  description: string;
  IconComponent: IconComponent;
}> = [
  {
    number: "01",
    title: "Enter Shift Data",
    description: "Type in your sales and tips. Takes 2 minutes. No POS connection needed—manual entry works perfectly. You control what goes in. Nothing automatic you can't verify.",
    IconComponent: PlugIcon,
  },
  {
    number: "02",
    title: "Apply Your House Rules",
    description: "Set up your tip pool structure once. Point systems, hourly splits, support staff percentages—whatever you use today. The math happens instantly. Same rules, every time.",
    IconComponent: GearIcon,
  },
  {
    number: "03",
    title: "Review and Share",
    description: "See the breakdown before anyone else. Approve it. Staff can log in and see exactly how their tips were calculated. No more 'trust me, I did the math.'",
    IconComponent: BoltIcon,
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { IconComponent } = step;
  const [isHovered, setIsHovered] = useState(false);
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${index * 150}ms`,
      }}
    >
      <div className="flex gap-6 md:gap-8 items-start">
        {/* Number indicator */}
        <div className="flex-shrink-0">
          <div className={`size-16 md:size-20 rounded-2xl flex items-center justify-center font-mono-data text-2xl md:text-3xl font-bold ${
            isEven
              ? "bg-gradient-to-br from-[#26D07C] to-[#1FB869] text-white shadow-[0_8px_24px_rgba(38,208,124,0.25)]"
              : "bg-gradient-to-br from-[#D4F49C] to-[#C8E88F] text-[#0B1F18] shadow-[0_8px_24px_rgba(212,244,156,0.3)]"
          }`}>
            {step.number}
          </div>
        </div>

        {/* Content */}
        <Card
          className="flex-1 border-0 shadow-[0_4px_20px_rgba(11,31,24,0.06)] hover:shadow-[0_8px_32px_rgba(11,31,24,0.1)] transition-shadow duration-300 bg-white"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardContent className="p-6 md:p-7">
            <div className="flex items-start gap-4 mb-3">
              <div className="flex-shrink-0">
                <IconComponent isHovered={isHovered} />
              </div>
              <h3 className="font-display font-bold text-2xl md:text-3xl text-[#0B1F18] leading-tight">
                {step.title}
              </h3>
            </div>
            <p className="text-[#0B1F18]/70 leading-relaxed text-base md:text-lg">
              {step.description}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-block px-4 py-1.5 bg-[#E3F5EC] rounded-full text-sm font-semibold text-[#0B1F18] mb-4">
            Simple Process
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-4 leading-tight">
            How It Works
          </h2>
          <p className="text-base md:text-lg text-[#0B1F18]/70 leading-relaxed">
            Three steps. Same process every shift. No surprises.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
