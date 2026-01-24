"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/landing/components/ui/card";
import { useScrollAnimation } from "@/app/landing/hooks/useScrollAnimation";

const features = [
  {
    icon: "📄",
    title: "Permanent Records",
    description: "Every shift automatically saved forever. When staff ask about a payout from last month, you have the answer.",
  },
  {
    icon: "🔒",
    title: "Secure Data",
    description: "Bank-level encryption. Your tip data and employee info are protected the same way financial institutions handle sensitive records.",
  },
  {
    icon: "📊",
    title: "Export for Payroll",
    description: "Download tip totals as a file you can hand to your accountant or import into your payroll system.",
  },
  {
    icon: "✅",
    title: "Manager Approval Required",
    description: "Nothing goes to staff until you review and approve it. You're always in control of what gets shared.",
  },
];

const stats = [
  { label: "SOC 2", value: "SOC 2" },
  { label: "256-bit", value: "256-bit" },
  { label: "GDPR", value: "GDPR" },
  { label: "99.9%", value: "99.9%", sublabel: "Uptime SLA" },
];

function FeatureCard({ icon, title, description, index }: { icon: string; title: string; description: string; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${index * 80}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="bg-[#0B1F18]/40 border border-[#26D07C]/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(38,208,124,0.2)] transition-all duration-300 h-full backdrop-blur-sm">
        <CardContent className="p-5 md:p-6 pt-6 md:pt-6">
          <div className="text-3xl mb-3">{icon}</div>
          <h3 className="font-display font-semibold text-base md:text-lg text-white mb-2 leading-snug">
            {title}
          </h3>
          <p className="text-white/70 leading-relaxed text-sm md:text-[15px]">
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="text-center">
      <div className="font-mono-data text-2xl md:text-3xl font-bold text-[#26D07C] mb-1">
        {value}
      </div>
      <div className="text-xs md:text-sm text-white/70 font-medium">
        {sublabel || label}
      </div>
    </div>
  );
}

export function AuditProofSection() {
  return (
    <section id="compliance" className="py-12 md:py-16 bg-gradient-to-br from-[#0B1F18] to-[#0a2820] relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] bg-[radial-gradient(circle_at_70%_30%,rgba(38,208,124,0.1),rgba(38,208,124,0)_60%)] blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          <div className="inline-block px-4 py-1.5 bg-[#26D07C]/20 rounded-full text-sm font-semibold text-[#26D07C] mb-4 border border-[#26D07C]/30">
            Compliance & Security
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            Audit-Proof Your Payroll
          </h2>
          <p className="text-base md:text-lg text-white/70 leading-relaxed">
            Full regulatory compliance built in from day one. Sleep better knowing your tip distribution meets all federal and state requirements.
          </p>
        </div>

        {/* Feature cards */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-4 md:gap-5 mb-8 md:mb-10">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>

        {/* Stats row */}
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
