"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

// ── Shared easing / viewport ──────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;
const VP   = { once: true, amount: 0.15 };

const fadeUp = (delay = 0, distance = 24) => ({
  hidden:  { opacity: 0, y: distance, filter: "blur(5px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.75, delay, ease: EASE },
  },
});

// ── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#1a73e8", "#ea4335", "#34a853", "#fbbc04",
  "#9c27b0", "#00acc1", "#e67c73", "#0f9d58",
];
const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
const getColor = (name: string) =>
  AVATAR_COLORS[
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  ];

const GoogleAvatar = ({ name, size = 44 }: { name: string; size?: number }) => (
  <div
    className="shrink-0 flex items-center justify-center rounded-full text-white font-bold select-none shadow-md"
    style={{ background: getColor(name), width: size, height: size, fontSize: size * 0.38 }}
  >
    {getInitials(name)}
  </div>
);

// ── Data ──────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    text: "I had a wonderful experience at Aju ED Solutions. The faculty is highly knowledgeable, supportive, and always ready to clear doubts with patience. Highly recommended!",
    author: "Sradha Sunilkumar",
  },
  {
    text: "Thank you for helping me complete my mini project and teaching me patiently along the way. Learning was easy and enjoyable.",
    author: "Sreelekshmy",
  },
  {
    text: "The infrastructure is modern, classrooms well-equipped, and the learning environment truly inspiring. The staff is professional and genuinely focused on student growth.",
    author: "Athul Ashok",
  },
  {
    text: "Aju sir's classes helped me score very good grades. The teaching style made even tough subjects easier to understand.",
    author: "Abhishek",
  },
  {
    text: "The workshops bridged the gap between academics and industry. Learned how subjects interconnect and apply in real-world scenarios.",
    author: "Abin A S",
  },
];

// ── Card ──────────────────────────────────────────────────────────────────────
const TestimonialCard = ({
  author,
  text,
  setPaused,
}: {
  author: string;
  text: string;
  paused: boolean;
  setPaused: (v: boolean) => void;
}) => (
  <div
    className="flex flex-col rounded-2xl border border-white/[0.07] p-5 shrink-0 select-none"
    style={{
      width: 320,
      background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0))",
      backdropFilter: "blur(10px)",
      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    }}
    onMouseEnter={(e) => {
      setPaused(true);
      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.15)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
    }}
    onMouseLeave={(e) => {
      setPaused(false);
      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
    }}
  >
    {/* Stars */}
    <div className="flex text-yellow-400 mb-3 gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={13} className="fill-current" />
      ))}
    </div>

    {/* Quote */}
    <p className="text-sm text-gray-400 italic leading-relaxed flex-1 mb-4 line-clamp-3">
      "{text}"
    </p>

    {/* Author */}
    <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/[0.05]">
      <GoogleAvatar name={author} size={36} />
      <div>
        <span className="text-sm font-semibold text-white block leading-none mb-0.5">
          {author}
        </span>
        <span className="text-xs text-gray-600 font-mono tracking-wide">Google Review</span>
      </div>
    </div>
  </div>
);

// ── Section ───────────────────────────────────────────────────────────────────
export const TestimonialsSection = () => {
  const [paused, setPaused] = useState(false);
  // 4× duplication for seamless loop
  const items = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      id="testimonials"
      className="py-24 bg-black text-white relative border-t border-white/5"
      style={{ overflow: "hidden" }}
    >
      <style>{`
        @keyframes marquee-slow {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / 4 - 0.25rem)); }
        }
        .marquee-track {
          animation: marquee-slow 32s linear infinite;
          /* smooth start — ease-in for first 2s via will-change promotion */
          will-change: transform;
        }
        .marquee-track.paused { animation-play-state: paused; }
      `}</style>

      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[220px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, rgba(251,191,36,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center mb-16">
        <motion.p
          variants={fadeUp(0, 12)}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="font-mono tracking-widest uppercase text-sm mb-4"
          style={{ color: "rgba(234,179,8,0.8)" }}
        >
          Feedback
        </motion.p>
        <motion.h3
          variants={fadeUp(0.1, 24)}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Client Testimonials
        </motion.h3>
        <motion.p
          variants={fadeUp(0.2, 16)}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="text-gray-400 text-lg max-w-xl mx-auto"
        >
          Hear from students and partners who've experienced AJU ED Solutions firsthand.
        </motion.p>
      </div>

      {/* Marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VP}
        transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
        className="relative w-full"
        style={{ overflowX: "clip", overflowY: "visible" }}
      >
        <div
          className={`marquee-track flex w-max${paused ? " paused" : ""}`}
          style={{ gap: "1rem", paddingBottom: "2rem" }}
        >
          {items.map((t, i) => (
            <TestimonialCard
              key={i}
              author={t.author}
              text={t.text}
              paused={paused}
              setPaused={setPaused}
            />
          ))}
        </div>

        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-40"
          style={{ background: "linear-gradient(to right, #000, transparent)" }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-40"
          style={{ background: "linear-gradient(to left, #000, transparent)" }} />
      </motion.div>

      {/* CTA */}
      <motion.div
        variants={fadeUp(0.4, 16)}
        initial="hidden"
        whileInView="visible"
        viewport={VP}
        className="text-center mt-10"
      >
        <a
          href="https://rb.gy/36cf7e"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 text-sm text-gray-400 hover:bg-white/8 hover:text-white hover:border-white/35 transition-all duration-300"
        >
          See More Google Reviews →
        </a>
      </motion.div>
    </section>
  );
};