"use client";

import React, { useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Cpu, Palette, Building, CheckCircle2 } from "lucide-react";
import { useCompany, CompanyId } from "./CompanyContext";

const EASE = [0.22, 1, 0.36, 1] as const;
const VP   = { once: true, amount: 0.15 };

const fadeUp = (delay = 0, distance = 28) => ({
  hidden:  { opacity: 0, y: distance, filter: "blur(5px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.75, delay, ease: EASE },
  },
});

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
    color: "#818cf8",
    accent: "rgba(99,102,241,0.10)",
    border: "rgba(99,102,241,0.38)",
    glow:   "rgba(99,102,241,0.18)",
    services: ["Web & App", "AI / ML", "IoT", "Robotics", "ERP"],
  },
  {
    id: "brandify",
    icon: <Palette size={30} />,
    title: "AJU Brandify",
    tagline: "Branding & Growth",
    desc: "Branding, Digital Marketing & Web Solutions to help businesses grow and shine online.",
    color: "#06d6a0",
    accent: "rgba(6,214,160,0.10)",
    border: "rgba(6,214,160,0.35)",
    glow:   "rgba(6,214,160,0.16)",
    services: ["Branding", "Marketing"],
  },
  {
    id: "scrumspace",
    icon: <Building size={30} />,
    title: "ScrumSpace CoWorks",
    tagline: "Community & Workspace",
    desc: "Modern coworking spaces with community-driven initiatives for startups and creators.",
    color: "#f472b6",
    accent: "rgba(244,114,182,0.10)",
    border: "rgba(244,114,182,0.32)",
    glow:   "rgba(244,114,182,0.15)",
    services: ["Co-working"],
  },
];

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
      className="py-24 text-white relative overflow-hidden"
      style={{
        background: "#000",
        borderTop: "1px solid rgba(99,102,241,0.08)",
      }}
    >
      {/* Ambient top glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[260px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, rgba(99,102,241,0.09) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            variants={fadeUp(0, 12)} initial="hidden" whileInView="visible" viewport={VP}
            className="font-mono tracking-widest uppercase text-sm mb-4"
            style={{ color: "rgba(99,102,241,0.85)" }}
          >
            Our Ventures
          </motion.p>
          <motion.h3
            variants={fadeUp(0.1, 24)} initial="hidden" whileInView="visible" viewport={VP}
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #eef2ff 0%, #c7d2fe 55%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}
          >
            Our Companies
          </motion.h3>
          <motion.p
            variants={fadeUp(0.18, 16)} initial="hidden" whileInView="visible" viewport={VP}
            className="text-lg mb-2"
            style={{ color: "rgba(176,190,220,0.75)" }}
          >
            Innovating across multiple domains under the AJU umbrella
          </motion.p>
          <motion.p
            variants={fadeUp(0.24, 12)} initial="hidden" whileInView="visible" viewport={VP}
            className="text-sm mt-2 font-mono tracking-wide"
            style={{ color: "rgba(110,130,168,0.7)" }}
          >
            ↓ Click a company card to filter services below
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
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
                className="cursor-pointer relative rounded-2xl p-7 overflow-hidden"
                style={{
                  /* Flat material base + neumorphic shadow */
                  background: isActive
                    ? `linear-gradient(145deg, ${comp.accent}, rgba(5,5,5,0.98))`
                    : "linear-gradient(145deg, rgba(12,12,14,0.95), rgba(8,8,10,0.98))",
                  border: `1px solid ${isActive ? comp.border : "rgba(255,255,255,0.06)"}`,
                  boxShadow: isActive
                    ? `0 8px 36px ${comp.glow}, 5px 5px 18px rgba(0,0,0,0.52), -2px -2px 10px rgba(255,255,255,0.04), 0 0 0 1px ${comp.border}`
                    : "5px 5px 18px rgba(0,0,0,0.48), -2px -2px 10px rgba(255,255,255,0.04)",
                  transition: "background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Active badge */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <CheckCircle2 size={11} style={{ color: comp.color }} />
                    <span
                      className="text-[10px] font-semibold tracking-widest uppercase"
                      style={{ color: comp.color }}
                    >
                      Active
                    </span>
                  </motion.div>
                )}

                {/* Glow blob when active */}
                {isActive && (
                  <div
                    aria-hidden
                    className="absolute -top-12 -right-12 w-52 h-52 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${comp.glow} 0%, transparent 70%)`,
                      filter: "blur(30px)",
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
                  className="mb-4 transition-transform duration-300"
                  style={{
                    color: comp.color,
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                    filter: isActive ? `drop-shadow(0 0 10px ${comp.color})` : "none",
                    transition: "transform 0.3s ease, filter 0.3s ease",
                  }}
                >
                  {comp.icon}
                </div>

                {/* Tagline */}
                <p
                  className="text-xs font-mono tracking-widest uppercase mb-2"
                  style={{ color: comp.color, opacity: 0.75 }}
                >
                  {comp.tagline}
                </p>

                {/* Title */}
                <h4
                  className="text-xl font-bold mb-3"
                  style={{ color: "#eef2ff" }}
                >
                  {comp.title}
                </h4>

                {/* Desc */}
                <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(176,190,220,0.72)" }}>
                  {comp.desc}
                </p>

                {/* Pills */}
                <div className="flex flex-wrap gap-2">
                  {comp.services.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border"
                      style={{
                        color: isActive ? comp.color : "rgba(110,130,168,0.65)",
                        borderColor: isActive ? comp.border : "rgba(255,255,255,0.08)",
                        background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* CTA hint */}
                <div
                  className="mt-5 text-xs font-mono tracking-widest"
                  style={{
                    color: isActive ? comp.color : "rgba(110,130,168,0.55)",
                    transition: "color 0.3s ease",
                  }}
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
              className="text-xs font-mono tracking-widest uppercase px-5 py-2.5 rounded-full transition-all duration-200"
              style={{
                color: "rgba(176,190,220,0.6)",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent",
                boxShadow: "3px 3px 12px rgba(0,0,0,0.42), -1px -1px 6px rgba(255,255,255,0.04)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#eef2ff";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(176,190,220,0.6)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              ✕ Show All Services
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};