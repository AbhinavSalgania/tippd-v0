"use client";

import { useEffect, useState } from "react";

export function AnimatedCheckmark({ className = "" }: { className?: string }) {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation after a short delay when component mounts
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
        style={{
          strokeDasharray: '20',
          strokeDashoffset: hasAnimated ? '0' : '20',
          animation: hasAnimated ? 'checkmarkDraw 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none',
        }}
      />
      <style>{`
        @keyframes checkmarkDraw {
          from {
            stroke-dashoffset: 20;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          path {
            animation: none !important;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </svg>
  );
}
