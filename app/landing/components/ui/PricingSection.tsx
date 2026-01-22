import { Button } from "@/app/landing/components/ui/button";
import { Card, CardContent, CardHeader } from "@/app/landing/components/ui/card";
import { Badge } from "@/app/landing/components/ui/badge";

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

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-gradient-to-b from-[#E3F5EC]/30 to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-6 leading-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-[#0B1F18]/70 leading-relaxed">
            Choose the plan that fits your operation. All plans include a 14-day free trial with zero commitment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {plans.map((plan, index) => {
            const isPopular = plan.badge === "Most Popular";
            
            return (
              <Card 
                key={index} 
                className={`relative ${
                  isPopular 
                    ? "border-2 border-[#26D07C] shadow-2xl scale-105 bg-white" 
                    : "border-2 border-[#0B1F18]/5 bg-white"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#26D07C] text-[#0B1F18] hover:bg-[#1FB869] border-0 px-4 py-1.5 font-semibold">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6 pt-8">
                  <h3 className="font-display font-bold text-2xl text-[#0B1F18] mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-[#0B1F18]/60 text-sm mb-6">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    {plan.price !== "Custom" && (
                      <span className="font-display text-2xl text-[#0B1F18]/60">$</span>
                    )}
                    <span className="font-mono-data text-6xl font-bold text-[#0B1F18]">
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-[#0B1F18]/60 font-medium">/month</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 px-6 pb-8">
                  <Button 
                    className={`w-full py-6 font-semibold ${
                      isPopular 
                        ? "bg-[#26D07C] text-[#0B1F18] hover:bg-[#1FB869]" 
                        : "bg-[#0B1F18] text-white hover:bg-[#0B1F18]/90"
                    }`}
                    size="lg"
                  >
                    {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                  </Button>

                  <ul className="space-y-3 pt-4">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <svg 
                          className="size-5 text-[#26D07C] flex-shrink-0 mt-0.5" 
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
                        <span className="text-[#0B1F18]/70 text-sm leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-[#0B1F18]/50 leading-relaxed">
            All plans include 14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
