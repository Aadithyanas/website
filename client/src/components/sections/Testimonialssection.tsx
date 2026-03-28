"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

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
  "#6366f1", "#818cf8", "#06d6a0", "#f472b6",
  "#a78bfa", "#38bdf8", "#fb923c", "#34d399",
];
const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
const getColor = (name: string) =>
  AVATAR_COLORS[
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  ];

const GoogleAvatar = ({ name, size = 48 }: { name: string; size?: number }) => (
  <div
    className="shrink-0 flex items-center justify-center rounded-full text-white font-bold select-none"
    style={{
      background: `linear-gradient(135deg, ${getColor(name)}, ${getColor(name)}aa)`,
      width: size,
      height: size,
      fontSize: size * 0.36,
      boxShadow: `0 0 18px ${getColor(name)}44, 4px 4px 14px rgba(0,0,0,0.55), -2px -2px 8px rgba(255,255,255,0.04)`,
    }}
  >
    {getInitials(name)}
  </div>
);

// ── Data ──────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    text: "I had a wonderful experience at Aju ED Solutions. The faculty is highly knowledgeable, supportive, and always ready to clear doubts with patience. Highly recommended!",
    author: "Sradha Sunilkumar",
    role: "B.Tech Student",
  },
  {
    text: "Thank you for helping me complete my mini project and teaching me patiently along the way. Learning was easy and enjoyable.",
    author: "Sreelekshmy",
    role: "Engineering Student",
  },
  {
    text: "The infrastructure is modern, classrooms well-equipped, and the learning environment truly inspiring. The staff is professional and genuinely focused on student growth.",
    author: "Athul Ashok",
    role: "Alumni",
  },
  {
    text: "Aju sir's classes helped me score very good grades. The teaching style made even tough subjects easier to understand.",
    author: "Abhishek",
    role: "B.Tech Student",
  },
  {
    text: "The workshops bridged the gap between academics and industry. Learned how subjects interconnect and apply in real-world scenarios.",
    author: "Abin A S",
    role: "Workshop Attendee",
  },
];

// ── Testimonial Card ──────────────────────────────────────────────────────────
const TestimonialCard = ({
  text, author, role,
}: {
  text: string; author: string; role: string;
}) => (
  <div
    className="flex flex-col h-full rounded-3xl p-8 relative overflow-hidden"
    style={{
      background: "linear-gradient(145deg, #0d0d0d, #080808)",
      border: "1px solid rgba(99,102,241,0.15)",
      boxShadow: "6px 6px 22px rgba(0,0,0,0.65), -3px -3px 12px rgba(255,255,255,0.04)",
    }}
  >
    {/* Top-right glow blob */}
    <div
      aria-hidden
      className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
      style={{
        background: `radial-gradient(circle, ${getColor(author)}20 0%, transparent 70%)`,
        filter: "blur(20px)",
      }}
    />

    {/* Quote mark */}
    <div
      className="text-7xl font-serif leading-none mb-4 select-none"
      style={{
        background: "linear-gradient(135deg, #6366f1, #06d6a0)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        opacity: 0.35,
        lineHeight: 0.8,
      }}
    >
      &ldquo;
    </div>

    {/* Stars */}
    <div className="flex gap-1 mb-4" style={{ color: "#fbbf24" }}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} className="fill-current" />
      ))}
    </div>

    {/* Text */}
    <p
      className="text-base leading-relaxed flex-1 mb-8 italic"
      style={{ color: "rgba(200,210,230,0.82)" }}
    >
      {text}
    </p>

    {/* Author footer */}
    <div
      className="flex items-center gap-4 pt-5"
      style={{ borderTop: "1px solid rgba(99,102,241,0.1)" }}
    >
      <GoogleAvatar name={author} size={48} />
      <div>
        <p className="font-semibold text-base" style={{ color: "#eef2ff" }}>
          {author}
        </p>
        <p className="text-xs font-mono tracking-wide mt-0.5" style={{ color: "rgba(110,130,168,0.75)" }}>
          {role} · Google Review
        </p>
      </div>
    </div>
  </div>
);

