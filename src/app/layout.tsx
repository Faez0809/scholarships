import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ScholarTrack — Discover Fully Funded Master's & PhD Scholarships",
  description:
    "Discover, filter, and manage fully funded Master's and PhD scholarships worldwide. Match against your CGPA, IELTS, target degree, and calculate net monthly living savings.",
  keywords: [
    "scholarships",
    "fully funded",
    "master's scholarship",
    "phd scholarship",
    "KAUST fellowship",
    "Gates Cambridge",
    "ETH Zurich ESOP",
    "MEXT Japan",
    "KAIST",
    "Eiffel scholarship",
  ],
  authors: [{ name: "ScholarTrack Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans">
        {children}
      </body>
    </html>
  );
}
