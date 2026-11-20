import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: ["500", "600"],
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
    <html lang="en" className={`${inter.variable} ${serif.variable} antialiased`}>
      <body className="min-h-screen bg-stone-50 text-stone-900 font-sans">
        {children}
      </body>
    </html>
  );
}
