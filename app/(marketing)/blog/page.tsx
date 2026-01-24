import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Tippd",
  description:
    "Practical notes on tip transparency, labor compliance, and restaurant operations from the Tippd team.",
};

const posts = [
  {
    title: "Designing tip policies that staff can trust",
    summary:
      "A framework for documenting house rules, aligning managers, and reducing end-of-shift disputes.",
    status: "Draft",
  },
  {
    title: "What tipped employee compliance looks like in 2026",
    summary:
      "Key federal rules to keep on your radar and how to communicate changes to your team.",
    status: "Draft",
  },
  {
    title: "Operational clarity: the case for a single source of truth",
    summary:
      "Why spreadsheets break down at scale and what a structured audit trail enables.",
    status: "Draft",
  },
];

export default function BlogPage() {
  return (
    <div className="bg-white">
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#26D07C]">Blog</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold text-[#0B1F18]">
              Notes from the Tippd team.
            </h1>
            <p className="mt-4 text-lg text-[#0B1F18]/70 leading-relaxed">
              We are preparing our publishing cadence for launch. Here is a preview of the topics we are
              working on with operators and advisors.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <article key={post.title} className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-[#26D07C]">
                  <span>Preview</span>
                  <span className="rounded-full border border-[#26D07C]/30 px-2 py-1 text-[10px] text-[#0B1F18]">
                    {post.status}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-display font-semibold text-[#0B1F18]">{post.title}</h2>
                <p className="mt-3 text-sm text-[#0B1F18]/70 leading-relaxed">{post.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
