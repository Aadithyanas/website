"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Lightbulb, Monitor, LayoutTemplate, Server, ChevronDown, Cpu } from "lucide-react";

/* ─────────────────────────────────────────────────
   CONFIG
   ───────────────────────────────────────────────── */
const TOTAL_FRAMES = 210;
const FRAME_STEP = 3; // Load every 3rd frame for performance
const SAMPLED_FRAMES = Math.ceil(TOTAL_FRAMES / FRAME_STEP); // ~70 frames
const IMAGE_PATH = "/images/techzora2hero/ezgif-frame-";

// Features that appear at different scroll phases
const FEATURES = [
  {
    title: "Innovative Ideation",
    description: "Brainstorming and conceptualizing solutions that drive digital transformation.",
    icon: <Lightbulb size={22} />,
    color: "#fbbf24",
    phase: 0, // 0-25% scroll
  },
  {
    title: "Software Engineering",
    description: "Writing clean, scalable code for robust web and mobile applications.",
    icon: <Monitor size={22} />,
    color: "#818cf8",
    phase: 1, // 25-50% scroll
  },
  {
    title: "UI/UX Design",
    description: "Creating intuitive and engaging user interfaces that delight your customers.",
    icon: <LayoutTemplate size={22} />,
    color: "#f472b6",
    phase: 2, // 50-75% scroll
  },
  {
    title: "System Architecture",
    description: "Designing scalable and secure infrastructures to power enterprise solutions.",
    icon: <Server size={22} />,
    color: "#06d6a0",
    phase: 3, // 75-100% scroll
  },
];

/* ─────────────────────────────────────────────────
   Preload sampled images into memory
   ───────────────────────────────────────────────── */
function usePreloadedImages() {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const imgs: HTMLImageElement[] = [];
    let count = 0;

    // Build list of frame indices to load (1, 4, 7, 10, ... 148)
    const frameIndices: number[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += FRAME_STEP) {
      frameIndices.push(i);
    }
    const total = frameIndices.length;

    for (const frameNum of frameIndices) {
      const img = new Image();
      img.src = `${IMAGE_PATH}${String(frameNum).padStart(3, "0")}.png`;
      img.onload = () => {
        count++;
        if (!cancelled) {
          setProgress(Math.round((count / total) * 100));
          if (count === total) {
            setImages(imgs);
            setLoaded(true);
          }
        }
      };
      img.onerror = () => {
        count++;
        if (!cancelled && count === total) {
          setImages(imgs);
          setLoaded(true);
        }
      };
      imgs.push(img);
    }

    return () => { cancelled = true; };
  }, []);

  return { images, loaded, progress };
}

/* ─────────────────────────────────────────────────
   Canvas-based frame renderer — FULL SCREEN
   ───────────────────────────────────────────────── */
