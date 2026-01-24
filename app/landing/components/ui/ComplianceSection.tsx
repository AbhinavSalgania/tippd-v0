import { Card, CardContent } from "@/app/landing/components/ui/card";
import { Badge } from "@/app/landing/components/ui/badge";

const complianceFeatures = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Permanent Records",
    description: "Every shift calculation stored forever. When staff ask about a payout from last month, you have the answer.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Secure Data",
    description: "Bank-level encryption. Your tip data and employee info are protected the same way financial institutions handle sensitive records.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: "Export for Payroll",
    description: "Download tip totals as a file you can hand to your accountant or import into your payroll system.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Manager Approval Required",
    description: "Nothing goes to staff until you review and approve it. You're always in control of what gets shared.",
  },
];

export function ComplianceSection() {
  return (
    <section id="compliance" className="py-20 md:py-32 bg-[#0B1F18] text-white relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(38,208,124,0.1),transparent_70%)] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="inline-flex bg-[#26D07C]/20 text-[#26D07C] border border-[#26D07C]/30 hover:bg-[#26D07C]/30 font-semibold px-4 py-1.5 mb-6">
            Compliance & Security
          </Badge>
          
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 leading-tight">
            Audit-Proof Your Payroll
          </h2>
          <p className="text-xl text-white/70 leading-relaxed">
            Full regulatory compliance built in from day one. Sleep better knowing your tip distribution meets all federal and state requirements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {complianceFeatures.map((feature, index) => (
            <Card
              key={index}
              className="bg-[#1a3d2f] backdrop-blur-sm border border-[#26D07C]/20 hover:border-[#26D07C]/40 transition-all"
            >
              <CardContent className="p-6 md:p-7">
                <div className="text-white/80 mb-4">{feature.icon}</div>
                <h3 className="font-display font-bold text-lg md:text-xl text-white mb-2.5 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust badges */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-mono-data font-bold text-[#26D07C] mb-2">SOC 2</div>
                  <div className="text-sm text-white/60">Type II Certified</div>
                </div>
                <div>
                  <div className="text-3xl font-mono-data font-bold text-[#26D07C] mb-2">256-bit</div>
                  <div className="text-sm text-white/60">AES Encryption</div>
                </div>
                <div>
                  <div className="text-3xl font-mono-data font-bold text-[#26D07C] mb-2">GDPR</div>
                  <div className="text-sm text-white/60">Compliant</div>
                </div>
                <div>
                  <div className="text-3xl font-mono-data font-bold text-[#26D07C] mb-2">99.9%</div>
                  <div className="text-sm text-white/60">Uptime SLA</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
