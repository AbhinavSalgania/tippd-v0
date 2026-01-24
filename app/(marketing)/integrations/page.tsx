import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations | Tippd",
  description:
    "Planned integrations for POS, payroll, and scheduling systems, with phased rollout after launch.",
};

const categories = [
  {
    title: "POS systems",
    description:
      "Pull sales and tip data directly from your point-of-sale so managers do not have to re-enter shift totals.",
  },
  {
    title: "Payroll providers",
    description:
      "Export approved payouts into payroll with clear, auditable line items.",
  },
  {
    title: "Scheduling tools",
    description:
      "Match roles and shift assignments to tip data for accurate distribution.",
  },
];

const rollout = [
  "Early partners first, then broader availability post-launch",
  "Secure API access for enterprise use cases",
  "Data validation to prevent mismatched sales or shift records",
];

export default function IntegrationsPage() {
  return (
    <div className="bg-white">
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#26D07C]">Integrations</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold text-[#0B1F18]">
              Connect Tippd to the systems you already use.
            </h1>
            <p className="mt-4 text-lg text-[#0B1F18]/70 leading-relaxed">
              We are building integrations that reduce manual entry and keep your data consistent across POS,
              payroll, and scheduling. Integrations will roll out post-launch in phases.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((item) => (
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
          <div className="rounded-2xl bg-[#F5FBF8] border border-[#26D07C]/20 p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#26D07C]">
                  Currently in private beta
                </p>
                <h2 className="mt-3 text-2xl font-display font-semibold text-[#0B1F18]">
                  Integrations are rolling out after launch.
                </h2>
                <p className="mt-3 text-sm text-[#0B1F18]/70 leading-relaxed">
                  We are finalizing data mapping and permissioning with early partners so the first public
                  integrations are reliable from day one.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-[#0B1F18]/70">
                {rollout.map((item) => (
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
