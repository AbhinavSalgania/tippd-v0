import { Button } from "@/app/landing/components/ui/button";
import { Input } from "@/app/landing/components/ui/input";

export function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-[#26D07C] to-[#1FB869] text-[#0B1F18] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.2),transparent_50%)] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl md:text-6xl mb-6 leading-tight">
            Reclaim Managerial Bandwidth
          </h2>
          <p className="text-2xl text-[#0B1F18]/80 mb-12 leading-relaxed">
            Join 500+ restaurants that eliminated tip calculation headaches. Start your 14-day free trial today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-8">
            <Input 
              type="email" 
              placeholder="Enter your email"
              className="bg-white border-0 h-14 text-lg text-[#0B1F18] placeholder:text-[#0B1F18]/40 shadow-lg"
            />
            <Button 
              size="lg" 
              className="bg-[#0B1F18] text-white hover:bg-[#0B1F18]/90 h-14 px-8 whitespace-nowrap font-semibold shadow-lg"
            >
              Start Free Trial 
              <svg
                className="ml-2 size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Button>
          </div>

          <p className="text-[#0B1F18]/70 text-sm mb-16">
            No credit card required • 5-minute setup • Cancel anytime
          </p>

          {/* Stats grid */}
          <div className="grid md:grid-cols-3 gap-8 pt-16 border-t border-[#0B1F18]/10">
            <div>
              <div className="font-mono-data text-5xl font-bold mb-2">2 min</div>
              <div className="text-[#0B1F18]/70 font-medium">Average processing time</div>
            </div>
            <div>
              <div className="font-mono-data text-5xl font-bold mb-2">500+</div>
              <div className="text-[#0B1F18]/70 font-medium">Restaurants trust Tippd</div>
            </div>
            <div>
              <div className="font-mono-data text-5xl font-bold mb-2">40%</div>
              <div className="text-[#0B1F18]/70 font-medium">Average turnover reduction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
