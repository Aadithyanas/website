"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplineScene } from "../components/ui/splite";
import { Spotlight } from "../components/ui/spotlight";

gsap.registerPlugin(ScrollToPlugin);

// ─── Animated Title ───────────────────────────────────────────────────────────
const AnimatedTitle = () => (
  <div className="hero-title-wrap">
    <h1 className="hero-title">
      <span className="title-line line-1">AJU ED</span>
      <span className="title-line line-2">
        <span className="solutions-text">SOLUTIONS</span>
        <span className="llp-text">LLP</span>
      </span>
    </h1>
  </div>
);

const TechBadge = ({ label, delay }: { label: string; delay: number }) => (
  <span className="tech-badge" style={{ animationDelay: `${delay}s` }}>
    {label}
  </span>
);

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const badgesRef  = useRef<HTMLDivElement>(null);
  const btnsRef    = useRef<HTMLDivElement>(null);
  const rightRef   = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [splineReady, setSplineReady] = useState(false);
  const animatedRef = useRef(false);

  const handleSplineLoad = useCallback(() => {
    setSplineReady(true);
  }, []);

  useEffect(() => {
    gsap.set([".title-line", taglineRef.current, badgesRef.current, btnsRef.current], {
      opacity: 0,
    });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      ".title-line",
      { opacity: 0, x: -60, skewX: 8 },
      { opacity: 1, x: 0, skewX: 0, duration: 0.9, stagger: 0.18, delay: 0.3 }
    )
      .fromTo(taglineRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
      .fromTo(badgesRef.current,  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
      .fromTo(
        btnsRef.current,
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.7)" },
        "-=0.25"
      );

    requestAnimationFrame(() => {
      gsap.to(".particle", {
        y: "random(-20, 20)",
        x: "random(-10, 10)",
        duration: "random(3, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.4, from: "random" },
      });
    });
  }, []);

  useEffect(() => {
    if (!splineReady || animatedRef.current) return;
    animatedRef.current = true;

    const tl = gsap.timeline();
    if (overlayRef.current) {
      tl.to(overlayRef.current, { opacity: 0, duration: 0.45, ease: "power2.out" });
    }
    tl.fromTo(
      rightRef.current,
      { opacity: 0, x: 80 },
      { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" },
      "<0.05"
    );
  }, [splineReady]);

  const scrollTo = (id: string) =>
    gsap.to(window, { duration: 1, scrollTo: id, ease: "power3.inOut" });

  return (
    <section id="home" className="hero-section">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        /* ── Section base ── */
        .hero-section {
          position: relative;
          min-height: 100svh;
          background: #000000;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding-top: 20px;
          transform: translateZ(0);
          will-change: auto;
        }

        /* ── Glows — softer, material-style ── */
        .hero-bg-glow { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .glow-1 {
          position: absolute; top: -15%; left: -5%; width: 50%; height: 65%;
          background: radial-gradient(ellipse at center, rgba(99,102,241,0.13) 0%, rgba(99,102,241,0.04) 50%, transparent 70%);
          filter: blur(50px);
          animation: driftA 12s ease-in-out infinite alternate;
          will-change: transform;
        }
        .glow-2 {
          position: absolute; bottom: -10%; right: -5%; width: 48%; height: 58%;
          background: radial-gradient(ellipse at center, rgba(6,214,160,0.09) 0%, transparent 65%);
          filter: blur(55px);
          animation: driftB 15s ease-in-out infinite alternate;
          will-change: transform;
        }
        .glow-3 {
          position: absolute; top: 45%; left: 42%; width: 28%; height: 38%;
          background: radial-gradient(ellipse at center, rgba(244,114,182,0.06) 0%, transparent 60%);
          filter: blur(65px);
        }
        @keyframes driftA { from{transform:translate(0,0) scale(1)} to{transform:translate(4%,6%) scale(1.08)} }
        @keyframes driftB { from{transform:translate(0,0) scale(1)} to{transform:translate(-5%,-4%) scale(1.1)} }

        /* ── Flat grid ── */
        .hero-grid {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        /* ── Particles ── */
        .particle {
          position: absolute; border-radius: 50%; pointer-events: none; z-index: 0;
          will-change: transform;
        }

        /* ── Layout ── */
        .hero-inner {
          position: relative; z-index: 10; width: 100%; max-width: 1280px;
          margin: 0 auto; padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          align-items: center;
          min-height: calc(100svh - 80px);
        }

        /* ── Left ── */
        .hero-left { display: flex; flex-direction: column; gap: 1.6rem; }

        /* Eyebrow */
        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(99,102,241,0.8); opacity: 0;
          animation: fadeSlideUp 0.6s 0.1s forwards;
        }
        .eyebrow-dot {
          width: 6px; height: 6px; background: #818cf8; border-radius: 50%;
          box-shadow: 0 0 8px #818cf8; animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

        /* Title */
        .hero-title { display: flex; flex-direction: column; gap: 0; line-height: 1; }
        .title-line {
          font-family: 'Rajdhani', sans-serif; font-weight: 700;
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .line-1 {
          display: block; font-size: clamp(2.6rem, 6vw, 6rem);
          background: linear-gradient(135deg, #eef2ff 0%, #a5b4fc 50%, #818cf8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .line-2 { display: flex; align-items: baseline; gap: 0.2em; margin-top: -0.05em; }
        .solutions-text {
          font-family: 'Rajdhani', sans-serif; font-weight: 700;
          font-size: clamp(2.6rem, 5vw, 5rem);
          letter-spacing: 0.04em; text-transform: uppercase;
          background: linear-gradient(135deg, #a5b4fc 0%, #6366f1 55%, #06d6a0 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .llp-text {
          font-family: 'Rajdhani', sans-serif; font-weight: 700;
          font-size: clamp(2.6rem, 5vw, 5rem);
          margin-left: 10px; text-transform: uppercase;
          background: linear-gradient(135deg, #a5b4fc 0%, #6366f1 60%, #06d6a0 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          align-self: flex-end; padding-bottom: 0.2em;
        }

        /* Tagline */
        .tagline {
          font-family: 'DM Sans', sans-serif; font-size: clamp(0.9rem, 1.8vw, 1.15rem);
          font-weight: 300; line-height: 1.75; color: rgba(176,190,220,0.85);
          max-width: 44ch;
        }
        .tagline strong { font-weight: 500; color: #a5b4fc; }

        /* Badges — flat material style with subtle neumorphic shadow */
        .badges-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .tech-badge {
          font-family: 'DM Sans', sans-serif; font-size: 0.68rem; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(165,180,252,0.9); background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.22); border-radius: 100px;
          padding: 5px 14px;
          /* Neumorphic badge shadow */
          box-shadow: 2px 2px 8px rgba(0,0,0,0.4), -1px -1px 4px rgba(255,255,255,0.04);
          animation: badgeFloat 4s ease-in-out infinite alternate;
          transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
        }
        .tech-badge:hover {
          background: rgba(99,102,241,0.18); border-color: rgba(99,102,241,0.55);
          box-shadow: 0 0 14px rgba(99,102,241,0.25), 2px 2px 8px rgba(0,0,0,0.4), -1px -1px 4px rgba(255,255,255,0.04);
        }
        @keyframes badgeFloat { from{transform:translateY(0)} to{transform:translateY(-4px)} }

        /* Buttons — flat material + neumorphic */
        .btns-row { display: flex; flex-wrap: wrap; gap: 16px; }
        .btn-primary {
          position: relative; font-family: 'Syne', sans-serif; font-size: 0.82rem;
          font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          color: #fff; background: linear-gradient(135deg, #6366f1 0%, #818cf8 60%, #06d6a0 100%);
          border: none; border-radius: 100px; padding: 13px 28px; cursor: pointer;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(99,102,241,0.45), 4px 4px 16px rgba(0,0,0,0.5), -2px -2px 8px rgba(255,255,255,0.04);
          transition: box-shadow 0.3s, transform 0.2s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 36px rgba(99,102,241,0.65), 4px 4px 16px rgba(0,0,0,0.5), -2px -2px 8px rgba(255,255,255,0.04);
        }
        .btn-outline {
          position: relative; font-family: 'Syne', sans-serif; font-size: 0.82rem;
          font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          color: #a5b4fc; background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.3); border-radius: 100px;
          padding: 13px 28px; cursor: pointer;
          box-shadow: 3px 3px 14px rgba(0,0,0,0.45), -1px -1px 6px rgba(255,255,255,0.04);
          overflow: hidden; transition: all 0.3s;
        }
        .btn-outline:hover {
          border-color: rgba(99,102,241,0.65);
          box-shadow: 0 0 22px rgba(99,102,241,0.25), 3px 3px 14px rgba(0,0,0,0.45), -1px -1px 6px rgba(255,255,255,0.04);
          transform: translateY(-2px);
        }

        /* ── Right panel ── */
        .hero-right {
          position: relative;
          width: 100%;
          height: 760px;
          border-radius: 24px;
          opacity: 0;
          transform: translateZ(0);
          will-change: opacity, transform;
        }
        .hero-right > div,
        .hero-right canvas {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }

        /* ── Spline loading skeleton ── */
        .spline-loader-overlay {
          position: absolute; inset: 0; z-index: 20; border-radius: 24px;
          background: #000000;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .spline-loader-pulse {
          width: 48px; height: 48px; border-radius: 50%;
          border: 2px solid rgba(99,102,241,0.15);
          border-top-color: rgba(99,102,241,0.8);
          animation: spinPulse 1s linear infinite;
        }
        @keyframes spinPulse { to { transform: rotate(360deg); } }

        /* ── Scroll indicator ── */
        .scroll-ind {
          position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          z-index: 10; opacity: 0; animation: fadeSlideUp 0.8s 2.4s forwards;
        }
        .scroll-line {
          width: 1px; height: 36px;
          background: linear-gradient(180deg, rgba(99,102,241,0.8), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        .scroll-text {
          font-family: 'DM Sans', sans-serif; font-size: 0.58rem;
          letter-spacing: 0.2em; text-transform: uppercase; color: rgba(99,102,241,0.5);
        }
        @keyframes scrollPulse { 0%,100%{opacity:0.5;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.2)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 1100px) {
          .hero-inner { gap: 1.5rem; padding: 0 1.5rem; }
          .hero-right { height: 580px; }
        }
        @media (max-width: 900px) {
          .hero-section { padding-top: 72px; padding-bottom: 3rem; align-items: flex-start; }
          .hero-inner {
            grid-template-columns: 1fr;
            text-align: center;
            min-height: auto;
            padding-top: 2.5rem;
            gap: 2.5rem;
          }
          .hero-left { align-items: center; }
          .line-2 { justify-content: center; }
          .tagline { max-width: 60ch; }
          .badges-row { justify-content: center; }
          .btns-row { justify-content: center; }
          .hero-right { height: 420px; width: 100%; }
          .scroll-ind { display: none; }
        }
        @media (max-width: 640px) {
          .hero-section { padding-top: 68px; }
          .hero-inner { padding: 1.5rem 1rem; gap: 2rem; }
          .line-1, .solutions-text { font-size: clamp(2rem, 10vw, 3rem); }
          .llp-text { font-size: clamp(2rem, 10vw, 3rem); }
          .tagline { font-size: 0.88rem; }
          .eyebrow { font-size: 0.6rem; }
          .btn-primary, .btn-outline { padding: 11px 22px; font-size: 0.75rem; }
          .hero-right { height: 320px; border-radius: 16px; }
          .tech-badge { font-size: 0.62rem; padding: 4px 11px; }
        }
        @media (max-width: 400px) {
          .hero-inner { padding: 1rem 0.75rem; }
          .line-1, .solutions-text, .llp-text { font-size: clamp(1.7rem, 11vw, 2.4rem); }
          .hero-right { height: 280px; }
          .btns-row { flex-direction: column; align-items: center; }
          .btn-primary, .btn-outline { width: 100%; max-width: 280px; justify-content: center; }
        }
      `}</style>

      {/* ── Background ── */}
      <div className="hero-bg-glow">
        <div className="glow-1" />
        <div className="glow-2" />
        <div className="glow-3" />
      </div>
      <div className="hero-grid" />

      {/* ── Particles ── */}
      {[...Array(18)].map((_, i) => (
        <span
          key={i}
          className="particle"
          style={{
            width:  `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            top:  `${10 + (i * 5.1) % 80}%`,
            left: `${5  + (i * 7.3) % 90}%`,
            background:
              i % 3 === 0 ? "rgba(99,102,241,0.6)"
              : i % 3 === 1 ? "rgba(6,214,160,0.5)"
              : "rgba(244,114,182,0.45)",
            boxShadow: `0 0 ${4 + (i % 4)}px currentColor`,
          }}
        />
      ))}

      <div className="hero-inner">
        {/* ── LEFT ── */}
        <div className="hero-left">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Welcome To
          </span>
          <AnimatedTitle />
          <p className="tagline" ref={taglineRef}>
            Innovate. Educate. Empower.<br />
            <strong>Shaping the future</strong> through AI, Machine Learning,
            IoT, Robotics &amp; cutting-edge Web Solutions.
          </p>
          <div className="badges-row" ref={badgesRef}>
            {["AI", "ML", "IoT", "Robotics", "Web Dev", "Research"].map((t, i) => (
              <TechBadge key={t} label={t} delay={i * 0.15} />
            ))}
          </div>
          <div className="btns-row" ref={btnsRef}>
            <button className="btn-primary" onClick={() => scrollTo("#services")}>
              Explore Innovations
            </button>
            <button className="btn-outline" onClick={() => scrollTo("#contact")}>
              Get Started
            </button>
          </div>
        </div>

        {/* ── RIGHT — Spline ── */}
        <div className="hero-right" ref={rightRef}>
          <div className="spline-loader-overlay" ref={overlayRef}>
            <div className="spline-loader-pulse" />
          </div>
          <Spotlight className="-top-20 -left-20" fill="rgba(99,102,241,0.18)" />
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
            onLoad={handleSplineLoad}
          />
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="scroll-ind">
        <div className="scroll-line" />
        <span className="scroll-text">Scroll</span>
      </div>
    </section>
  );
};

export default Hero;