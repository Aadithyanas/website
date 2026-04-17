"use client";

import Nav from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import InternshipApplicationForm from "@/src/components/landing/GameRegisterForm";
import { motion } from "framer-motion";

export default function GameRegisterPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#000", color: "#eef2ff" }}>
      <Nav />

        <div className="flex-1 flex flex-col items-center justify-start pt-32 lg:pt-40 p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(67,56,202,0.1),transparent_50%)]">
          <InternshipApplicationForm />
        </div>

      <Footer />
    </main>
  );
}

