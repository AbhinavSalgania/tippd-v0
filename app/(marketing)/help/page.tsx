import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center | Tippd",
  description:
    "Answers to common setup, accuracy, compliance, and data ownership questions for Tippd.",
};

const faqs = [
  {
    question: "How long does setup take?",
    answer:
      "Most locations can be onboarded in under a week once roles, pooling rules, and shift formats are confirmed.",
  },
  {
    question: "How accurate are payouts?",
    answer:
      "Payouts are calculated using deterministic rules and integer math to avoid rounding surprises.",
  },
  {
    question: "Does Tippd handle compliance?",
    answer:
      "Tippd provides guardrails and reporting to help you apply your policies consistently, but you control the rules.",
  },
  {
    question: "Who owns the data?",
    answer:
      "You do. Tippd is a system of record for tip calculations and keeps an auditable trail for every shift.",
  },
];

export default function HelpPage() {
  return (
    <div className="bg-white">
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#26D07C]">Help Center</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold text-[#0B1F18]">
              Clear answers for a high-trust workflow.
            </h1>
            <p className="mt-4 text-lg text-[#0B1F18]/70 leading-relaxed">
              We are preparing the full help center for launch. In the meantime, here are the most common
              questions from early operators.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((item) => (
              <div key={item.question} className="rounded-2xl border border-black/10 bg-white p-6">
                <h2 className="text-lg font-display font-semibold text-[#0B1F18]">{item.question}</h2>
                <p className="mt-3 text-sm text-[#0B1F18]/70 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#26D07C]/20 bg-[#F5FBF8] p-8">
            <h2 className="text-xl font-display font-semibold text-[#0B1F18]">Compliance resources</h2>
            <p className="mt-2 text-sm text-[#0B1F18]/70">
              These official resources can help you validate tipped employee rules and state-by-state guidance.
            </p>
            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <a
                href="https://www.dol.gov/agencies/whd/tipped-employees"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-[#26D07C]/30 bg-white px-4 py-2 text-sm font-semibold text-[#0B1F18] transition hover:border-[#26D07C]"
              >
                Compliance Guide
              </a>
              <a
                href="https://www.dol.gov/agencies/whd/minimum-wage/state"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-[#26D07C]/30 bg-white px-4 py-2 text-sm font-semibold text-[#0B1F18] transition hover:border-[#26D07C]"
              >
                Tip Laws by State
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