// ── Section ───────────────────────────────────────────────────────────────────
export const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const total = TESTIMONIALS.length;

  // Touch/swipe support
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  };

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  const variants = {
    enter:  (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, filter: "blur(6px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit:   (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, filter: "blur(6px)" }),
  };

  return (
    <section
      id="testimonials"
      className="py-24 text-white relative overflow-hidden"
      style={{ background: "#000", borderTop: "1px solid rgba(99,102,241,0.08)" }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, rgba(99,102,241,0.1) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            variants={fadeUp(0, 12)} initial="hidden" whileInView="visible" viewport={VP}
            className="font-mono tracking-widest uppercase text-sm mb-4"
            style={{ color: "rgba(251,191,36,0.9)" }}
          >
            Feedback
          </motion.p>
          <motion.h2
            variants={fadeUp(0.1, 24)} initial="hidden" whileInView="visible" viewport={VP}
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #eef2ff 0%, #c7d2fe 55%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}
          >
            Client Testimonials
          </motion.h2>
          <motion.p
            variants={fadeUp(0.2, 16)} initial="hidden" whileInView="visible" viewport={VP}
            className="text-lg max-w-xl mx-auto"
            style={{ color: "rgba(176,190,220,0.72)" }}
          >
            Hear from students and partners who&apos;ve experienced AJU ED Solutions firsthand.
          </motion.p>
        </div>

        {/* Card slider */}
        <motion.div
          variants={fadeUp(0.25, 20)} initial="hidden" whileInView="visible" viewport={VP}
          className="relative"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Prev / Next arrows */}
          <button
            onClick={goPrev}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full -translate-x-4 sm:-translate-x-6 transition-all duration-200"
            style={{
              background: "rgba(10,10,10,0.9)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#818cf8",
              boxShadow: "4px 4px 14px rgba(0,0,0,0.6), -2px -2px 8px rgba(255,255,255,0.04)",
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = "rgba(99,102,241,0.6)";
              b.style.boxShadow = "0 0 18px rgba(99,102,241,0.3), 4px 4px 14px rgba(0,0,0,0.6), -2px -2px 8px rgba(255,255,255,0.04)";
              b.style.color = "#eef2ff";
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = "rgba(99,102,241,0.25)";
              b.style.boxShadow = "4px 4px 14px rgba(0,0,0,0.6), -2px -2px 8px rgba(255,255,255,0.04)";
              b.style.color = "#818cf8";
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goNext}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full translate-x-4 sm:translate-x-6 transition-all duration-200"
            style={{
              background: "rgba(10,10,10,0.9)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#818cf8",
              boxShadow: "4px 4px 14px rgba(0,0,0,0.6), -2px -2px 8px rgba(255,255,255,0.04)",
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = "rgba(99,102,241,0.6)";
              b.style.boxShadow = "0 0 18px rgba(99,102,241,0.3), 4px 4px 14px rgba(0,0,0,0.6), -2px -2px 8px rgba(255,255,255,0.04)";
              b.style.color = "#eef2ff";
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = "rgba(99,102,241,0.25)";
              b.style.boxShadow = "4px 4px 14px rgba(0,0,0,0.6), -2px -2px 8px rgba(255,255,255,0.04)";
              b.style.color = "#818cf8";
            }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Animated card */}
          <div className="overflow-hidden rounded-3xl mx-6 sm:mx-10" style={{ minHeight: 340 }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: EASE }}
                className="w-full"
              >
                <TestimonialCard
                  text={TESTIMONIALS[current].text}
                  author={TESTIMONIALS[current].author}
                  role={TESTIMONIALS[current].role}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2.5 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 28 : 8,
                height: 8,
                background: i === current
                  ? "linear-gradient(90deg, #6366f1, #06d6a0)"
                  : "rgba(99,102,241,0.2)",
                boxShadow: i === current
                  ? "0 0 10px rgba(99,102,241,0.5)"
                  : "none",
              }}
            />
          ))}
        </div>

        {/* Counter text */}
        <p
          className="text-center mt-4 text-xs font-mono tracking-widest"
          style={{ color: "rgba(110,130,168,0.6)" }}
        >
          {current + 1} / {total}
        </p>

        {/* CTA */}
        <motion.div
          variants={fadeUp(0.4, 16)} initial="hidden" whileInView="visible" viewport={VP}
          className="text-center mt-10"
        >
          <a
            href="https://rb.gy/36cf7e"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm transition-all duration-300"
            style={{
              border: "1px solid rgba(99,102,241,0.2)",
              color: "rgba(176,190,220,0.75)",
              background: "transparent",
              boxShadow: "3px 3px 12px rgba(0,0,0,0.42), -1px -1px 6px rgba(255,255,255,0.04)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "rgba(99,102,241,0.1)";
              el.style.color = "#eef2ff";
              el.style.borderColor = "rgba(99,102,241,0.45)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "transparent";
              el.style.color = "rgba(176,190,220,0.75)";
              el.style.borderColor = "rgba(99,102,241,0.2)";
            }}
          >
            <ExternalLink size={14} />
            See All Google Reviews
          </a>
        </motion.div>
      </div>
    </section>
  );
};