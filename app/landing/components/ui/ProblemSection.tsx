"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/landing/components/ui/card";
import { useScrollAnimation } from "@/app/landing/hooks/useScrollAnimation";
import {
  BarChartIcon,
  ScaleIcon,
  ClockIcon,
  DoorIcon,
  MoneyWingsIcon,
} from "@/app/landing/components/ui/AnimatedProblemIcons";

type IconComponent = typeof BarChartIcon;

const problems: Array<{
  title: string;
  description: string;
  IconComponent: IconComponent;
}> = [
  {
    title: "Manual Calculation Errors",
    description: "Hours spent on spreadsheets leading to countless mistakes and frustrated staff questioning accuracy.",
    IconComponent: BarChartIcon,
  },
  {
    title: "Wage Disputes",
    description: "Constant questions about distribution fairness creating tension, mistrust, and operational friction.",
    IconComponent: ScaleIcon,
  },
  {
    title: "Wasted Managerial Bandwidth",
    description: "Managers spending 2+ hours per shift on tip math instead of focusing on operations and guest experience.",
    IconComponent: ClockIcon,
  },
  {
    title: "Staff Turnover",
    description: "Top performers leaving due to perceived inequity in tip distribution, costing you recruitment and training.",
    IconComponent: DoorIcon,
  },
  {
    title: "Payroll Integration Pain",
    description: "Manual data entry errors when transferring tip data to your payroll system, multiplying mistakes.",
    IconComponent: MoneyWingsIcon,
  },
];

function ProblemCard({ problem, index }: { problem: typeof problems[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { IconComponent } = problem;
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
      <Card className="border border-[#0B1F18]/8 hover:border-[#26D07C]/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(11,31,24,0.08)] bg-white group h-full">
        <CardContent className="p-5 md:p-6">
          <div className="mb-3 group-hover:scale-105 transition-transform duration-300 inline-block">
            <IconComponent isHovered={isHovered} />
          </div>
          <h3 className="font-display font-semibold text-base md:text-lg text-[#0B1F18] mb-2 leading-snug">
            {problem.title}
          </h3>
          <p className="text-[#0B1F18]/65 leading-relaxed text-sm md:text-[15px]">
            {problem.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProblemSection() {
  return (
    <section className="py-12 md:py-16 bg-white relative">
      {/* Visual separator from Hero */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#26D07C]/20 to-transparent"></div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          {/* Tension stat */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200/50 rounded-full mb-5">
            <span className="text-red-600 font-semibold text-sm md:text-base">
              Manual tip distribution is the #1 reason servers quit within 90 days
            </span>
          </div>

          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-4 leading-tight">
            Spreadsheets Are Costing You Your Best Staff
          </h2>
          <p className="text-base md:text-lg text-[#0B1F18]/70 leading-relaxed">
            Managing tip distribution shouldn't be the hardest part of your day
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5 max-w-7xl mx-auto">
          {problems.map((problem, index) => (
            <ProblemCard key={index} problem={problem} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
