import type { Metadata } from "next";
import CareersClientPage from "./CareersClientPage";

export const metadata: Metadata = {
  title: "Careers | AJU ED Solutions Kerala",
  description: "Join AJU ED Solutions. Explore open positions in software development, AI, robotics, video editing, and brand strategy in Kerala.",
  keywords: [
    "AJU ED Solutions careers", 
    "Robotics jobs Kerala", 
    "Developer jobs Kerala", 
    "Video editor jobs Kerala", 
    "Graphic designer jobs Kerala",
    "AJU careers"
  ],
};

export default function CareersPage() {
  return <CareersClientPage />;
}
