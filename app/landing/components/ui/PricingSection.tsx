"use client";

import { useState } from "react";
import { Button } from "@/app/landing/components/ui/button";
import { Card, CardContent, CardHeader } from "@/app/landing/components/ui/card";
import { Badge } from "@/app/landing/components/ui/badge";
import { useScrollAnimation } from "@/app/landing/hooks/useScrollAnimation";

const plans = [
  {
    name: "Starter",
    price: "49",
    description: "Perfect for single-location restaurants",
    badge: null,
    features: [
      "Up to 15 employees",
      "Unlimited service periods",
      "Automated reconciliation",
      "Employee transparency portal",
      "Basic reporting & analytics",
      "Email support",
      "IRS 8027 compliance",
      "Mobile app access",
    ],
  },
  {
    name: "Professional",
    price: "99",
    description: "For growing multi-location groups",
    badge: "Most Popular",
    features: [
      "Up to 50 employees",
      "Everything in Starter",
      "Multi-location management",
      "Advanced analytics dashboard",
      "Priority support",
      "Payroll system integration",
      "Custom tip distribution rules",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large hospitality groups",
    badge: null,
    features: [
      "Unlimited employees & locations",
      "Everything in Professional",
      "Dedicated account manager",
      "Custom integrations",
      "White-label options",
      "On-site training",
      "99.9% uptime SLA",
      "Advanced security features",
    ],
  },
];

function PricingCard({ plan, index, isAnnual }: { plan: typeof plans[0]; index: number; isAnnual: boolean }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const isPopular = plan.badge === "Most Popular";

  const getPrice = () => {
    if (plan.price === "Custom") return "Custom";
    const monthlyPrice = parseInt(plan.price);
    return isAnnual ? Math.round(monthlyPrice * 0.8).toString() : plan.price;
  };

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <Card
        className={`relative ${
          isPopular
            ? "border-2 border-[#26D07C] shadow-[0_12px_48px_rgba(38,208,124,0.15)] md:scale-105 bg-white animate-[pulse_3s_ease-in-out_infinite]"
            : "border border-[#0B1F18]/8 shadow-[0_4px_24px_rgba(11,31,24,0.06)] bg-white"
        }`}
      >
        {plan.badge && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <Badge className="bg-[#26D07C] text-[#0B1F18] hover:bg-[#1FB869] border-0 px-4 py-1.5 font-semibold">
              {plan.badge}
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-4 md:pb-5 pt-7 md:pt-8">
          <h3 className="font-display font-bold text-2xl md:text-3xl text-[#0B1F18] mb-1.5">
            {plan.name}
          </h3>
          <p className="text-[#0B1F18]/65 text-sm md:text-[15px] mb-4 md:mb-5">
            {plan.description}
          </p>
          <div className="flex items-baseline justify-center gap-1">
            {plan.price !== "Custom" && (
              <span className="font-display text-lg md:text-xl text-[#0B1F18]/60">$</span>
            )}
            <span className="font-mono-data text-4xl md:text-5xl font-bold text-[#0B1F18]">
              {getPrice()}
            </span>
            {plan.price !== "Custom" && (
              <span className="text-[#0B1F18]/60 font-medium text-sm">/month</span>
            )}
          </div>
          {isAnnual && plan.price !== "Custom" && (
            <p className="text-xs text-[#26D07C] font-semibold mt-2">
              Save 20% with annual billing
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4 md:space-y-5 px-5 md:px-6 pb-7 md:pb-8">
          <Button
            className={`w-full py-4 md:py-5 font-semibold text-sm md:text-base ${
              isPopular
                ? "bg-[#26D07C] text-[#0B1F18] hover:bg-[#1FB869] shadow-[0_4px_16px_rgba(38,208,124,0.25)]"
                : "bg-[#0B1F18] text-white hover:bg-[#0B1F18]/90"
            }`}
            size="lg"
          >
            {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
          </Button>

          <ul className="space-y-2.5 md:space-y-3 pt-2 md:pt-3">
            {plan.features.map((feature, fIndex) => (
              <li key={fIndex} className="flex items-start gap-2.5 md:gap-3">
                <svg
                  className="size-4 text-[#26D07C] flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-[#0B1F18]/70 text-sm md:text-[15px] leading-relaxed">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-12 md:py-16 bg-gradient-to-b from-[#E3F5EC]/30 to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-4 leading-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-base md:text-lg text-[#0B1F18]/70 leading-relaxed mb-6">
            Choose the plan that fits your operation. All plans include a 14-day free trial with zero commitment.
          </p>

          {/* Annual Toggle */}
          <div className="inline-flex items-center gap-3 bg-white rounded-full p-1.5 shadow-sm border border-[#0B1F18]/10">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                !isAnnual
                  ? "bg-[#26D07C] text-[#0B1F18]"
                  : "text-[#0B1F18]/60 hover:text-[#0B1F18]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                isAnnual
                  ? "bg-[#26D07C] text-[#0B1F18]"
                  : "text-[#0B1F18]/60 hover:text-[#0B1F18]"
              }`}
            >
              Annual
              <span className="ml-1.5 text-xs bg-[#D4F49C] px-2 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 max-w-7xl mx-auto mb-8 md:mb-10">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} isAnnual={isAnnual} />
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-[#0B1F18]/50 leading-relaxed">
            All plans include 14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
