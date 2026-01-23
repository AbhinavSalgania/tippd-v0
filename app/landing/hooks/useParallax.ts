"use client";

import { useEffect, useState } from "react";

interface UseParallaxOptions {
  speed?: number;
}

export function useParallax(options: UseParallaxOptions = {}) {
  const { speed = 0.5 } = options;
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return {
    transform: `translateY(${offsetY * speed}px)`,
  };
}
