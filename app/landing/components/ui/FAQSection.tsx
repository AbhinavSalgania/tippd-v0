"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/landing/components/ui/card";
import { useScrollAnimation } from "@/app/landing/hooks/useScrollAnimation";

const faqs = [
  {
    question: "How long does it take to set up Tippd?",
    answer: "Most restaurants are fully operational within 5 minutes. Connect your POS, set your tip distribution rules once, and you're ready to go. No lengthy training or complex configuration required.",
  },
  {
    question: "Does Tippd integrate with my existing POS system?",
    answer: "Yes! We have one-click integrations with Toast, Square, Clover, and Lightspeed. You can also manually upload data via CSV if your POS isn't directly integrated yet.",
  },
  {
    question: "What happens if there's a mistake in the calculation?",
    answer: "Tippd's calculations are mathematically guaranteed to be accurate based on your rules. However, you can always review and adjust before finalizing. All changes are tracked in the audit trail for complete transparency.",
  },
  {
    question: "Is my tip data secure and compliant?",
    answer: "Absolutely. We're SOC 2 Type II certified and fully compliant with IRS Form 8027 requirements. All data is encrypted in transit and at rest, and we never sell or share your information.",
  },
  {
    question: "Can employees see how their tips are calculated?",
    answer: "Yes! Complete transparency is core to Tippd. Employees can log in anytime to see their exact tip breakdown, including how pooling percentages were applied and hours worked. This eliminates disputes before they start.",
  },
  {
    question: "What if I have custom tip pooling rules?",
    answer: "Tippd is designed to handle complex, multi-tier tip pooling scenarios. FOH/BOH splits, role-based percentages, seniority tiers — we've got you covered. Our team will help configure your exact rules during onboarding.",
  },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <Card className="border border-[#0B1F18]/10 hover:border-[#26D07C]/30 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(11,31,24,0.08)] bg-white">
        <CardContent className="p-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left p-5 md:p-6 flex items-start justify-between gap-4"
          >
            <span className="font-display font-semibold text-base md:text-lg text-[#0B1F18] leading-snug pr-4">
              {faq.question}
            </span>
            <svg
              className={`size-5 md:size-6 text-[#26D07C] flex-shrink-0 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isOpen ? "max-h-96" : "max-h-0"
            }`}
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
              <p className="text-[#0B1F18]/70 leading-relaxed text-sm md:text-base">
                {faq.answer}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FAQSection() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-[#E3F5EC]/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-block px-4 py-1.5 bg-[#D4F49C] rounded-full text-sm font-semibold text-[#0B1F18] mb-4">
            Questions?
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-4 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base md:text-lg text-[#0B1F18]/70 leading-relaxed">
            Everything you need to know about Tippd. Can't find what you're looking for?{" "}
            <a href="#" className="text-[#26D07C] font-semibold hover:underline">
              Chat with our team
            </a>
            .
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="text-center mt-10 md:mt-12">
          <Card className="bg-gradient-to-br from-[#26D07C]/10 to-[#D4F49C]/10 border border-[#26D07C]/20 max-w-2xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <h3 className="font-display font-bold text-xl md:text-2xl text-[#0B1F18] mb-3">
                Still have questions?
              </h3>
              <p className="text-[#0B1F18]/70 mb-5">
                Our team is here to help you get started. Schedule a 15-minute demo to see how Tippd can work for your restaurant.
              </p>
              <a
                href="#"
                className="inline-flex items-center justify-center h-11 rounded-full bg-[#26D07C] px-7 text-[#0B1F18] hover:bg-[#1FB869] font-semibold shadow-[0_8px_24px_rgba(38,208,124,0.3)] text-[15px] transition-all"
              >
                Schedule a Demo
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
