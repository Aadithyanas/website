"use client";

import React, { useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Cpu, Palette, Building, CheckCircle2 } from "lucide-react";
import { useCompany, CompanyId } from "./CompanyContext";

// ── Shared easing ─────────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;
const VP   = { once: true, amount: 0.15 };

const fadeUp = (delay = 0, distance = 28) => ({
  hidden:  { opacity: 0, y: distance, filter: "blur(5px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.75, delay, ease: EASE },
  },
});

// ── Company data ──────────────────────────────────────────────────────────────
const COMPANIES: {
  id: CompanyId;
  icon: React.ReactNode;
  title: string;
  tagline: string;
  desc: string;
  color: string;
  accent: string;
  border: string;
  glow: string;
  services: string[];
}[] = [
  {
    id: "techzora",
    icon: <Cpu size={30} />,
    title: "AJU TECHZORA",
    tagline: "Tech & Innovation",
    desc: "Web and mobile development, IoT, Robotics, AI/ML & Tech Solutions at low cost for customers and enterprises.",
    color: "text-cyan-400",
    accent: "rgba(34,211,238,0.10)",
    border: "rgba(34,211,238,0.35)",
    glow:   "rgba(34,211,238,0.15)",
    services: ["Web & App", "AI / ML", "IoT", "Robotics", "ERP"],
  },
  {
    id: "brandify",
    icon: <Palette size={30} />,
    title: "AJU Brandify",
    tagline: "Branding & Growth",
    desc: "Branding, Digital Marketing & Web Solutions to help businesses grow and shine online.",
    color: "text-purple-400",
    accent: "rgba(167,139,250,0.10)",
    border: "rgba(167,139,250,0.35)",
    glow:   "rgba(167,139,250,0.15)",
    services: ["Branding", "Marketing"],
  },
  {
    id: "scrumspace",
    icon: <Building size={30} />,
    title: "ScrumSpace CoWorks",
    tagline: "Community & Workspace",
    desc: "Modern coworking spaces with community-driven initiatives for startups and creators.",
    color: "text-blue-400",
    accent: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.35)",
    glow:   "rgba(59,130,246,0.15)",
    services: ["Co-working"],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export const CompaniesSection = () => {
  const { activeCompany, setActiveCompany } = useCompany();
  const reduced = useReducedMotion();

  const handleClick = useCallback((id: CompanyId) => {
    if (activeCompany === id) {
      setActiveCompany("default");
    } else {
      setActiveCompany(id);
      setTimeout(() => {
        document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    }
  }, [activeCompany, setActiveCompany]);

  return (
    <section
      id="companies"
      className="py-24 bg-black text-white relative border-t border-white/5 overflow-hidden"
    >
      {/* Ambient top glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[260px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, rgba(6,182,212,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            variants={fadeUp(0, 12)}
            initial="hidden"
            whileInView="visible"
            viewport={VP}
            className="font-mono tracking-widest uppercase text-sm mb-4"
            style={{ color: "rgba(34,211,238,0.8)" }}
          >
            Our Ventures
          </motion.p>
          <motion.h3
            variants={fadeUp(0.1, 24)}
            initial="hidden"
            whileInView="visible"
            viewport={VP}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Our Companies
          </motion.h3>
          <motion.p
            variants={fadeUp(0.18, 16)}
            initial="hidden"
            whileInView="visible"
            viewport={VP}
            className="text-gray-400 text-lg"
          >
            Innovating across multiple domains under the AJU umbrella
          </motion.p>
          <motion.p
            variants={fadeUp(0.24, 12)}
            initial="hidden"
            whileInView="visible"
            viewport={VP}
            className="text-gray-600 text-sm mt-2 font-mono tracking-wide"
          >
            ↓ Click a company card to filter services below
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {COMPANIES.map((comp, i) => {
            const isActive = activeCompany === comp.id;
            return (
              <motion.div
                key={comp.id}
                variants={fadeUp(0.1 + i * 0.12, 36)}
                initial="hidden"
                whileInView="visible"
                viewport={VP}
                whileHover={reduced ? {} : { y: -6, transition: { duration: 0.28, ease: "easeOut" } }}
                animate={isActive ? { y: -8 } : { y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                onClick={() => handleClick(comp.id)}
                className="cursor-pointer relative rounded-2xl p-8 overflow-hidden"
                style={{
                  background: isActive
                    ? `linear-gradient(145deg, ${comp.accent}, rgba(5,5,5,0.95))`
                    : "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0))",
                  border: `1px solid ${isActive ? comp.border : "rgba(255,255,255,0.07)"}`,
                  boxShadow: isActive
                    ? `0 8px 40px ${comp.glow}, 0 0 0 1px ${comp.border}`
                    : "none",
                  transition: "background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* Active badge */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15"
                  >
                    <CheckCircle2 size={11} className={comp.color} />
                    <span className={`text-[10px] font-semibold tracking-widest uppercase ${comp.color}`}>Active</span>
                  </motion.div>
                )}

                {/* Glow blob when active */}
                {isActive && (
                  <div
                    aria-hidden
                    className="absolute -top-12 -right-12 w-52 h-52 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${comp.glow} 0%, transparent 70%)`,
                      filter: "blur(28px)",
                    }}
                  />
                )}

                {/* Top accent line */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-20"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${isActive ? comp.border : "rgba(255,255,255,0.06)"}, transparent)`,
                    transition: "background 0.35s ease",
                  }}
                />

                {/* Icon */}
                <div
                  className={`${comp.color} mb-4 transition-transform duration-300 ${isActive ? "scale-110 drop-shadow-[0_0_12px_currentColor]" : ""}`}
                >
                  {comp.icon}
                </div>

                {/* Tagline */}
                <p className={`text-xs font-mono tracking-widest uppercase mb-2 ${comp.color} opacity-70`}>
                  {comp.tagline}
                </p>

                {/* Title */}
                <h4 className="text-xl font-bold mb-3">{comp.title}</h4>

                {/* Desc */}
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{comp.desc}</p>

                {/* Pills */}
                <div className="flex flex-wrap gap-2">
                  {comp.services.map((s) => (
                    <span
                      key={s}
                      className={`text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border transition-all duration-300 ${
                        isActive
                          ? `${comp.color} border-current bg-white/5`
                          : "text-gray-600 border-white/10"
                      }`}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* CTA hint */}
                <div
                  className={`mt-5 text-xs font-mono tracking-widest transition-all duration-300 ${
                    isActive ? comp.color : "text-gray-700"
                  }`}
                >
                  {isActive ? "▼ Showing filtered services" : "Click to filter services →"}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Reset */}
        {activeCompany !== "default" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="text-center mt-8"
          >
            <button
              onClick={() => setActiveCompany("default")}
              className="text-xs text-gray-500 hover:text-white font-mono tracking-widest uppercase border border-white/10 px-5 py-2.5 rounded-full hover:border-white/30 transition-all duration-200"
            >
              ✕ Show All Services
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};