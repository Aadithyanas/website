"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ArrowRight, Check, Globe, Camera, MessageCircle } from "lucide-react";

/* ─────────────────────────────────────────────────
   SHARED COMPONENTS
   ───────────────────────────────────────────────── */
function WordsPullUp({
  text,
  className = "",
  showAsterisk = false,
  style = {},
}: {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const words = text.split(" ");

  return (
    <h1 ref={ref} className={`flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLastWord = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: "20%", opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: i * 0.08,
            }}
            className="mr-[0.2em] relative inline-block whitespace-nowrap"
          >
            {word}
            {isLastWord && showAsterisk && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">
                *
              </span>
            )}
          </motion.span>
        );
      })}
    </h1>
  );
}

function WordsPullUpMultiStyle({
  segments,
  containerClassName = "",
}: {
  segments: { text: string; className?: string }[];
  containerClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  let wordIndex = 0;

  return (
    <div
      ref={ref}
      className={`inline-flex flex-wrap justify-center ${containerClassName}`}
    >
      {segments.map((seg, sIdx) => {
        const words = seg.text.split(" ");
        return (
          <span key={sIdx} className={`contents ${seg.className || ""}`}>
            {words.map((word, wIdx) => {
              const currentWordIndex = wordIndex++;
              return (
                <motion.span
                  key={wIdx}
                  initial={{ y: "20%", opacity: 0 }}
                  animate={isInView ? { y: 0, opacity: 1 } : {}}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    delay: currentWordIndex * 0.08,
                  }}
                  className="mr-[0.25em] relative inline-block whitespace-nowrap"
                >
                  {word}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

function AnimatedLetter({
  char,
  index,
  totalChars,
  scrollYProgress,
}: {
  char: string;
  index: number;
  totalChars: number;
  scrollYProgress: any;
}) {
  const charProgress = index / totalChars;
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, charProgress - 0.1), Math.min(1, charProgress + 0.05)],
    [0.2, 1]
  );
  return (
    <motion.span style={{ opacity }}>
      {char}
    </motion.span>
  );
}

/* ─────────────────────────────────────────────────
   SECTION 1: HERO
   ───────────────────────────────────────────────── */
function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Preload images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;
    for (let i = 1; i <= 195; i++) {
      const img = new Image();
      // Format number to 3 digits e.g. 001, 002
      const num = i.toString().padStart(3, '0');
      img.src = `/images/techzorahero/ezgif-frame-${num}.png`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 195) {
          setImages(loadedImages);
        }
      };
      loadedImages.push(img);
    }
  }, []);

  // Draw frame on canvas when scroll or images load
  const drawFrame = (index: number) => {
    if (!canvasRef.current || images.length === 0) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Setup canvas dimensions if not set
    if (canvasRef.current.width !== window.innerWidth || canvasRef.current.height !== window.innerHeight) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }

    const img = images[index];
    if (!img) return;

    // Calculate aspect ratio to cover the screen
    const hRatio = canvasRef.current.width / img.width;
    const vRatio = canvasRef.current.height / img.height;

    // Scale up by 15% to crop out the Gemini watermark in the bottom right corner
    const ratio = Math.max(hRatio, vRatio) * 1.15;

    const centerShift_x = (canvasRef.current.width - img.width * ratio) / 2;
    const centerShift_y = (canvasRef.current.height - img.height * ratio) / 2;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(img, 0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (images.length === 0) return;
    const frameIndex = Math.min(
      images.length - 1,
      Math.floor(latest * images.length)
    );
    drawFrame(frameIndex);
  });

  // Draw initial frame once loaded
  useEffect(() => {
    if (images.length > 0) {
      drawFrame(0);
    }
  }, [images]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (images.length > 0) {
        drawFrame(Math.min(images.length - 1, Math.floor(scrollYProgress.get() * images.length)));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [images, scrollYProgress]);

  // Text animations - using explicit bounds from 0 to 1 to fix overlapping
  const logoOpacity = useTransform(scrollYProgress, [0, 0.15, 0.25, 1], [1, 1, 0, 0]);
  const logoY = useTransform(scrollYProgress, [0, 0.25, 1], [0, -50, -50]);
  const logoPointer = useTransform(scrollYProgress, (val) => val > 0.2 ? "none" : "auto");

  // Feature 1
  const f1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.3, 0.45, 0.55, 1], [0, 0, 1, 1, 0, 0]);
  const f1Y = useTransform(scrollYProgress, [0, 0.2, 0.3, 0.45, 0.55, 1], [50, 50, 0, 0, -50, -50]);

  // Feature 2
  const f2Opacity = useTransform(scrollYProgress, [0, 0.5, 0.6, 0.75, 0.85, 1], [0, 0, 1, 1, 0, 0]);
  const f2Y = useTransform(scrollYProgress, [0, 0.5, 0.6, 0.75, 0.85, 1], [50, 50, 0, 0, -50, -50]);

  // Feature 3 / CTA
  const f3Opacity = useTransform(scrollYProgress, [0, 0.8, 0.9, 1], [0, 0, 1, 1]);
  const f3Y = useTransform(scrollYProgress, [0, 0.8, 0.9, 1], [50, 50, 0, 0]);
  const f3Pointer = useTransform(scrollYProgress, (val) => val > 0.85 ? "auto" : "none");

  return (
    <section ref={containerRef} className="relative w-full h-[400vh] bg-black font-sans">
      <div className="sticky top-0 w-full h-screen overflow-hidden">

        {/* Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

        {/* Content Overlays */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center pointer-events-none">

          {/* Logo & Manifesto */}
          <motion.div
            style={{ opacity: logoOpacity, y: logoY, pointerEvents: logoPointer as any }}
            className="absolute flex flex-col items-center justify-center w-full"
          >
            <img
              src="/images/brands/techzora.png"
              alt="AJU Techzora"
              className="w-[18rem] sm:w-[24rem] md:w-[32rem] lg:w-[40rem] object-contain mb-8"
              style={{ filter: "drop-shadow(0 0 15px rgba(255,255,255,0.4))" }}
            />

          </motion.div>

          {/* Feature 1 */}
          <motion.div
            style={{ opacity: f1Opacity, y: f1Y }}
            className="absolute flex flex-col items-center justify-center w-full max-w-3xl"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Hardware & Software Integration</h2>
            <p className="text-lg md:text-2xl text-white/80">Seamlessly blending the physical and digital worlds to build next-generation automated systems.</p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            style={{ opacity: f2Opacity, y: f2Y }}
            className="absolute flex flex-col items-center justify-center w-full max-w-3xl"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">AI & Automation</h2>
            <p className="text-lg md:text-2xl text-white/80">Empowering enterprises with intelligent workflows, predictive analytics, and autonomous operations.</p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            style={{ opacity: f3Opacity, y: f3Y, pointerEvents: f3Pointer as any }}
            className="absolute flex flex-col items-center justify-center w-full max-w-3xl"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Engineering the Future</h2>
            <p className="text-lg md:text-2xl text-white/80 mb-8">From custom ERP solutions to advanced robotics integrations.</p>
            <div className="flex gap-4 pointer-events-auto">
              <a href="#services" className="liquid-glass rounded-full p-4 text-white hover:bg-white/10 transition-all">
                <Globe size={24} />
              </a>
              <a href="#contact" className="liquid-glass rounded-full p-4 text-white hover:bg-white/10 transition-all">
                <MessageCircle size={24} />
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   SECTION 2: ABOUT
   ───────────────────────────────────────────────── */
function AboutSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  });

  const bodyText =
    "Over the years, we have partnered with enterprises and startups to deliver robust digital products. Our team crafts high-performance web applications, mobile experiences, and enterprise ERP systems tailored to drive growth.";
  const chars = bodyText.split("");

  return (
    <section className="bg-black py-24 px-4 md:px-8">
      <div className="bg-[#101010] rounded-3xl p-8 md:p-16 lg:p-24 max-w-6xl mx-auto flex flex-col items-center text-center">
        <span className="text-primary text-[10px] sm:text-xs tracking-widest uppercase mb-8">
          Innovation Hub
        </span>
        <WordsPullUpMultiStyle
          containerClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl mx-auto leading-[0.95] sm:leading-[0.9] text-[#E1E0CC]"
          segments={[
            { text: "We are AJU Techzora, ", className: "font-normal" },
            { text: "a technology powerhouse. ", className: "font-serif italic" },
            {
              text: "We specialize in software engineering, UI/UX design, and system architecture.",
              className: "font-normal",
            },
          ]}
        />
        <div
          ref={containerRef}
          className="mt-16 text-[#DEDBC8] text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
        >
          {chars.map((char, index) => (
            <AnimatedLetter
              key={index}
              char={char}
              index={index}
              totalChars={chars.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   SECTION 3: FEATURES
   ───────────────────────────────────────────────── */
function FeatureCard({
  children,
  index,
  className = "",
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`rounded-2xl overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section className="min-h-screen bg-black relative py-24 px-4 md:px-6">
      <div className="absolute inset-0 bg-noise opacity-[0.15] pointer-events-none" />
      <div className="relative z-10 max-w-[1400px] mx-auto flex flex-col gap-12">
        {/* Header */}
        <div className="text-center md:text-left">
          <WordsPullUpMultiStyle
            containerClassName="text-xl sm:text-2xl md:text-3xl lg:text-4xl"
            segments={[
              {
                text: "Innovative digital solutions for modern businesses. ",
                className: "text-[#DEDBC8] font-normal block mb-2",
              },
              {
                text: "Built for scale. Powered by technology.",
                className: "text-gray-500 font-normal block",
              },
            ]}
          />
        </div>

        {/* 3-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:h-[480px] gap-4">
          {/* Card 2 */}
          <FeatureCard index={1} className="relative overflow-hidden p-6 flex flex-col h-[300px] md:h-[400px] lg:h-full group">
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
              alt="Web Dev"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

            <span className="absolute top-6 right-6 text-white/50 text-xs font-mono z-10">01</span>

            <div className="relative z-10 mt-auto">
              <h3 className="text-[#E1E0CC] text-xl font-medium mb-4">Web & App Development.</h3>
              <ul className="space-y-3 mb-6">
                {[
                  "Custom websites",
                  "Mobile applications",
                  "Progressive web apps",
                  "Responsive solutions",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check size={16} className="text-white/80 shrink-0" />
                    <span className="text-white/90 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="#" className="inline-flex items-center gap-2 text-[#E1E0CC] text-sm hover:text-white transition-colors">
                Learn more <ArrowRight size={16} className="-rotate-45" />
              </a>
            </div>
          </FeatureCard>

          {/* Card 3 */}
          <FeatureCard index={2} className="relative overflow-hidden p-6 flex flex-col h-[300px] md:h-[400px] lg:h-full group">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
              alt="ERP Automation"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

            <span className="absolute top-6 right-6 text-white/50 text-xs font-mono z-10">02</span>

            <div className="relative z-10 mt-auto">
              <h3 className="text-[#E1E0CC] text-xl font-medium mb-4">ERP & Automation.</h3>
              <ul className="space-y-3 mb-6">
                {[
                  "Enterprise resource planning",
                  "Workflow automation",
                  "Digital transformation",
                  "Business analytics",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check size={16} className="text-white/80 shrink-0" />
                    <span className="text-white/90 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="#" className="inline-flex items-center gap-2 text-[#E1E0CC] text-sm hover:text-white transition-colors">
                Learn more <ArrowRight size={16} className="-rotate-45" />
              </a>
            </div>
          </FeatureCard>

          {/* Card 4 */}
          <FeatureCard index={3} className="relative overflow-hidden p-6 flex flex-col h-[300px] md:h-[400px] lg:h-full group">
            <img
              src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80"
              alt="Robotics"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

            <span className="absolute top-6 right-6 text-white/50 text-xs font-mono z-10">03</span>

            <div className="relative z-10 mt-auto">
              <h3 className="text-[#E1E0CC] text-xl font-medium mb-4">Robotics & IoT.</h3>
              <ul className="space-y-3 mb-6">
                {[
                  "Robotics lab automation",
                  "IoT sensor networks",
                  "Hardware integrations",
                  "Educational robotics",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check size={16} className="text-white/80 shrink-0" />
                    <span className="text-white/90 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="#" className="inline-flex items-center gap-2 text-[#E1E0CC] text-sm hover:text-white transition-colors">
                Learn more <ArrowRight size={16} className="-rotate-45" />
              </a>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   MAIN COMPONENT EXPORT
   ───────────────────────────────────────────────── */
export default function PrismaLandingPage() {
  return (
    <div className="w-full bg-black min-h-screen text-[#E1E0CC] font-sans">
      <HeroSection />


    </div>
  );
}
