import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Tippd",
  description:
    "A plain-language overview of how Tippd handles data. Full policies are live and maintained.",
};

const sections = [
  {
    title: "What we collect",
    description:
      "Operational data you provide (shifts, roles, tips) and basic account details needed to run the service.",
  },
  {
    title: "How we use data",
    description:
      "To calculate payouts, produce reports, and support compliance workflows you configure.",
  },
  {
    title: "Data ownership",
    description:
      "You retain ownership of your data. We act as the system of record for calculations and audit trails.",
  },
  {
    title: "Retention and security",
    description:
      "Data is stored with security controls appropriate for financial and operational records.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#26D07C]">Privacy</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold text-[#0B1F18]">
              Privacy built for trust.
            </h1>
            <p className="mt-4 text-lg text-[#0B1F18]/70 leading-relaxed">
              Our full Privacy Policy is live and maintained. This page offers a short, plain-language overview
              while we finalize pre-launch materials.
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
