import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Tippd",
  description:
    "A founder-led tip transparency platform built from firsthand hospitality experience.",
};

const values = [
  {
    title: "Transparency over assumptions",
    description:
      "Every payout should be explainable, repeatable, and visible to the people it affects.",
  },
  {
    title: "Operational clarity",
    description:
      "Managers need a clear process that reduces end-of-shift friction and documentation gaps.",
  },
  {
    title: "Respect for the work",
    description:
      "Tips are earned. The system should honor the effort behind them.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#26D07C]">About Tippd</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold text-[#0B1F18]">
              Built by people who have lived the shift.
            </h1>
            <p className="mt-4 text-lg text-[#0B1F18]/70 leading-relaxed">
              Tippd is founder-led and grounded in firsthand hospitality experience. After years of watching
              tip disputes, manual spreadsheets, and compliance stress pile up, we built a system that makes
              the math clear and the process fair.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((item) => (
              <div key={item.title} className="rounded-2xl border border-black/10 bg-white p-6">
                <h2 className="text-lg font-display font-semibold text-[#0B1F18]">{item.title}</h2>
                <p className="mt-3 text-sm text-[#0B1F18]/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#26D07C]/20 bg-[#F5FBF8] p-8">
            <h2 className="text-xl font-display font-semibold text-[#0B1F18]">Why this exists</h2>
            <p className="mt-3 text-sm text-[#0B1F18]/70 leading-relaxed">
              Restaurants deserve a tip system that is trusted by staff and defensible in front of ownership,
              auditors, and regulators. Tippd is focused on being that single source of truth.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
