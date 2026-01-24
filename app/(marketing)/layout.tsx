import type { ReactNode } from "react";
import "../landing/styles/index.css";
import { Header } from "@/app/landing/components/ui/Header";
import { Footer } from "@/app/landing/components/ui/Footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24 pb-20">{children}</main>
      <Footer />
    </div>
  );
}
