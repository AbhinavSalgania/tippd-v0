"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountAnimationOptions {
  end: number;
  duration?: number;
  start?: number;
  decimals?: number;
}

export function useCountAnimation(options: UseCountAnimationOptions) {
  const { end, duration = 2000, start = 0, decimals = 0 } = options;
  const [count, setCount] = useState(start);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsInView(true);
          hasAnimated.current = true;
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      const easeOutQuad = (t: number) => t * (2 - t);
      const currentCount = start + (end - start) * easeOutQuad(progress);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, end, start, duration]);

  const formattedCount = decimals > 0 ? count.toFixed(decimals) : Math.round(count);

  return { ref, count: formattedCount };
}
