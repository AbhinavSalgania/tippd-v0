"use client";

import { Card, CardContent } from "@/app/landing/components/ui/card";
import { useScrollAnimation } from "@/app/landing/hooks/useScrollAnimation";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Owner",
    restaurant: "The Modern Table",
    location: "San Francisco, CA",
    quote: "We went from 2 hours of tip calculations per shift to less than 5 minutes. My staff is happier, I finally have time to focus on running my restaurant, and our turnover rate dropped 35%.",
    highlight: "35% lower turnover",
  },
  {
    name: "Michael Rodriguez",
    role: "General Manager",
    restaurant: "Ember Grill",
    location: "Austin, TX",
    quote: "The granular transparency completely eliminated tip disputes. Our team trusts the system, and I trust the audit trail. Best ROI of any operational tool we've adopted.",
    highlight: "Zero disputes",
  },
  {
    name: "Jessica Williams",
    role: "Operations Director",
    restaurant: "Harbor Group (5 locations)",
    location: "Seattle, WA",
    quote: "Managing tips across multiple locations was a nightmare. Now everything is centralized, mathematically fair, and audit-ready. Our accountant loves it as much as we do.",
    highlight: "5 locations unified",
  },
  {
    name: "David Park",
    role: "Owner",
    restaurant: "Nori Kitchen",
    location: "Portland, OR",
    quote: "My BOH staff finally feels valued because they see exactly how kitchen tip-outs work. The objective distribution logic removed all the 'perception' issues we used to deal with.",
    highlight: "BOH satisfaction up",
  },
  {
    name: "Amanda Torres",
    role: "Managing Partner",
    restaurant: "Coastal Provisions",
    location: "Charleston, SC",
    quote: "During our last audit, having Tippd's complete digital records saved us weeks of work. The IRS 8027 compliance is built-in, and the export to QuickBooks is seamless.",
    highlight: "Audit-proof",
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <Card className="bg-white border border-[#0B1F18]/8 hover:border-[#26D07C]/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(11,31,24,0.08)] group h-full">
        <CardContent className="p-5 md:p-6">
          {/* Highlight badge */}
          <div className="inline-flex px-2.5 py-1 bg-[#D4F49C] rounded-full text-xs font-semibold text-[#0B1F18] mb-3">
            {testimonial.highlight}
          </div>

          {/* Quote */}
          <p className="text-[#0B1F18]/75 leading-relaxed mb-5 italic text-sm md:text-[15px]">
            "{testimonial.quote}"
          </p>

          {/* Author */}
          <div className="pt-3 border-t border-[#0B1F18]/5">
            <div className="font-display font-semibold text-[#0B1F18] text-sm md:text-[15px]">
              {testimonial.name}
            </div>
            <div className="text-xs md:text-sm text-[#0B1F18]/65">
              {testimonial.role} • {testimonial.restaurant}
            </div>
            <div className="text-xs text-[#0B1F18]/45 mt-0.5">
              {testimonial.location}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-4 leading-tight">
            Trusted by Restaurant Managers Nationwide
          </h2>
          <p className="text-base md:text-lg text-[#0B1F18]/70 leading-relaxed">
            Real results from real operators who eliminated tip calculation headaches
          </p>
        </div>

        {/* Masonry-style grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
