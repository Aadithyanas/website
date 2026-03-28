import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aju Ed Solutions — AI, ML, IoT & Web Innovation",
  description:
    "AJU ED SOLUTIONS LLP — Redefining education & technology with AI, ML, IoT, Robotics, ERP & Web solutions. Empowering students, institutions, and enterprises.",
  openGraph: {
    title: "Aju Ed Solutions",
    description: "Innovate. Educate. Empower.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${dmSans.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter), var(--font-dm-sans), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
