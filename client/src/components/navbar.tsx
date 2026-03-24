"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Menu, X } from "lucide-react";

gsap.registerPlugin(ScrollToPlugin);

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV_LINKS = [
  { name: "Home",         id: "#home" },
  { name: "About",        id: "#about" },
  { name: "Companies",    id: "#companies" },
  { name: "Services",     id: "#services" },
  { name: "Testimonials", id: "#testimonials" },
];

// ── Active-section detector via IntersectionObserver ─────────────────────────
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.querySelector(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id.replace("#", "")); },
        { threshold: 0.35 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);

  return active;
}

// ── Component ─────────────────────────────────────────────────────────────────
const Nav = () => {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [scrollPct,   setScrollPct]   = useState(0);
  const navRef = useRef<HTMLElement>(null);

  const sectionIds = NAV_LINKS.map((l) => l.id);
  const active = useActiveSection(sectionIds);

  // Scroll state
  useEffect(() => {
    const onScroll = () => {
      const y   = window.scrollY;
      const max = document.body.scrollHeight - window.innerHeight;
      setScrolled(y > 50);
      setScrollPct(max > 0 ? (y / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollTo = useCallback((id: string) => {
    setMenuOpen(false);
    gsap.to(window, { duration: 1, scrollTo: id, ease: "power3.inOut" });
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        .nav-font { font-family: 'DM Sans', sans-serif; }
        .logo-font { font-family: 'Rajdhani', sans-serif; }
      `}</style>

      {/* ── Progress bar ── */}
      <div
        aria-hidden
        className="fixed top-0 left-0 z-[60] h-[2px] pointer-events-none"
        style={{
          width: `${scrollPct}%`,
          background: "linear-gradient(90deg, #22d3ee, #3b82f6, #a78bfa)",
          boxShadow: "0 0 8px rgba(34,211,238,0.6)",
          transition: "width 0.1s linear",
        }}
      />

      <motion.nav
        ref={navRef}
        className="nav-font fixed top-0 w-full z-50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        style={{
          background: scrolled
            ? "rgba(2,8,18,0.72)"
            : "transparent",
          backdropFilter:         scrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter:   scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(34,211,238,0.08)"
            : "1px solid transparent",
          boxShadow: scrolled
            ? " rgba(0,0,0,0.45)"
            : "none",
          transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, backdrop-filter 0.4s ease",
          paddingTop:    scrolled ? "10px" : "18px",
          paddingBottom: scrolled ? "10px" : "18px",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

          {/* ── Logo ── */}
          <motion.button
            onClick={() => scrollTo("#home")}
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{ background: "none", border: "none", padding: 0 }}
          >
            <div
              className="relative"
              style={{ transition: "filter 0.3s ease" }}
            >
              <img
                src="/images/logo2.png"
                alt="AJU ED SOLUTIONS Logo"
                className="w-50 h-10 object-contain"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(34,211,238,0.4))",
                  transition: "filter 0.3s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLImageElement).style.filter =
                    "drop-shadow(0 0 14px rgba(34,211,238,0.8))";
                  (e.currentTarget as HTMLImageElement).style.transform = "scale(1.12) rotate(-5deg)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLImageElement).style.filter =
                    "drop-shadow(0 0 6px rgba(34,211,238,0.4))";
                  (e.currentTarget as HTMLImageElement).style.transform = "scale(1) rotate(0deg)";
                }}
              />
            </div>
           
          </motion.button>

          {/* ── Desktop links ── */}
          <ul className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.id.replace("#", "");
              return (
                <li key={link.name}>
                  <button
                    onClick={() => scrollTo(link.id)}
                    className="relative px-4 py-2 rounded-lg text-xs font-medium tracking-[0.14em] uppercase transition-colors duration-200"
                    style={{
                      color: isActive ? "#67e8f9" : "rgba(180,210,230,0.6)",
                      background: isActive ? "rgba(34,211,238,0.07)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#67e8f9";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "rgba(180,210,230,0.6)";
                    }}
                  >
                    {link.name}

                    {/* Active underline pill */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                          style={{
                            width: "60%",
                            background: "linear-gradient(90deg, #22d3ee, #3b82f6)",
                            boxShadow: "0 0 8px rgba(34,211,238,0.6)",
                          }}
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          exit={{  opacity: 0, scaleX: 0 }}
                          transition={{ duration: 0.3, ease: EASE }}
                        />
                      )}
                    </AnimatePresence>
                  </button>
                </li>
              );
            })}

            {/* CTA */}
            <li className="ml-3">
              <motion.button
                onClick={() => scrollTo("#contact")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="relative overflow-hidden rounded-full px-5 py-2 text-xs font-semibold tracking-[0.16em] uppercase"
                style={{
                  color: "#67e8f9",
                  background: "rgba(6,182,212,0.07)",
                  border: "1px solid rgba(34,211,238,0.3)",
                  backdropFilter: "blur(8px)",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "border-color 0.3s ease, box-shadow 0.3s ease, color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.borderColor = "rgba(34,211,238,0.7)";
                  b.style.boxShadow = "0 0 24px rgba(34,211,238,0.3)";
                  b.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.borderColor = "rgba(34,211,238,0.3)";
                  b.style.boxShadow = "none";
                  b.style.color = "#67e8f9";
                }}
              >
                {/* Shimmer sweep */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2.4s ease infinite",
                  }}
                />
                <span className="relative z-10">Contact Us</span>
              </motion.button>
            </li>

            {/* ERP Button */}
            <li className="ml-2">
              <Link
                href="/erp"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 16px",
                  borderRadius: "9999px",
                  background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(167,139,250,0.15))",
                  border: "1px solid rgba(167,139,250,0.4)",
                  color: "#a78bfa",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.boxShadow = "0 0 20px rgba(167,139,250,0.35)";
                  el.style.borderColor = "rgba(167,139,250,0.7)";
                  el.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.boxShadow = "none";
                  el.style.borderColor = "rgba(167,139,250,0.4)";
                  el.style.color = "#a78bfa";
                }}
              >
                <span>⚡</span> ERP
              </Link>
            </li>
          </ul>

          {/* ── Hamburger ── */}
          <motion.button
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg"
            style={{
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(34,211,238,0.22)",
              color: "#22d3ee",
              cursor: "pointer",
            }}
            onClick={() => setMenuOpen((v) => !v)}
            whileTap={{ scale: 0.92 }}
            aria-label="Toggle navigation"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{   rotate:  90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={20} />
                </motion.span>
              ) : (
                <motion.span key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0,  opacity: 1 }}
                  exit={{   rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* ── Mobile drawer ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{   opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="lg:hidden overflow-hidden"
              style={{
                background: "rgba(2,6,16,0.96)",
                backdropFilter: "blur(24px) saturate(180%)",
                borderTop: "1px solid rgba(34,211,238,0.08)",
              }}
            >
              <ul className="flex flex-col px-6 py-6 gap-1">
                {NAV_LINKS.map((link, i) => {
                  const isActive = active === link.id.replace("#", "");
                  return (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
                    >
                      <button
                        onClick={() => scrollTo(link.id)}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-[0.12em] uppercase transition-all duration-200"
                        style={{
                          color: isActive ? "#67e8f9" : "rgba(180,210,230,0.6)",
                          background: isActive ? "rgba(34,211,238,0.07)" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {/* Left accent bar */}
                        <span
                          className="w-[2px] h-4 rounded-full shrink-0 transition-all duration-300"
                          style={{
                            background: isActive
                              ? "linear-gradient(180deg, #22d3ee, #3b82f6)"
                              : "rgba(255,255,255,0.1)",
                          }}
                        />
                        {link.name}
                      </button>
                    </motion.li>
                  );
                })}

                <motion.li
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: NAV_LINKS.length * 0.05, ease: EASE }}
                  className="mt-3"
                >
                  <button
                    onClick={() => scrollTo("#contact")}
                    className="w-full py-3 rounded-xl text-sm font-semibold tracking-[0.16em] uppercase"
                    style={{
                      background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(59,130,246,0.15))",
                      border: "1px solid rgba(34,211,238,0.3)",
                      color: "#67e8f9",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Contact Us
                  </button>
                </motion.li>

                {/* Mobile ERP link */}
                <motion.li
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (NAV_LINKS.length + 1) * 0.05, ease: EASE }}
                  className="mt-2"
                >
                  <Link
                    href="/erp"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "12px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(167,139,250,0.12))",
                      border: "1px solid rgba(167,139,250,0.35)",
                      color: "#a78bfa",
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    ⚡ Company ERP
                  </Link>
                </motion.li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </>
  );
};

export default Nav;