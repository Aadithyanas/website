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
  { name: "Home", id: "#home" },
  { name: "About", id: "#about" },
  { name: "Companies", id: "#companies" },
  { name: "Services", id: "#services" },
  { name: "Testimonials", id: "#testimonials" },
];

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

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  const sectionIds = NAV_LINKS.map((l) => l.id);
  const active = useActiveSection(sectionIds);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.body.scrollHeight - window.innerHeight;
      setScrolled(y > 50);
      setScrollPct(max > 0 ? (y / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const scrollTo = useCallback((id: string) => {
    setMenuOpen(false);
    gsap.to(window, { duration: 1, scrollTo: id, ease: "power3.inOut" });
  }, []);

  return (
    <>
      {/* ── Progress bar ── */}
      <div
        aria-hidden
        className="fixed top-0 left-0 z-[60] h-[2px] pointer-events-none"
        style={{
          width: `${scrollPct}%`,
          background: "linear-gradient(90deg, #6366f1, #818cf8, #06d6a0)",
          boxShadow: "0 0 8px rgba(99,102,241,0.7)",
          transition: "width 0.1s linear",
        }}
      />

      <motion.nav
        ref={navRef}
        className="fixed top-0 w-full z-50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        style={{
          background: scrolled
            ? "rgba(0,0,0,0.92)"
            : "transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(160%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px) saturate(160%)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(99,102,241,0.12)"
            : "1px solid transparent",
          boxShadow: scrolled
            ? "0 4px 24px rgba(0,0,0,0.5)"
            : "none",
          transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
          paddingTop: scrolled ? "10px" : "18px",
          paddingBottom: scrolled ? "10px" : "18px",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">

          {/* ── Logo ── */}
          <motion.button
            onClick={() => scrollTo("#home")}
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{ background: "none", border: "none", padding: 0 }}
          >
            <div style={{ transition: "filter 0.3s ease" }}>
              <img
                src="/images/logo2.png"
                alt="AJU ED SOLUTIONS Logo"
                className="h-9 w-auto object-contain"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(99,102,241,0.5))",
                  transition: "filter 0.3s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLImageElement).style.filter =
                    "drop-shadow(0 0 14px rgba(99,102,241,0.9))";
                  (e.currentTarget as HTMLImageElement).style.transform = "scale(1.1) rotate(-4deg)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLImageElement).style.filter =
                    "drop-shadow(0 0 6px rgba(99,102,241,0.5))";
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
                    className="relative px-4 py-2 rounded-xl text-xs font-medium tracking-[0.14em] uppercase"
                    style={{
                      color: isActive ? "#a5b4fc" : "rgba(160,180,220,0.6)",
                      background: isActive ? "rgba(99,102,241,0.1)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', 'Inter', sans-serif",
                      transition: "color 0.2s ease, background 0.2s ease",
                      /* Subtle neumorphic press on active */
                      boxShadow: isActive
                        ? "inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.04)"
                        : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.color = "#a5b4fc";
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.06)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(160,180,220,0.6)";
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      }
                    }}
                  >
                    {link.name}
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                          style={{
                            width: "60%",
                            background: "linear-gradient(90deg, #6366f1, #06d6a0)",
                            boxShadow: "0 0 8px rgba(99,102,241,0.7)",
                          }}
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          exit={{ opacity: 0, scaleX: 0 }}
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
                  color: "#a5b4fc",
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  backdropFilter: "blur(8px)",
                  fontFamily: "'DM Sans', 'Inter', sans-serif",
                  transition: "all 0.3s ease",
                  /* Neumorphic shadow on button */
                  boxShadow: "3px 3px 10px rgba(0,0,0,0.4), -1px -1px 6px rgba(255,255,255,0.04)",
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.borderColor = "rgba(99,102,241,0.7)";
                  b.style.boxShadow = "0 0 24px rgba(99,102,241,0.4), 3px 3px 10px rgba(0,0,0,0.4), -1px -1px 6px rgba(255,255,255,0.04)";
                  b.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.borderColor = "rgba(99,102,241,0.3)";
                  b.style.boxShadow = "3px 3px 10px rgba(0,0,0,0.4), -1px -1px 6px rgba(255,255,255,0.04)";
                  b.style.color = "#a5b4fc";
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2.4s ease infinite",
                  }}
                />
                <span className="relative z-10">Contact Us</span>
              </motion.button>
            </li>


          </ul>


          <motion.button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.22)",
              color: "#818cf8",
              cursor: "pointer",
              boxShadow: "3px 3px 10px rgba(0,0,0,0.4), -1px -1px 5px rgba(255,255,255,0.04)",
            }}
            onClick={() => setMenuOpen((v) => !v)}
            whileTap={{ scale: 0.92 }}
            aria-label="Toggle navigation"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={20} />
                </motion.span>
              ) : (
                <motion.span key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
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
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="lg:hidden overflow-hidden"
              style={{
                background: "rgba(0,0,0,0.98)",
                backdropFilter: "blur(24px) saturate(180%)",
                borderTop: "1px solid rgba(99,102,241,0.12)",
              }}
            >
              <ul className="flex flex-col px-4 py-5 gap-1">
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
                        className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-[0.12em] uppercase"
                        style={{
                          color: isActive ? "#a5b4fc" : "rgba(160,180,220,0.6)",
                          background: isActive ? "rgba(99,102,241,0.1)" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "'Inter', sans-serif",
                          boxShadow: isActive
                            ? "inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.04)"
                            : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span
                          className="w-[2px] h-4 rounded-full shrink-0"
                          style={{
                            background: isActive
                              ? "linear-gradient(180deg, #6366f1, #06d6a0)"
                              : "rgba(255,255,255,0.1)",
                            transition: "background 0.3s ease",
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
                      background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.08))",
                      border: "1px solid rgba(99,102,241,0.3)",
                      color: "#a5b4fc",
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      boxShadow: "3px 3px 12px rgba(0,0,0,0.45), -1px -1px 6px rgba(255,255,255,0.04)",
                    }}
                  >
                    Contact Us
                  </button>
                </motion.li>

              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Nav;