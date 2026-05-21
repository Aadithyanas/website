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
  title: "AJU ED Solutions | AI, Robotics & Tech Training Kerala",
  description:
    "Build your future with AI, IoT, robotics training, internships & web solutions at AJU ED Solutions, Kerala’s trusted tech education partner.",
  keywords: [
    "AI solutions Kerala", "Robotics training Kerala", "Engineering training Kerala", "Machine learning Kerala", "EdTech Kerala", "IoT solutions Kerala",
    "AI company Kerala", "Robotics experts Kerala", "EdTech company Kerala", "Technology training Kerala",
    "AJU branches", "AJU Techzora", "AJU Brandify", "Scrumspacecoworks", "Tech services Kerala", "Branding agency Kerala", "Coworking space Kerala",
    "Internships Kerala", "Project training Kerala", "Robotics projects Kerala", "AI training Kerala",
    "AJU ED Solutions reviews", "Student testimonials Kerala", "Robotics training reviews", "Internship reviews Kerala", "AI training feedback"
  ],
  openGraph: {
    title: "AJU ED Solutions | AI, Robotics & Tech Training Kerala",
    description: "Build your future with AI, IoT, robotics training, internships & web solutions at AJU ED Solutions, Kerala’s trusted tech education partner.",
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
