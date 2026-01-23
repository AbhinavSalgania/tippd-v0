"use client";

import { Card, CardContent } from "@/app/landing/components/ui/card";
import { useCountAnimation } from "@/app/landing/hooks/useCountAnimation";

interface AnimatedStatCardProps {
  value: number;
  suffix?: string;
  label: string;
  variant?: "green" | "yellow" | "white";
  className?: string;
}

export function AnimatedStatCard({ value, suffix = "%", label, variant = "white", className = "" }: AnimatedStatCardProps) {
  const { ref, count } = useCountAnimation({ end: value, duration: 2000 });

  const variantClasses = {
    green: "bg-gradient-to-br from-[#26D07C] to-[#1FB869] border-0 shadow-[0_4px_20px_rgba(38,208,124,0.25)] text-white hover:shadow-[0_8px_32px_rgba(38,208,124,0.35)]",
    yellow: "bg-gradient-to-br from-[#D4F49C] to-[#C8E88F] border-0 shadow-[0_4px_20px_rgba(212,244,156,0.3)] hover:shadow-[0_8px_32px_rgba(212,244,156,0.4)]",
    white: "bg-white border border-[#0B1F18]/8 shadow-[0_4px_20px_rgba(11,31,24,0.06)] hover:shadow-[0_8px_32px_rgba(11,31,24,0.1)]"
  };

  const textColor = variant === "green" ? "text-white" : "text-[#0B1F18]";
  const labelColor = variant === "green" ? "text-white/90" : "text-[#0B1F18]/70";

  return (
    <Card className={`${variantClasses[variant]} transition-shadow duration-300 ${className}`}>
      <CardContent className="p-5 md:p-6 text-center">
        <div ref={ref} className={`font-mono-data text-4xl md:text-5xl font-bold mb-1.5 ${textColor}`}>
          {count}{suffix}
        </div>
        <div className={`${labelColor} font-medium text-sm md:text-[15px]`}>{label}</div>
      </CardContent>
    </Card>
  );
}
