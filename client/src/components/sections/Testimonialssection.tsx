"use client";

import React from "react";
import { Star } from "lucide-react";
import { useState } from "react";

// ── Google-style avatar ───────────────────────────────────────────────────────
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

// ── Card — pause scroll on hover only ────────────────────────────────────────
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
    className="flex flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 shrink-0 select-none"
    style={{ width: 320 }}
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
  >
    <div className="flex text-yellow-400 mb-3 gap-0.5">
      {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-current" />)}
    </div>
    <p className="text-sm text-gray-400 italic leading-relaxed flex-1 mb-4 line-clamp-3">
      "{text}"
    </p>
    <div className="flex items-center gap-3 mt-auto">
      <GoogleAvatar name={author} size={38} />
      <div>
        <span className="text-sm font-semibold text-white block leading-none mb-0.5">{author}</span>
        <span className="text-xs text-gray-600">Google Review</span>
      </div>
    </div>
  </div>
);

// ── Section ───────────────────────────────────────────────────────────────────
export const TestimonialsSection = () => {
  const [paused, setPaused] = useState(false);
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
          to   { transform: translateX(calc(-100% / 4 - 1rem)); }
        }
        .marquee-track { animation: marquee-slow 10s linear infinite; }
        .marquee-track.paused { animation-play-state: paused; }
      `}</style>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-16">
        <h2 className="text-yellow-500 font-mono tracking-widest uppercase mb-4 text-sm">Feedback</h2>
        <h3 className="text-4xl md:text-5xl font-bold mb-4">Client Testimonials</h3>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Hear from students and partners who've experienced AJU ED Solutions firsthand.
        </p>
      </div>

      {/* Marquee — overflow visible so expanded card isn't clipped */}
      <div className="relative w-full" style={{ overflowX: "clip", overflowY: "visible" }}>
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
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent sm:w-36" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent sm:w-36" />
      </div>

      {/* CTA */}
      <div className="text-center mt-8">
        <a
          href="https://rb.gy/36cf7e"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-sm text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300"
        >
          See More Google Reviews →
        </a>
      </div>
    </section>
  );
};