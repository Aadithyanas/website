"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCompany, CompanyId } from "./CompanyContext";

const EASE = [0.22, 1, 0.36, 1] as const;
const VP   = { once: true, amount: 0.2 };

const fadeUp = (delay = 0, distance = 28) => ({
  hidden:  { opacity: 0, y: distance, filter: "blur(6px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.85, delay, ease: EASE },
  },
});

const scaleIn = (delay = 0) => ({
  hidden:  { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1, opacity: 1,
    transition: { duration: 0.9, delay, ease: EASE },
  },
});

const COMPANY_ABOUT: Record<CompanyId, {
  title: string;
  subtitle: string;
  pillars: { label: string; text: string; color: string; delay: number }[];
}> = {
  default: {
    title: "Redefining Education & Technology",
    subtitle: "AJU ED SOLUTIONS is a leading AI, robotics & EdTech company in Kerala delivering innovative tech training, advanced web solutions, and empowering students, institutions, and enterprises.",
    pillars: [
      { label: "Mission", text: "Inspire learning and innovation through technology-driven education & enterprise solutions that make a real difference.", color: "#818cf8", delay: 0.38 },
      { label: "Vision", text: "Lead globally in digital education and enterprise solutions, becoming the benchmark for innovation in Kerala and beyond.", color: "#06d6a0", delay: 0.52 },
      { label: "Values", text: "Innovation, Integrity, Collaboration, and Excellence — the four pillars that guide every decision and product we build.", color: "#f472b6", delay: 0.66 },
    ]
  },
  ajuedsolution: {
    title: "Empowering Next-Gen Learners",
    subtitle: "Focusing on robotics training and project-based learning, AJU ED Solutions bridges the gap between academic theory and industry practice.",
    pillars: [
      { label: "Innovation", text: "Constant exploration of new pedagogical methods to make engineering education intuitive and effective.", color: "#818cf8", delay: 0.38 },
      { label: "Mentorship", text: "Dedicated support for students through internships and hands-on industry projects.", color: "#06d6a0", delay: 0.52 },
      { label: "Impact", text: "Transforming the careers of thousands of students through skill-oriented training and career guidance.", color: "#f472b6", delay: 0.66 },
    ]
  },
  techzora: {
    title: "Engineering the Future",
    subtitle: "AJU Techzora is where innovation meets execution. We specialize in building complex hardware-software integrated systems for the modern world.",
    pillars: [
      { label: "Agility", text: "Rapid prototyping and iterative development ensuring high-quality tech solutions at speed.", color: "#818cf8", delay: 0.38 },
      { label: "Intelligence", text: "Integrating AI and ML into every solution to provide data-driven insights and automation.", color: "#06d6a0", delay: 0.52 },
      { label: "Scalability", text: "Architecture designed to grow with your business, from MVP to enterprise-level platforms.", color: "#f472b6", delay: 0.66 },
    ]
  },
  brandify: {
    title: "Creative Storytelling",
    subtitle: "AJU Brandify helps businesses find their voice. We combine artistic vision with marketing science to create lasting brand impact.",
    pillars: [
      { label: "Strategy", text: "In-depth market research and positioning to ensure your brand reaches the right audience.", color: "#818cf8", delay: 0.38 },
      { label: "Identity", text: "Unique visual design that captures the soul of your business and resonates with customers.", color: "#06d6a0", delay: 0.52 },
      { label: "Growth", text: "Performance-oriented digital marketing that turns clicks into conversions and customers.", color: "#f472b6", delay: 0.66 },
    ]
  },
  scrumspacecoworks: {
    title: "The Ultimate Workspace",
    subtitle: "Scrumspace Coworks provides more than just a desk; we provide an ecosystem where ideas collide and grow into reality.",
    pillars: [
      { label: "Community", text: "A vibrant network of entrepreneurs and creators supporting each other's growth.", color: "#818cf8", delay: 0.38 },
      { label: "Design", text: "Ergonomic and aesthetic environments tailored for maximum focus and creativity.", color: "#06d6a0", delay: 0.52 },
      { label: "Flexibility", text: "Plans that adapt to your needs, whether you're a solo freelancer or a growing team.", color: "#f472b6", delay: 0.66 },
    ]
  }
};

export const AboutSection = () => {
  const reduced = useReducedMotion();
  const { activeCompany } = useCompany();
  const content = COMPANY_ABOUT[activeCompany] || COMPANY_ABOUT.default;

  return (
    <section
      id="about"
      className="relative border-t py-28 overflow-hidden"
      style={{
        background: "#000",
        borderColor: "rgba(99,102,241,0.08)",
      }}
    >
      {/* ── Ambient glows ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 40% 50% at 10% 60%, rgba(6,214,160,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 35% 45% at 90% 80%, rgba(244,114,182,0.06) 0%, transparent 60%)
          `,
          filter: "blur(2px)",
        }}
      />

      {/* ── Subtle grid ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">

        {/* Eyebrow */}
        <motion.p
          variants={fadeUp(0, 12)}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="font-mono tracking-widest uppercase text-sm mb-5"
          style={{ color: "rgba(99,102,241,0.85)" }}
        >
          {activeCompany === "default" ? "About Us" : activeCompany === "scrumspacecoworks" ? "About Scrumspace Coworks" : `About ${activeCompany}`}
        </motion.p>

        {/* Headline */}
        <motion.h2
          variants={fadeUp(0.12, 28)}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight"
          style={{
            background: "linear-gradient(135deg, #eef2ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {content.title}
        </motion.h2>

        {/* Divider */}
        <motion.div
          variants={scaleIn(0.26)}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="mb-8 h-px w-24 origin-center"
          style={{ background: "linear-gradient(90deg, transparent, #6366f1, #06d6a0, transparent)" }}
        />

        {/* Subtext */}
        <motion.p
          variants={fadeUp(0.32, 20)}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="text-base md:text-lg max-w-2xl leading-relaxed mb-16 sm:mb-20"
          style={{ color: "rgba(176,190,220,0.85)" }}
        >
          {content.subtitle}
        </motion.p>

        {/* Mission / Vision / Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full text-center">
          {content.pillars.map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp(item.delay, 32)}
              initial="hidden"
              whileInView="visible"
              viewport={VP}
              whileHover={reduced ? {} : { y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
              className="relative flex flex-col items-center gap-4 rounded-2xl p-7"
              style={{
                background: "linear-gradient(145deg, rgba(12,12,14,0.95), rgba(8,8,10,0.98))",
                border: `1px solid rgba(255,255,255,0.08)`,
                boxShadow: `5px 5px 18px rgba(0,0,0,0.52), -2px -2px 10px rgba(255,255,255,0.04)`,
                backdropFilter: "blur(10px)",
                transition: "box-shadow 0.35s ease, transform 0.25s ease",
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-16 rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}
              />

              {/* Label */}
              <h3
                className="text-xs font-mono tracking-[0.22em] uppercase"
                style={{ color: item.color }}
              >
                {item.label}
              </h3>

              {/* Dot */}
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
              />

              {/* Body */}
              <p className="text-sm leading-relaxed" style={{ color: "rgba(176,190,220,0.82)" }}>
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};