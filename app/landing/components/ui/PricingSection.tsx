"use client";

import { Button } from "@/app/landing/components/ui/button";
import { Card, CardContent, CardHeader } from "@/app/landing/components/ui/card";
import { Badge } from "@/app/landing/components/ui/badge";
import { useScrollAnimation } from "@/app/landing/hooks/useScrollAnimation";

const plans = [
  {
    name: "Starter",
    description: "Perfect for single-location restaurants",
    price: "29",
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
    description: "For growing multi-location groups",
    price: "59",
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
    description: "For large hospitality groups",
    price: "Custom",
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

function PricingCard({ plan, index }: { plan: typeof plans[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const isPopular = plan.badge === "Most Popular";

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
            ? "border-2 border-[#26D07C] shadow-[0_8px_40px_-5px_rgba(0,0,0,0.3),0_20px_50px_-10px_rgba(0,0,0,0.2),-15px_0_40px_-15px_rgba(0,0,0,0.15),15px_0_40px_-15px_rgba(0,0,0,0.15)] md:scale-105 bg-white"
            : "border border-[#0B1F18]/8 shadow-[0_4px_24px_rgba(11,31,24,0.06)] bg-white"
        }`}
      >
        {plan.badge && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-[#26D07C] text-[#0B1F18] hover:bg-[#1FB869] border-0 px-3 py-1 text-xs font-semibold">
              {plan.badge}
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-3 md:pb-4 pt-5 md:pt-6">
          <h3 className="font-display font-bold text-xl md:text-2xl text-[#0B1F18] mb-1">
            {plan.name}
          </h3>
          <p className="text-[#0B1F18]/65 text-xs md:text-sm mb-3 md:mb-4">
            {plan.description}
          </p>
          <div className="flex items-baseline justify-center gap-0.5">
            {plan.price !== "Custom" && (
              <span className="font-display text-base md:text-lg text-[#0B1F18]/60">$</span>
            )}
            <span className="font-mono-data text-3xl md:text-4xl font-bold text-[#0B1F18]">
              {plan.price}
            </span>
            {plan.price !== "Custom" && (
              <span className="text-[#0B1F18]/60 font-medium text-xs">/month</span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 md:space-y-4 px-4 md:px-5 pb-5 md:pb-6">
          <Button
            variant="ghost"
            className={`w-full py-3 md:py-3.5 font-semibold text-xs md:text-sm ${
              isPopular
                ? "!bg-[#26D07C] !text-[#0B1F18] hover:!bg-[#1FB869] shadow-[0_4px_16px_rgba(38,208,124,0.25)]"
                : "!bg-[#0B1F18] !text-white hover:!bg-[#0B1F18]/90 shadow-[0_4px_16px_rgba(11,31,24,0.15)]"
            }`}
            size="default"
          >
            {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
          </Button>

          <ul className="space-y-2 md:space-y-2.5 pt-1.5 md:pt-2">
            {plan.features.map((feature, fIndex) => (
              <li key={fIndex} className="flex items-start gap-2 md:gap-2.5">
                <svg
                  className="size-3.5 text-[#26D07C] flex-shrink-0 mt-0.5"
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
                <span className="text-[#0B1F18]/70 text-xs md:text-sm leading-relaxed">
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
  return (
    <section id="pricing" className="py-12 md:py-16 bg-gradient-to-b from-[#E3F5EC]/30 to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-block px-4 py-1.5 bg-[#E3F5EC] rounded-full text-sm font-semibold text-[#0B1F18] mb-4">
            Early Access
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-4 leading-tight">
            Pricing That Makes Sense
          </h2>
          <p className="text-base md:text-lg text-[#0B1F18]/70 leading-relaxed">
            Pay monthly. Cancel anytime. Priced based on how many people you're calculating tips for—not complicated tiers or hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto mb-8 md:mb-10">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
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
