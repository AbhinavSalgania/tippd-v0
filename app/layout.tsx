import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tippd.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Tippd | Tip Transparency, finally.",
  description:
    "Calculate tips consistently, give your team transparency, and eliminate end-of-shift arguments. The single source of truth for tip distribution.",
  keywords: [
    "tip distribution",
    "restaurant tips",
    "tip pooling",
    "tip management",
    "restaurant software",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tippd | Tip Transparency, finally.",
    description:
      "Calculate tips consistently, give your team transparency, and eliminate end-of-shift arguments.",
    type: "website",
    siteName: "Tippd",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tippd | Tip Transparency, finally.",
    description:
      "Calculate tips consistently, give your team transparency, and eliminate end-of-shift arguments.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
