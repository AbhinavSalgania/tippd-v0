import { ImageWithFallback } from "@/app/landing/components/figma/ImageWithFallback";
import { Card, CardContent } from "@/app/landing/components/ui/card";

const employeeDashboard = "/landing/assets/employee-dashboard.png";

export function EmployeeBenefitSection() {
  return (
    <section id="benefits" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Left: Visual */}
          <div className="order-2 lg:order-1">
            <Card className="overflow-hidden border-0 shadow-2xl">
              <CardContent className="p-0">
                <ImageWithFallback
                  src={employeeDashboard}
                  alt="Employee view of tip breakdown"
                  className="w-full h-auto"
                />
              </CardContent>
            </Card>
            
            {/* Floating stat card */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Card className="bg-[#E3F5EC] border-0">
                <CardContent className="p-6 text-center">
                  <div className="font-mono-data text-3xl font-bold text-[#26D07C] mb-1">40%</div>
                  <div className="text-sm text-[#0B1F18]/70">Lower Turnover</div>
                </CardContent>
              </Card>
              <Card className="bg-[#E3F5EC] border-0">
                <CardContent className="p-6 text-center">
                  <div className="font-mono-data text-3xl font-bold text-[#26D07C] mb-1">Zero</div>
                  <div className="text-sm text-[#0B1F18]/70">Payout Disputes</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <div>
              <div className="inline-block px-4 py-1.5 bg-[#D4F49C] rounded-full text-sm font-semibold text-[#0B1F18] mb-6">
                Your Team Will Love It Too
              </div>
              
              <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-6 leading-tight">
                Build Trust, Reduce Turnover, Keep Your Best Staff
              </h2>
              
              <p className="text-xl text-[#0B1F18]/70 leading-relaxed">
                When your employees see exactly how their tips are calculated, they trust you more. And when they trust you, they stay longer.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex-shrink-0 size-12 rounded-xl bg-[#E3F5EC] flex items-center justify-center text-2xl">
                  👁️
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-[#0B1F18] mb-2">
                    Complete Transparency
                  </h3>
                  <p className="text-[#0B1F18]/60 leading-relaxed">
                    Staff can see their individual tip breakdown anytime, eliminating questions and building confidence in your management.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 size-12 rounded-xl bg-[#E3F5EC] flex items-center justify-center text-2xl">
                  ✅
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-[#0B1F18] mb-2">
                    Zero Disputes
                  </h3>
                  <p className="text-[#0B1F18]/60 leading-relaxed">
                    No more "why did I get less than yesterday?" Mathematical clarity means zero arguments at shift end.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 size-12 rounded-xl bg-[#E3F5EC] flex items-center justify-center text-2xl">
                  📈
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-[#0B1F18] mb-2">
                    Higher Retention
                  </h3>
                  <p className="text-[#0B1F18]/60 leading-relaxed">
                    Fair, transparent tip distribution increases retention rates by 40% on average. Happy staff = better service.
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-[#26D07C]/10 to-[#D4F49C]/10 border-2 border-[#26D07C]/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">💡</span>
                  <h4 className="font-display font-semibold text-lg text-[#0B1F18]">
                    Staff Satisfaction = Better Service
                  </h4>
                </div>
                <p className="text-[#0B1F18]/70 leading-relaxed">
                  Happy, trusted employees provide better customer experiences. Better service means higher tips and repeat customers. It's a compounding advantage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
