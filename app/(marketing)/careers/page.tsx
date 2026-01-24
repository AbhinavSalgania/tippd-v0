import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | Tippd",
  description:
    "We are building a small, focused team. Hiring will open soon for engineering, sales, and operations roles.",
};

const roles = [
  {
    title: "Engineering",
    description: "Full-stack and data-focused engineers who care about trust and accuracy.",
  },
  {
    title: "Sales",
    description: "Hospitality-focused sellers who can translate operations pain into product value.",
  },
  {
    title: "Operations",
    description: "Onboarding and support leaders with deep restaurant experience.",
  },
];

export default function CareersPage() {
  return (
    <div className="bg-white">
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#26D07C]">Careers</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold text-[#0B1F18]">
              Join early, build with intention.
            </h1>
            <p className="mt-4 text-lg text-[#0B1F18]/70 leading-relaxed">
              We are a small team today. Hiring will open soon as we move toward public launch. If you care about
              transparency in hospitality, we would love to meet you.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {roles.map((role) => (
              <div key={role.title} className="rounded-2xl border border-black/10 bg-white p-6">
                <h2 className="text-lg font-display font-semibold text-[#0B1F18]">{role.title}</h2>
                <p className="mt-3 text-sm text-[#0B1F18]/70 leading-relaxed">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#26D07C]/20 bg-[#F5FBF8] p-8">
            <h2 className="text-xl font-display font-semibold text-[#0B1F18]">Early interest</h2>
            <p className="mt-3 text-sm text-[#0B1F18]/70 leading-relaxed">
              We will open an interest form as soon as hiring begins. Check back here for the first roles and
              timelines.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
