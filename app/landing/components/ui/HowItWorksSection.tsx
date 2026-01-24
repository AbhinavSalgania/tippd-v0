"use client";

import { Card, CardContent } from "@/app/landing/components/ui/card";
import { useScrollAnimation } from "@/app/landing/hooks/useScrollAnimation";

const steps: Array<{
  number: string;
  title: string;
  description: string;
  secondary: string;
}> = [
  {
    number: "01",
    title: "Enter Shift Data",
    description: "Type in your sales and tips. Takes 2 minutes. No POS connection needed—manual entry works perfectly.",
    secondary: "You control what goes in. Nothing automatic you can't verify.",
  },
  {
    number: "02",
    title: "Apply Your House Rules",
    description: "Set up your tip pool structure once. Point systems, hourly splits, support staff percentages—whatever you use today.",
    secondary: "The math happens instantly. Same rules, every time.",
  },
  {
    number: "03",
    title: "Review and Share",
    description: "See the breakdown before anyone else. Approve it. Staff can log in and see exactly how their tips were calculated.",
    secondary: "You stay in control. They get transparency.",
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

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
      <Card className="border-0 bg-[#F7FAF8] shadow-none">
        <CardContent className="p-8 md:p-10">
          <div className="flex items-start gap-6">
            {/* Number badge */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-[#26D07C]/10 flex items-center justify-center">
                <span className="font-mono text-lg font-semibold text-[#26D07C]">
                  {step.number}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-display font-bold text-xl md:text-2xl text-black mb-3 leading-tight">
                {step.title}
              </h3>
              <p className="text-[#0B1F18]/80 leading-relaxed text-base mb-2">
                {step.description}
              </p>
              <p className="text-[#0B1F18]/50 leading-relaxed text-sm">
                {step.secondary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
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

        <div className="max-w-4xl mx-auto space-y-5 md:space-y-6">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>

        {/* POS integration message */}
        <div className="max-w-4xl mx-auto mt-8 md:mt-10 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E3F5EC] rounded-full">
            <svg
              className="w-4 h-4 text-[#26D07C]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-[#0B1F18]/70">
              POS integrations (Toast, Square, Clover) coming soon—but not required to get started.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
