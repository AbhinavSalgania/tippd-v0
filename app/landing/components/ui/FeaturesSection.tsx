import { ImageWithFallback } from "@/app/landing/components/figma/ImageWithFallback";
import { Card, CardContent } from "@/app/landing/components/ui/card";

const serviceDayImage = "/landing/assets/service-day.png";
const summaryImage = "/landing/assets/summary.png";

const features = [
  {
    title: "Automated Reconciliation",
    description: "Enter sales and tips once. Get accurate payouts for all staff in seconds. Zero formulas, zero errors.",
    icon: "⚡",
    span: "col-span-1",
  },
  {
    title: "Objective Distribution",
    description: "Rules-based pooling ensures mathematical fairness. No perception issues, no disputes.",
    icon: "🎯",
    span: "col-span-1",
  },
  {
    title: "Granular Transparency",
    description: "Every employee sees exactly how their payout was calculated, building institutional trust.",
    icon: "👁️",
    span: "col-span-1",
  },
  {
    title: "Audit-Proof Records",
    description: "Complete digital trail for IRS 8027 compliance, wage-hour defense, and payroll integration.",
    icon: "🔒",
    span: "col-span-1",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-[#E3F5EC]/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-6 leading-tight">
            Set Your Rules. We Handle the Math.
          </h2>
          <p className="text-xl text-[#0B1F18]/70 leading-relaxed">
            Powerful automation designed specifically for multi-tier tip distribution
          </p>
        </div>

        {/* Bento Grid */}
        <div className="max-w-7xl mx-auto">
          {/* Top row - Feature cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="bg-white border-0 shadow-lg hover:shadow-xl transition-all"
              >
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-display font-semibold text-lg text-[#0B1F18] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#0B1F18]/60 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom row - Large visual cards */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Service Day Screenshot */}
            <Card className="bg-white border-0 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 bg-[#E3F5EC]/50">
                  <h3 className="font-display font-semibold text-xl text-[#0B1F18] mb-2">
                    Daily Workflow Dashboard
                  </h3>
                  <p className="text-[#0B1F18]/60">
                    Enter shift data in under 2 minutes. Automatic calculations for FOH and BOH.
                  </p>
                </div>
                <div className="relative">
                  <ImageWithFallback
                    src={serviceDayImage}
                    alt="Service day entry interface"
                    className="w-full h-auto"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary Export Screenshot */}
            <Card className="bg-white border-0 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 bg-[#E3F5EC]/50">
                  <h3 className="font-display font-semibold text-xl text-[#0B1F18] mb-2">
                    Payroll-Ready Exports
                  </h3>
                  <p className="text-[#0B1F18]/60">
                    One-click TSV export for seamless integration with QuickBooks, ADP, and more.
                  </p>
                </div>
                <div className="relative">
                  <ImageWithFallback
                    src={summaryImage}
                    alt="Summary export interface"
                    className="w-full h-auto"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats row */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <Card className="bg-gradient-to-br from-[#26D07C] to-[#1FB869] border-0 shadow-lg text-white">
              <CardContent className="p-6 text-center">
                <div className="font-mono-data text-5xl font-bold mb-2">90%</div>
                <div className="text-white/90 font-medium">Time Saved vs. Spreadsheets</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#D4F49C] to-[#C8E88F] border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="font-mono-data text-5xl font-bold mb-2 text-[#0B1F18]">2 min</div>
                <div className="text-[#0B1F18]/70 font-medium">Average Processing Time</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-2 border-[#0B1F18]/10 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="font-mono-data text-5xl font-bold mb-2 text-[#0B1F18]">100%</div>
                <div className="text-[#0B1F18]/70 font-medium">IRS Compliant</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
