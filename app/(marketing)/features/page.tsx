import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features | Tippd",
  description:
    "A clear view of how tips are captured, distributed, and reported with transparency and compliance at the core.",
};

const highlights = [
  {
    title: "Shift-level tip tracking",
    description:
      "Capture sales, tips, and role assignments in one place so every payout can be traced back to a single shift.",
  },
  {
    title: "Rule-based distribution",
    description:
      "Apply house rules consistently across locations, with guardrails that prevent off-the-record changes.",
  },
  {
    title: "Compliance-first workflows",
    description:
      "Built-in checks for tipped employee rules, pooling structures, and minimum-wage thresholds.",
  },
  {
    title: "Audit-ready reporting",
    description:
      "Generate clear summaries for managers and staff, with a permanent record of every adjustment.",
  },
];

const betaFocus = [
  "Shift locking and approval flows for managers",
  "Staff-facing breakdowns that show exactly how tips were calculated",
  "Export-ready reports for payroll and accounting",
];

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#26D07C]">Features</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold text-[#0B1F18]">
              Tip distribution your team can trust.
            </h1>
            <p className="mt-4 text-lg text-[#0B1F18]/70 leading-relaxed">
              Tippd turns shift data into clear, defensible payouts. Everything is designed to reduce confusion,
              keep managers consistent, and give staff a transparent view of their earnings.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_12px_40px_rgba(11,31,24,0.06)]"
              >
                <h2 className="text-xl font-display font-semibold text-[#0B1F18]">{item.title}</h2>
                <p className="mt-3 text-sm text-[#0B1F18]/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-6">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#0B1F18] text-white p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D4F49C]">
                  Currently in private beta
                </p>
                <h2 className="mt-3 text-2xl font-display font-semibold">
                  We are focused on getting the fundamentals right.
                </h2>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  The product is almost ready. These are the areas we are refining with early partners before
                  a broader launch.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-white/70">
                {betaFocus.map((item) => (
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
    </div>
  );
}
