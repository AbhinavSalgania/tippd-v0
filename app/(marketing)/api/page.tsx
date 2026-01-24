import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API | Tippd",
  description:
    "Enterprise API access for integrations, reporting, and custom workflows. Currently available to partners.",
};

const capabilities = [
  {
    title: "Shift and payout data",
    description:
      "Secure access to shift-level totals, payouts, and approvals for downstream systems.",
  },
  {
    title: "Role and assignment mapping",
    description:
      "Sync roles and assignments to keep staffing data aligned with tip distribution rules.",
  },
  {
    title: "Compliance exports",
    description:
      "Generate structured exports for payroll, accounting, and compliance reviews.",
  },
];

export default function ApiPage() {
  return (
    <div className="bg-white">
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#26D07C]">API</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold text-[#0B1F18]">
              Enterprise-grade access to tip data.
            </h1>
            <p className="mt-4 text-lg text-[#0B1F18]/70 leading-relaxed">
              The Tippd API is designed for enterprise groups and partners who need programmatic access to
              tip distribution data. It is available on a limited basis today.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {capabilities.map((item) => (
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#26D07C]">Currently in private beta</p>
                <h2 className="mt-3 text-xl font-display font-semibold text-[#0B1F18]">
                  API access is available for enterprise and partners.
                </h2>
                <p className="mt-2 text-sm text-[#0B1F18]/70">
                  We will open broader access once integrations are fully rolled out.
                </p>
              </div>
              <div className="rounded-full border border-[#26D07C]/30 bg-white px-4 py-2 text-xs font-semibold text-[#0B1F18]">
                Invite-only access
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
