import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team ERP | Company Portal",
  description: "Internal ERP system for team management, tasks, and attendance.",
};

export default function ERPRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
