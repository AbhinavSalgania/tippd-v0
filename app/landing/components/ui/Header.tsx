import { Button } from "@/app/landing/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-br from-[#26D07C] to-[#1FB869] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg font-display">T</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-[#0B1F18]">Tippd</span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-[#0B1F18]/70 hover:text-[#0B1F18] transition">
              Features
            </a>
            <a href="#integrations" className="text-sm font-medium text-[#0B1F18]/70 hover:text-[#0B1F18] transition">
              Integrations
            </a>
            <a href="#compliance" className="text-sm font-medium text-[#0B1F18]/70 hover:text-[#0B1F18] transition">
              Compliance
            </a>
            <a href="#pricing" className="text-sm font-medium text-[#0B1F18]/70 hover:text-[#0B1F18] transition">
              Pricing
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="hidden sm:inline-flex text-[#0B1F18]"
            >
              Login
            </Button>
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
