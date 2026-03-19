"use client";

import React from "react";
import { motion } from "framer-motion";

export const AboutSection = () => (
  <section
    id="about"
    className="bg-black text-white relative border-t border-white/5 py-28 overflow-hidden"
  >
    {/* Subtle ambient glow — not a lamp, just atmosphere */}
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
      style={{
        background: "radial-gradient(ellipse at top, rgba(6,182,212,0.12) 0%, transparent 70%)",
        filter: "blur(40px)",
      }}
    />

    <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center">

      {/* Eyebrow */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-cyan-400 font-mono tracking-widest uppercase text-sm mb-5"
      >
        About Us
      </motion.p>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 60%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Redefining Education<br />&amp; Technology
      </motion.h2>

      {/* Divider line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
        className="mb-8 h-px w-24 origin-center"
        style={{ background: "linear-gradient(90deg, transparent, #22d3ee, transparent)" }}
      />

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        className="text-gray-400 text-base md:text-lg max-w-2xl leading-relaxed mb-20"
      >
        <strong className="text-white">AJU ED SOLUTIONS</strong> is redefining
        education &amp; technology with{" "}
        <span className="text-cyan-400 font-medium">
          AI, ML, IoT, Robotics, ERP &amp; Web
        </span>{" "}
        solutions — empowering students, institutions, and enterprises.
      </motion.p>

      {/* Mission / Vision / Values */}
      <div className="grid md:grid-cols-3 gap-12 w-full text-center">
        {[
          {
            label: "Mission",
            color: "#22d3ee",
            textColor: "text-cyan-400",
            text: "Inspire learning and innovation through technology-driven education & enterprise solutions that make a real difference.",
            delay: 0.4,
          },
          {
            label: "Vision",
            color: "#818cf8",
            textColor: "text-indigo-400",
            text: "Lead globally in digital education and enterprise solutions, becoming the benchmark for innovation in Kerala and beyond.",
            delay: 0.5,
          },
          {
            label: "Values",
            color: "#34d399",
            textColor: "text-emerald-400",
            text: "Innovation, Integrity, Collaboration, and Excellence — the four pillars that guide every decision and product we build.",
            delay: 0.6,
          },
        ].map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: item.delay, ease: "easeOut" }}
            className="flex flex-col items-center gap-3"
          >
            <div
              className="h-px w-10"
              style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}
            />
            <h3 className={`text-xs font-mono tracking-[0.2em] uppercase ${item.textColor}`}>
              {item.label}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);