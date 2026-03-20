"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const VP   = { once: true, amount: 0.15 };

const fadeUp = (delay = 0, distance = 24) => ({
  hidden:  { opacity: 0, y: distance, filter: "blur(4px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.75, delay, ease: EASE },
  },
});

const scaleIn = (delay = 0) => ({
  hidden:  { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1, opacity: 1,
    transition: { duration: 0.9, delay, ease: EASE },
  },
});

const pillars = [
  {
    label: "Mission",
    color: "#22d3ee",
    glowColor: "rgba(34,211,238,0.12)",
    textColor: "text-cyan-400",
    borderColor: "rgba(34,211,238,0.2)",
    text: "Inspire learning and innovation through technology-driven education & enterprise solutions that make a real difference.",
    delay: 0.38,
  },
  {
    label: "Vision",
    color: "#818cf8",
    glowColor: "rgba(129,140,248,0.12)",
    textColor: "text-indigo-400",
    borderColor: "rgba(129,140,248,0.2)",
    text: "Lead globally in digital education and enterprise solutions, becoming the benchmark for innovation in Kerala and beyond.",
    delay: 0.52,
  },
  {
    label: "Values",
    color: "#34d399",
    glowColor: "rgba(52,211,153,0.12)",
    textColor: "text-emerald-400",
    borderColor: "rgba(52,211,153,0.2)",
    text: "Innovation, Integrity, Collaboration, and Excellence — the four pillars that guide every decision and product we build.",
    delay: 0.66,
  },
];

export const AboutSection = () => {
  const reduced = useReducedMotion();

  return (
    <section
      id="about"
      className="relative border-t border-white/5 py-28 overflow-hidden"
      style={{ background: "#000000" }}
    >
      {/* Ambient glows */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(6,182,212,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 40% 50% at 10% 60%, rgba(99,102,241,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 35% 45% at 90% 80%, rgba(52,211,153,0.06) 0%, transparent 60%)
          `,
          filter: "blur(2px)",
        }}
      />

      {/* Subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center">

        {/* Eyebrow */}
        <motion.p
          variants={fadeUp(0, 12)}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="font-mono tracking-widest uppercase text-sm mb-5"
          style={{ color: "rgba(34,211,238,0.8)" }}
        >
          About Us
        </motion.p>

        {/* Headline */}
        <motion.h2
          variants={fadeUp(0.12, 28)}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 55%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Redefining Education<br />&amp; Technology
        </motion.h2>

        {/* Divider */}
        <motion.div
          variants={scaleIn(0.26)}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="mb-8 h-px w-24 origin-center"
          style={{ background: "linear-gradient(90deg, transparent, #22d3ee, transparent)" }}
        />

        {/* Subtext */}
        <motion.p
          variants={fadeUp(0.32, 20)}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="text-base md:text-lg max-w-2xl leading-relaxed mb-20"
          style={{ color: "rgba(148,163,184,0.85)" }}
        >
          <strong className="text-white font-semibold">AJU ED SOLUTIONS</strong> is redefining
          education &amp; technology with{" "}
          <span style={{ color: "#67e8f9", fontWeight: 500 }}>
            AI, ML, IoT, Robotics, ERP &amp; Web
          </span>{" "}
          solutions — empowering students, institutions, and enterprises.
        </motion.p>

        {/* Mission / Vision / Values */}
        <div className="grid md:grid-cols-3 gap-6 w-full text-center">
          {pillars.map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp(item.delay, 32)}
              initial="hidden"
              whileInView="visible"
              viewport={VP}
              whileHover={reduced ? {} : { y: -5, transition: { duration: 0.25, ease: "easeOut" } }}
              className="relative flex flex-col items-center gap-4 rounded-2xl p-8"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: `1px solid ${item.borderColor}`,
                boxShadow: `0 0 0 0 ${item.glowColor}`,
                backdropFilter: "blur(8px)",
                transition: "box-shadow 0.35s ease",
              }}
              onHoverStart={(e) => {
                (e.target as HTMLElement).style.boxShadow =
                  `0 8px 32px ${item.glowColor}, 0 0 0 1px ${item.borderColor}`;
              }}
              onHoverEnd={(e) => {
                (e.target as HTMLElement).style.boxShadow = `0 0 0 0 ${item.glowColor}`;
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-16 rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}
              />

              {/* Label */}
              <h3 className={`text-xs font-mono tracking-[0.22em] uppercase ${item.textColor}`}>
                {item.label}
              </h3>

              {/* Dot */}
              <div
                className="w-1 h-1 rounded-full"
                style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
              />

              {/* Body */}
              <p className="text-sm leading-relaxed" style={{ color: "rgba(148,163,184,0.8)" }}>
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};