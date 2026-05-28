"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Cpu, Zap, Code, ArrowRight } from "lucide-react";

const FRAME_COUNT = 150;

export const TechzoraHeroScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth scroll progress for image index
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 30,
    restDelta: 0.001
  });

  const frameIndex = useTransform(smoothProgress, [0, 1], [1, FRAME_COUNT]);

  // Text animations
  const textOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [1, 0, 1, 0, 1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  
  // Feature text points
  const feature1Opacity = useTransform(scrollYProgress, [0.15, 0.25, 0.35], [0, 1, 0]);
  const feature2Opacity = useTransform(scrollYProgress, [0.4, 0.5, 0.6], [0, 1, 0]);
  const feature3Opacity = useTransform(scrollYProgress, [0.7, 0.8, 0.9], [0, 1, 0]);

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const preloadedImages: HTMLImageElement[] = [];

    const loadImages = async () => {
      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        const frameNumber = i.toString().padStart(3, "0");
        img.src = `/images/techzorahero/ezgif-frame-${frameNumber}.png`;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === FRAME_COUNT) {
            setIsLoading(false);
          }
        };
        preloadedImages.push(img);
      }
      setImages(preloadedImages);
    };

    loadImages();
  }, []);

  // Draw to canvas
  useEffect(() => {
    const drawFrame = (index: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || images.length === 0) return;

      const img = images[Math.floor(index) - 1] || images[0];
      
      // Calculate aspect ratio to cover canvas
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        drawHeight = canvas.height;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const unsubscribe = frameIndex.on("change", (latest) => {
      drawFrame(latest);
    });

    // Initial draw
    if (!isLoading) drawFrame(1);

    return () => unsubscribe();
  }, [images, isLoading, frameIndex]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative h-[600vh] bg-black">
      {/* Sticky Canvas Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Loader Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-indigo-400 font-mono text-xs tracking-widest uppercase">Initializing Systems...</p>
          </div>
        )}

        {/* Ambient Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
          style={{ filter: "contrast(1.1) brightness(0.9)" }}
        />

        {/* ── Scroll Content Overlays ── */}

        {/* Phase 1: Intro */}
        <motion.div 
          style={{ opacity: textOpacity, y: textY }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[10px] font-mono tracking-[0.2em] uppercase mb-8"
          >
            <Cpu size={14} />
            Advanced Robotics & AI
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
            AJU <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">TECHZORA</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl font-light leading-relaxed">
            Where biological intelligence meets robotic precision. 
            Engineering the next evolution of human capability.
          </p>
          <div className="mt-12 flex items-center gap-2 text-indigo-400/50 animate-bounce">
            <span className="text-[10px] uppercase tracking-widest font-bold">Scroll to Explore</span>
          </div>
        </motion.div>

        {/* Phase 2: Robotics Feature */}
        <motion.div 
          style={{ opacity: feature1Opacity }}
          className="absolute inset-0 z-20 flex items-center justify-end px-12 md:px-24"
        >
          <div className="max-w-md text-right">
            <div className="w-16 h-1 rounded-full bg-indigo-500 mb-6 ml-auto" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Precision Engineering</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Our robotic systems are designed with sub-millimeter precision, 
              enabling automation in the most demanding environments.
            </p>
          </div>
        </motion.div>

        {/* Phase 3: AI Core Feature */}
        <motion.div 
          style={{ opacity: feature2Opacity }}
          className="absolute inset-0 z-20 flex items-center justify-start px-12 md:px-24"
        >
          <div className="max-w-md text-left">
            <div className="w-16 h-1 rounded-full bg-emerald-500 mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Neural Core AI</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Intelligent decision-making powered by custom neural architectures 
              optimized for real-time edge computing.
            </p>
          </div>
        </motion.div>

        {/* Phase 4: Final CTA */}
        <motion.div 
          style={{ opacity: feature3Opacity }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">Build the Future</h2>
          <p className="text-slate-400 text-lg max-w-xl mb-12">
            Join us in pioneering the integration of advanced technology into everyday life.
          </p>
          <button className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center gap-3 group">
            START YOUR PROJECT <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};
