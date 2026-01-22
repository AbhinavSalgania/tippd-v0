import { Card, CardContent } from "@/app/landing/components/ui/card";
import { Badge } from "@/app/landing/components/ui/badge";

const complianceFeatures = [
  {
    icon: "🔒",
    title: "IRS 8027 Compliance",
    description: "Automatic tip reporting that meets federal requirements. Never worry about audit exposure again.",
  },
  {
    icon: "📋",
    title: "Complete Audit Trails",
    description: "Every transaction logged with timestamps, user actions, and calculation methodology for complete transparency.",
  },
  {
    icon: "⚖️",
    title: "Labor Law Protection",
    description: "Built-in safeguards for FLSA compliance, tip credit rules, and state-specific wage requirements.",
  },
  {
    icon: "🔐",
    title: "Secure Data Handling",
    description: "Bank-level encryption, SOC 2 compliance, and automatic backups protect your sensitive payroll data.",
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
              className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-[#26D07C]/30 transition-all"
            >
              <CardContent className="p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-display font-semibold text-xl text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
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
