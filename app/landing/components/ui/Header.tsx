"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/app/landing/components/ui/button";

export function Header() {
  const pathname = usePathname();

  const handleBrandClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    event.preventDefault();
    const start = window.scrollY || window.pageYOffset;
    const duration = 350;
    const startTime = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      window.scrollTo(0, Math.max(0, Math.round(start * (1 - eased))));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/#hero" onClick={handleBrandClick} className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-br from-[#26D07C] to-[#1FB869] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg font-display">T</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-[#0B1F18]">Tippd</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-[#0B1F18]/70 hover:text-[#0B1F18] transition cursor-pointer">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-[#0B1F18]/70 hover:text-[#0B1F18] transition cursor-pointer">
              How It Works
            </a>
            <a href="#compliance" className="text-sm font-medium text-[#0B1F18]/70 hover:text-[#0B1F18] transition cursor-pointer">
              Compliance
            </a>
            <a href="#pricing" className="text-sm font-medium text-[#0B1F18]/70 hover:text-[#0B1F18] transition cursor-pointer">
              Pricing
            </a>
            <a href="#faq" className="text-sm font-medium text-[#0B1F18]/70 hover:text-[#0B1F18] transition cursor-pointer">
              FAQ
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="hidden sm:inline-flex text-[#0B1F18]"
              >
                Login
              </Button>
            </Link>
            <Button 
              className="bg-[#26D07C] text-[#0B1F18] hover:bg-[#1FB869] font-semibold shadow-sm"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
