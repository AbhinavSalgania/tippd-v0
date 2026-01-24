import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Tippd",
  description:
    "A plain-language overview of Tippd terms. Full terms are live and maintained.",
};

const sections = [
  {
    title: "Service scope",
    description:
      "Tippd provides calculation, reporting, and audit tools for tip distribution. We do not move money or run payroll.",
  },
  {
    title: "Customer responsibilities",
    description:
      "You define the tip rules, confirm data accuracy, and maintain compliance with local regulations.",
  },
  {
    title: "Availability",
    description:
      "The platform is currently in private beta. Features are released in phases with advance notice.",
  },
  {
    title: "Data and audit trails",
    description:
      "We maintain records of approved shifts and payouts to provide defensible documentation when needed.",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-white">
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#26D07C]">Terms</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold text-[#0B1F18]">
              Terms built for operational clarity.
            </h1>
            <p className="mt-4 text-lg text-[#0B1F18]/70 leading-relaxed">
              Our full Terms of Service are live and maintained. This page offers a concise overview while we
              finalize pre-launch materials.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {sections.map((item) => (
              <div key={item.title} className="rounded-2xl border border-black/10 bg-white p-6">
                <h2 className="text-lg font-display font-semibold text-[#0B1F18]">{item.title}</h2>
                <p className="mt-3 text-sm text-[#0B1F18]/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