function FrameCanvas({
  images,
  frameIndex,
}: {
  images: HTMLImageElement[];
  frameIndex: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastDrawn = useRef(-1);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;

    const idx = Math.max(0, Math.min(frameIndex, images.length - 1));
    if (idx === lastDrawn.current) return;
    lastDrawn.current = idx;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = images[idx];
    if (!img || !img.complete) return;

    // Set canvas to viewport size
    const dpr = window.devicePixelRatio || 1;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    ctx.scale(dpr, dpr);

    // Draw image as "cover" — scale up slightly (1.1x) to crop out Veo watermark
    const scale = 1.1;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = vw / vh;

    let drawW: number, drawH: number, drawX: number, drawY: number;
    if (imgAspect > canvasAspect) {
      // Image is wider — fit to height
      drawH = vh * scale;
      drawW = drawH * imgAspect;
    } else {
      // Image is taller — fit to width
      drawW = vw * scale;
      drawH = drawW / imgAspect;
    }
    drawX = (vw - drawW) / 2;
    drawY = (vh - drawH) / 2;

    ctx.clearRect(0, 0, vw, vh);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, [images, frameIndex]);

  useEffect(() => {
    drawFrame();
  }, [drawFrame]);

  // Re-draw on window resize
  useEffect(() => {
    const handleResize = () => {
      lastDrawn.current = -1; // Force redraw
      drawFrame();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
}

/* ─────────────────────────────────────────────────
   Feature Card Component
   ───────────────────────────────────────────────── */
function FeatureCard({
  feature,
  isActive,
  index,
}: {
  feature: (typeof FEATURES)[0];
  isActive: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40, filter: "blur(8px)" }}
      animate={
        isActive
          ? { opacity: 1, x: 0, filter: "blur(0px)" }
          : { opacity: 0, x: index % 2 === 0 ? -40 : 40, filter: "blur(8px)" }
      }
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-4 p-6 rounded-2xl max-w-sm"
      style={{
        background: isActive
          ? "linear-gradient(145deg, rgba(15,15,20,0.9), rgba(8,8,12,0.95))"
          : "transparent",
        border: isActive ? `1px solid ${feature.color}25` : "1px solid transparent",
        boxShadow: isActive
          ? `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${feature.color}10`
          : "none",
        backdropFilter: isActive ? "blur(12px)" : "none",
      }}
    >
      <div
        className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: `${feature.color}15`,
          border: `1px solid ${feature.color}30`,
          color: feature.color,
        }}
      >
        {feature.icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(176,190,220,0.7)" }}>
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────
   MAIN HERO COMPONENT
   ───────────────────────────────────────────────── */
export default function TechzoraScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { images, loaded, progress } = usePreloadedImages();

  // Scroll progress for the pinned section (0 → 1)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth out the scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Map scroll to frame index
  const [frameIndex, setFrameIndex] = useState(0);
  const [activePhase, setActivePhase] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const unsub = smoothProgress.on("change", (v) => {
      setFrameIndex(Math.round(v * (SAMPLED_FRAMES - 1)));
      setActivePhase(Math.min(3, Math.floor(v * 4)));
      setScrollPct(v);
    });
    return unsub;
  }, [smoothProgress]);

  // Text transforms
  const heroTitleY = useTransform(scrollYProgress, [0, 0.15], [0, -80]);
  const heroTitleOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const subtitleOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // Feature label transforms
  const featureLabelOpacity = useTransform(scrollYProgress, [0.08, 0.15], [0, 1]);

  // Scroll indicator
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  return (
    <>
      {/* Loading screen */}
      {!loaded && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black">
          <div className="relative w-20 h-20 mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40" cy="40" r="36"
                fill="none"
                stroke="rgba(99,102,241,0.15)"
                strokeWidth="3"
              />
              <circle
                cx="40" cy="40" r="36"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                style={{ transition: "stroke-dashoffset 0.3s ease" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-mono text-indigo-300">
              {progress}%
            </span>
          </div>
          <p className="text-indigo-400/60 text-xs font-mono tracking-widest uppercase">
            Loading Experience
          </p>
        </div>
      )}

      {/* Scroll container — tall to allow scrolling; content is pinned */}
      <div ref={containerRef} style={{ height: "500vh" }} className="relative">
        {/* Pinned viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: "#000" }}>

          {/* ── LAYER 0: Full-screen robot canvas (background) ── */}
          <div className="absolute inset-0 z-0">
            {loaded && <FrameCanvas images={images} frameIndex={frameIndex} />}
          </div>

          {/* ── LAYER 1: Subtle dark overlay for text readability ── */}
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              background: `linear-gradient(
                180deg,
                rgba(0,0,0,0.6) 0%,
                rgba(0,0,0,0.1) 30%,
                rgba(0,0,0,0.05) 50%,
                rgba(0,0,0,0.1) 70%,
                rgba(0,0,0,0.7) 100%
              )`,
            }}
          />

          {/* ── LAYER 2: Ambient glows ── */}
          <div className="absolute inset-0 z-[2] pointer-events-none">
            <div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                top: "5%",
                left: "0%",
                background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <div
              className="absolute w-[500px] h-[500px] rounded-full"
              style={{
                bottom: "0%",
                right: "5%",
                background: "radial-gradient(circle, rgba(6,214,160,0.04) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
          </div>

          {/* ── LAYER 3: All text & UI overlays ── */}
          <div className="absolute inset-0 z-10 flex flex-col">

            {/* ── Top: Title + Subtitle (fades out as you scroll) ── */}
            <motion.div
              className="flex flex-col items-center text-center pt-24 sm:pt-28 px-4"
              style={{ y: heroTitleY, opacity: heroTitleOpacity }}
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={loaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase mb-5"
                style={{
                  border: "1px solid rgba(99,102,241,0.3)",
                  background: "rgba(99,102,241,0.1)",
                  backdropFilter: "blur(8px)",
                  color: "#a5b4fc",
                }}
              >
                <Cpu size={14} />
                Innovation Hub
              </motion.div>

              <motion.img
                src="/images/brands/techzora.png"
                alt="AJU Techzora"
                initial={{ opacity: 0, y: 24 }}
                animate={loaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="w-80 sm:w-[28rem] md:w-[36rem] lg:w-[48rem] object-contain"
                style={{
                  filter: "drop-shadow(0 0 40px rgba(99,102,241,0.4))",
                }}
              />

              <motion.p
                className="text-lg sm:text-xl max-w-xl mt-4"
                style={{ color: "rgba(200,210,230,0.8)" }}
                initial={{ opacity: 0, y: 16 }}
                animate={loaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                Scroll to explore what powers our technology
              </motion.p>
            </motion.div>

            {/* ── Spacer (pushes features to sides, leaves robot visible in center) ── */}
            <div className="flex-1 relative">
              {/* Desktop: Feature cards on left & right sides */}
              <div className="absolute left-4 sm:left-8 lg:left-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4">
                {FEATURES.filter((_, i) => i % 2 === 0).map((f, i) => (
                  <FeatureCard
                    key={f.title}
                    feature={f}
                    isActive={activePhase >= f.phase}
                    index={i * 2}
                  />
                ))}
              </div>
              <div className="absolute right-4 sm:right-8 lg:right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4">
                {FEATURES.filter((_, i) => i % 2 !== 0).map((f, i) => (
                  <FeatureCard
                    key={f.title}
                    feature={f}
                    isActive={activePhase >= f.phase}
                    index={i * 2 + 1}
                  />
                ))}
              </div>

              {/* Mobile: Feature card at bottom */}
              <motion.div
                className="absolute bottom-4 left-4 right-4 lg:hidden"
                style={{ opacity: featureLabelOpacity }}
              >
                {FEATURES.map((f) => (
                  <motion.div
                    key={f.title}
                    initial={false}
                    animate={
                      activePhase === f.phase
                        ? { opacity: 1, y: 0, scale: 1 }
                        : { opacity: 0, y: 20, scale: 0.95 }
                    }
                    transition={{ duration: 0.5 }}
                    className="absolute bottom-0 left-0 right-0"
                    style={{ display: activePhase === f.phase ? "block" : "none" }}
                  >
                    <div
                      className="flex items-center gap-3 p-4 rounded-2xl"
                      style={{
                        background: "rgba(0,0,0,0.8)",
                        border: `1px solid ${f.color}25`,
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <div
                        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${f.color}15`,
                          color: f.color,
                        }}
                      >
                        {f.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{f.title}</h3>
                        <p className="text-xs" style={{ color: "rgba(176,190,220,0.6)" }}>
                          {f.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* ── Bottom: Phase indicator + Current label + Scroll hint ── */}
            <div className="pb-6 flex flex-col items-center gap-3">
              {/* Current feature label */}
              <motion.p
                className="text-xs font-mono tracking-[0.3em] uppercase text-center"
                style={{
                  color: FEATURES[activePhase]?.color || "#818cf8",
                  opacity: featureLabelOpacity,
                }}
              >
                {FEATURES[activePhase]?.title}
              </motion.p>

              {/* Phase dots */}
              <motion.div
                className="flex items-center justify-center gap-2"
                style={{ opacity: featureLabelOpacity }}
              >
                {FEATURES.map((f, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: activePhase === i ? 32 : 8,
                      background: activePhase >= i ? f.color : "rgba(255,255,255,0.12)",
                      boxShadow: activePhase === i ? `0 0 12px ${f.color}60` : "none",
                    }}
                  />
                ))}
              </motion.div>

              {/* Scroll indicator (visible only at start) */}
              <motion.div
                className="flex flex-col items-center gap-1"
                style={{ opacity: scrollIndicatorOpacity }}
              >
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-indigo-400/50">
                  Scroll
                </span>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ChevronDown size={16} className="text-indigo-400/40" />
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* ── Scroll progress bar ── */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] z-30">
            <div
              className="h-full"
              style={{
                width: `${scrollPct * 100}%`,
                background: "linear-gradient(90deg, #6366f1, #06d6a0, #f472b6)",
                boxShadow: "0 0 12px rgba(99,102,241,0.5)",
                transition: "width 0.05s linear",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
