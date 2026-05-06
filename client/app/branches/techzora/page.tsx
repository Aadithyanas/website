"use client";

import Nav from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import {
  AboutSection,
  ServicesSection,
  ContactSection,
  CompanyProvider 
} from "@/src/components/sections/Index";
import TechzoraScrollHero from "@/src/components/TechzoraScrollHero";
import { motion } from "framer-motion";
import { Cpu, Code, Shield } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function TechzoraPage() {
  return (
    <CompanyProvider initialCompany="techzora">
      <main className="min-h-screen" style={{ background: "#000", color: "#eef2ff" }}>
        <Nav />
        
        {/* Scroll-based Hero Section */}
        <TechzoraScrollHero />

        <AboutSection />
        
        <div className="py-20 bg-gradient-to-b from-black to-indigo-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="text-center mb-16"
            >
              <p className="font-mono tracking-widest uppercase text-sm mb-4" style={{ color: "rgba(99,102,241,0.85)" }}>
                What We Build
              </p>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #eef2ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Core Capabilities
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Cpu size={24} />,
                  title: "Hardware Solutions",
                  desc: "Custom IoT and Robotics hardware designed and built for educational and enterprise needs.",
                  delay: 0,
                },
                {
                  icon: <Code size={24} />,
                  title: "Software Excellence",
                  desc: "Scalable web and mobile applications built with the latest technologies like React, Next.js, and AI integrations.",
                  delay: 0.1,
                },
                {
                  icon: <Shield size={24} />,
                  title: "Enterprise ERP",
                  desc: "Comprehensive management solutions for institutions and businesses to streamline operations and growth.",
                  delay: 0.2,
                },
              ].map((card) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: card.delay, ease: EASE }}
                  className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <ServicesSection />
        <ContactSection />
        <Footer />
      </main>
    </CompanyProvider>
  );
}
