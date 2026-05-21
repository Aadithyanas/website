"use client";

import React from "react";
import Nav from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import { CareersSection, CompanyProvider, ContactSection } from "@/src/components/sections/Index";
import { motion } from "framer-motion";
import { Briefcase, Compass, Users } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CareersClientPage() {
  return (
    <CompanyProvider initialCompany="default">
      <main className="min-h-screen" style={{ background: "#000", color: "#eef2ff" }}>
        <Nav />

        {/* Immersive Dedicated Careers Hero */}
        <section className="relative pt-36 pb-20 overflow-hidden flex flex-col items-center justify-center min-h-[60vh]">
          {/* Ambient Glows */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 50% 30%, rgba(99,102,241,0.15) 0%, transparent 60%),
                radial-gradient(circle at 10% 80%, rgba(6,214,160,0.06) 0%, transparent 50%),
                radial-gradient(circle at 90% 80%, rgba(244,114,182,0.06) 0%, transparent 50%)
              `,
            }}
          />
          
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: EASE }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase mb-6"
              style={{
                border: "1px solid rgba(99,102,241,0.3)",
                background: "rgba(99,102,241,0.1)",
                backdropFilter: "blur(8px)",
                color: "#a5b4fc",
              }}
            >
              <Briefcase size={14} />
              We Are Hiring
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-tight"
              style={{
                background: "linear-gradient(135deg, #eef2ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Build the Future <br />
              <span className="bg-gradient-to-r from-indigo-400 via-emerald-400 to-pink-400 bg-clip-text text-transparent">
                With Us
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
              style={{ color: "rgba(176,190,220,0.85)" }}
            >
              Step into an ecosystem of extreme creativity and high engineering capability. Explore our open positions across AI, robotics, branding, and coworking divisions to discover where you fit best.
            </motion.p>
          </div>
        </section>

        {/* Culture / Highlights section for premium content */}
        <section className="py-20 relative border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Users size={24} />,
                  title: "Collaborative Culture",
                  desc: "Work with expert teams across multiple divisions where ideas are shared openly and built collectively.",
                },
                {
                  icon: <Compass size={24} />,
                  title: "Growth & Learning",
                  desc: "Gain deep, hands-on experience on live engineering and design workflows using top-tier modern technologies.",
                },
                {
                  icon: <Briefcase size={24} />,
                  title: "Innovative Projects",
                  desc: "Contribute directly to game-changing AI integrations, low-cost robotics systems, and premium enterprise apps.",
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: idx * 0.1, ease: EASE }}
                  className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Job Listings Section */}
        <CareersSection />

        <ContactSection />
        <Footer />
      </main>
    </CompanyProvider>
  );
}
