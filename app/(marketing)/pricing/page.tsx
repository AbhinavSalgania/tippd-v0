import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | Tippd",
  description:
    "Transparent, per-location pricing that scales with your restaurant group. No hidden fees, no surprises.",
};

const pricingPrinciples = [
  {
    title: "Per-location, not per-user",
    description:
      "Pricing is tied to locations so operators can roll Tippd out without adding seats or headcount math.",
  },
  {
    title: "Transparent from day one",
    description:
      "We document every line item so finance and operations teams know exactly what they are paying for.",
  },
  {
    title: "Scales with complexity",
    description:
      "Multi-location groups and complex pooling structures get the level of support they need.",
  },
];

const inclusions = [
  "Unlimited shifts and payout calculations",
  "Manager approvals and audit trails",
  "Export-ready reporting",
  "Priority onboarding for early partners",
];

export default function PricingPage() {
  return (
    <div className="bg-white">
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#26D07C]">Pricing</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold text-[#0B1F18]">
              Straightforward pricing built for operators.
            </h1>
            <p className="mt-4 text-lg text-[#0B1F18]/70 leading-relaxed">
              Tippd is almost ready for launch, and we are finalizing pricing with early partners. The model
              is simple, predictable, and designed for multi-location hospitality groups.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {pricingPrinciples.map((item) => (
              <div key={item.title} className="rounded-2xl border border-black/10 bg-white p-6">
                <h2 className="text-lg font-display font-semibold text-[#0B1F18]">{item.title}</h2>
                <p className="mt-3 text-sm text-[#0B1F18]/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl border border-black/10 bg-[#0B1F18] p-8 text-white">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D4F49C]">
                  What is included
                </p>
                <h2 className="mt-3 text-2xl font-display font-semibold">Everything you need to run tips with clarity.</h2>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  We keep pricing clean so the focus stays on operational trust and compliance.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-white/70">
                {inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 size-2 rounded-full bg-[#26D07C]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#26D07C]/20 bg-[#F5FBF8] p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-display font-semibold text-[#0B1F18]">Request early access pricing</h2>
                <p className="mt-2 text-sm text-[#0B1F18]/70">
                  Tell us about your locations and we will share a tailored quote when we open launch pricing.
                </p>
              </div>
              <Link
                href="/help"
                className="inline-flex items-center justify-center rounded-md bg-[#26D07C] px-5 py-2 text-sm font-semibold text-[#0B1F18] shadow-sm transition hover:bg-[#1FB869]"
              >
                Contact the team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
