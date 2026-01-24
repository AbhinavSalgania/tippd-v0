"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/landing/components/ui/card";
import { useScrollAnimation } from "@/app/landing/hooks/useScrollAnimation";

const faqs = [
  {
    question: "Do I need POS integration to use Tippd?",
    answer: "No. You can enter shift data manually in under 2 minutes. POS integrations (Toast, Square, Clover) are on the roadmap, but they're optional—not required to get started.",
  },
  {
    question: "Does Tippd pay my employees?",
    answer: "No. Tippd is the system of record for tip calculations. You still handle payouts however you normally do (cash, Venmo, payroll add-on, etc.). Tippd just makes the math clear, defensible, and trusted.",
  },
  {
    question: "What if there's a mistake in the calculation?",
    answer: "You review and approve every result before staff sees it. If something's wrong, you can edit the shift and recalculate. The system stores the original and the corrections—full audit trail.",
  },
  {
    question: "How long does setup take?",
    answer: "About 10 minutes. Add your staff, set up your tip pool rules (percentages, points, whatever you use), and you're done. First shift takes 5 minutes. After that, it's routine.",
  },
  {
    question: "What if my tip structure is complicated?",
    answer: "Most structures work fine. Point-based pools, weighted hourly splits, tiered support staff, bartender overrides—we've seen it. If you're not sure, reach out and we'll walk through your setup.",
  },
  {
    question: "Can I try it before committing?",
    answer: "Yes. 14-day trial. No credit card required. Set up your first shift and see if Tippd fits your operation. If it doesn't work for you, cancel anytime—no questions asked.",
  },
  {
    question: "Do employees need accounts?",
    answer: "Only if you want them to see their breakdowns. Staff can log in to its history and calculations, or you can just share results manually. They don't need access to use the system.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. Bank-level encryption (256-bit AES), SOC 2 Type II certified, and GDPR compliant. Your tip data and employee info are protected the same way financial institutions handle sensitive records.",
  },
];

function FAQItem({
  faq,
  index,
  isOpen,
  onToggle
}: {
  faq: typeof faqs[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
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
            onClick={onToggle}
            className="w-full text-left p-5 md:p-6 flex items-start justify-between gap-4 cursor-pointer"
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
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const allOpen = openItems.size === faqs.length;

  const toggleAll = () => {
    if (allOpen) {
      setOpenItems(new Set());
    } else {
      setOpenItems(new Set(faqs.map((_, i) => i)));
    }
  };

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section id="faq" className="py-12 md:py-16 bg-gradient-to-b from-white to-[#E3F5EC]/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-block px-4 py-1.5 bg-[#D4F49C] rounded-full text-sm font-semibold text-[#0B1F18] mb-4">
            Questions?
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-4 leading-tight">
            Common Questions
          </h2>
          <p className="text-base md:text-lg text-[#0B1F18]/70 leading-relaxed mb-3">
            Honest answers from people who've worked restaurant shifts
          </p>
          <button
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 text-sm text-[#26D07C] hover:text-[#1FB869] font-medium transition-colors duration-200 cursor-pointer"
          >
            {allOpen ? (
              <>
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Collapse all answers
              </>
            ) : (
              <>
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Expand all answers
              </>
            )}
          </button>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                index={index}
                isOpen={openItems.has(index)}
                onToggle={() => toggleItem(index)}
              />
            ))}
          </div>
        </div>

        {/* Still have questions CTA */}
        <div className="text-center mt-10 md:mt-12">
          <p className="text-[#0B1F18]/50 text-base mb-1.5">
            Still have questions?
          </p>
          <a
            href="mailto:hello@tippd.com"
            className="inline-block text-[#26D07C] hover:text-[#1FB869] font-medium text-sm transition-colors duration-200 cursor-pointer"
          >
            Email us directly →
          </a>
        </div>
      </div>
    </section>
  );
}
