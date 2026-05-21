"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Menu, X, ChevronDown } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useCompany, CompanyId } from "./sections/CompanyContext";

const BRAND_DATA: Record<CompanyId, { name: string; logo: string; icon: string; color: string }> = {
  default: {
    name: "AJU ED SOLUTIONS",
    logo: "/images/brands/ajuedsolution.png",
    icon: "/images/logo 3.png",
    color: "#a5b4fc",
  },
  ajuedsolution: {
    name: "AJU ED SOLUTIONS",
    logo: "/images/brands/ajuedsolution.png",
    icon: "/images/logo 3.png",
    color: "#a5b4fc",
  },
  techzora: {
    name: "AJU TECHZORA",
    logo: "/images/brands/techzora.png",
    icon: "/images/logo 3.png",
    color: "#818cf8",
  },
  brandify: {
    name: "AJU Brandify",
    logo: "/images/brands/brandify.png",
    icon: "/images/logo 3.png",
    color: "#06d6a0",
  },
  scrumspacecoworks: {
    name: "Scrumspace Coworks",
    logo: "/images/brands/scrumspaceW.png",
    icon: "/images/logo 3.png",
    color: "#f472b6",
  },
};

gsap.registerPlugin(ScrollToPlugin);

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV_LINKS = [
  { name: "Home", id: "#home" },
  { name: "About", id: "#about" },
  {
    name: "Brands",
    dropdown: [
      { name: "AJU Techzora", id: "/techzora" },
      { name: "AJU Brandify", id: "/brandify" },
      { name: "Scrumspace Coworks", id: "/scrumspacecoworks" },
    ]
  },
  { name: "Services", id: "#services" },
  { name: "Careers", id: "/careers" },
  { name: "Register", id: "/register" },
  // { name: "Testimonials", id: "#testimonials" },
];

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      if (!id || !id.startsWith("#")) return;
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
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { activeCompany } = useCompany();
  const brand = BRAND_DATA[activeCompany] || BRAND_DATA.default;

  const dynamicNavLinks = React.useMemo(() => {
    if (activeCompany === "techzora") {
      const links = [...NAV_LINKS];
      links.splice(4, 0, { name: "3D Products", id: "/3dproducts" });
      return links;
    }
    return NAV_LINKS;
  }, [activeCompany]);

  const sectionIds = dynamicNavLinks.map((l) => l.id).filter((id): id is string => !!id);
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
    setBranchDropdownOpen(false);

    // If it's a direct page link (starts with /)
    if (id.startsWith("/")) {
      router.push(id);
      return;
    }

    // If we are NOT on the home page, go home first then scroll
    if (pathname !== "/") {
      router.push("/" + id);
      return;
    }

    // Smooth scroll for anchors
    gsap.to(window, { duration: 1, scrollTo: id, ease: "power3.inOut" });
  }, [router, pathname]);

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
            className="flex items-center gap-2 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{ background: "none", border: "none", padding: 0 }}
          >
            {/* Brand Icon */}
            <div className="relative">
              <img
                src={brand.icon}
                alt="Icon"
                className="h-9 w-auto object-contain"
                style={{
                  filter: `drop-shadow(0 0 8px ${brand.color}66)`,
                  transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
              {/* Subtle glow behind icon */}
              <div
                className="absolute inset-0 -z-10 blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                style={{ background: brand.color }}
              />
            </div>

            {/* Brand Name PNG */}
            <img
              src={brand.logo}
              alt={brand.name}
              className={`w-auto object-contain hidden sm:block transition-all duration-300 ${
                activeCompany === "brandify" ? "h-6" : "h-8"
              }`}
              style={{
                filter: "drop-shadow(0 0 4px rgba(255,255,255,0.2))",
              }}
            />
          </motion.button>

          {/* ── Desktop links ── */}
          <ul className="hidden lg:flex items-center gap-1">
            {dynamicNavLinks.map((link) => {
              const isActive = link.id ? active === link.id.replace("#", "") : false;
              const isBranches = link.name === "Brands";

              return (
                <li key={link.name} className="relative group">
                  {isBranches ? (
                    <div
                      className="relative"
                      onMouseEnter={() => setBranchDropdownOpen(true)}
                      onMouseLeave={() => setBranchDropdownOpen(false)}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setBranchDropdownOpen(!branchDropdownOpen);
                        }}
                        className="relative px-4 py-2 rounded-xl text-xs font-medium tracking-[0.14em] uppercase flex items-center gap-1"
                        style={{
                          color: isActive ? "#a5b4fc" : "rgba(160,180,220,0.6)",
                          background: isActive ? "rgba(99,102,241,0.1)" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', 'Inter', sans-serif",
                          transition: "color 0.2s ease, background 0.2s ease",
                          boxShadow: isActive
                            ? "inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.04)"
                            : "none",
                        }}
                      >
                        {link.name}
                        <ChevronDown size={12} className={`transition-transform duration-300 ${branchDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {branchDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: EASE }}
                            className="absolute top-full left-0 mt-2 w-56 rounded-2xl overflow-hidden"
                            style={{
                              background: "rgba(10,10,12,0.98)",
                              backdropFilter: "blur(20px)",
                              border: "1px solid rgba(99,102,241,0.2)",
                              boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
                              zIndex: 100,
                            }}
                          >
                            <div className="py-2">
                              {link.dropdown?.map((item) => (
                                <button
                                  key={item.name}
                                  onClick={() => scrollTo(item.id)}
                                  className="w-full text-left px-5 py-3 text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors"
                                  style={{
                                    color: "rgba(176,190,220,0.7)",
                                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                                  }}
                                  onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.1)";
                                    (e.currentTarget as HTMLButtonElement).style.color = "#a5b4fc";
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(176,190,220,0.7)";
                                  }}
                                >
                                  {item.name}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <button
                      onClick={() => link.id && scrollTo(link.id)}
                      className="relative px-4 py-2 rounded-xl text-xs font-medium tracking-[0.14em] uppercase"
                      style={{
                        color: isActive ? "#a5b4fc" : "rgba(160,180,220,0.6)",
                        background: isActive ? "rgba(99,102,241,0.1)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', 'Inter', sans-serif",
                        transition: "color 0.2s ease, background 0.2s ease",
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
                  )}
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
                {dynamicNavLinks.map((link, i) => {
                  const isActive = link.id ? active === link.id.replace("#", "") : false;
                  const isBranches = link.name === "Brands";

                  return (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
                    >
                      {isBranches ? (
                        <div className="flex flex-col">
                          <button
                            onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                            className="w-full text-left flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium tracking-[0.12em] uppercase"
                            style={{
                              color: isActive ? "#a5b4fc" : "rgba(160,180,220,0.6)",
                              background: isActive ? "rgba(99,102,241,0.1)" : "transparent",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "'Inter', sans-serif",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div className="flex items-center gap-3">
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
                            </div>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${branchDropdownOpen ? "rotate-180" : ""}`} />
                          </button>

                          <AnimatePresence>
                            {branchDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pl-8 flex flex-col gap-1 mt-1"
                              >
                                {link.dropdown?.map((item) => (
                                  <button
                                    key={item.name}
                                    onClick={() => scrollTo(item.id)}
                                    className="w-full text-left py-3 text-[11px] font-bold tracking-widest uppercase"
                                    style={{ color: "rgba(176,190,220,0.5)" }}
                                  >
                                    — {item.name}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <button
                          onClick={() => link.id && scrollTo(link.id)}
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
                      )}
                    </motion.li>
                  );
                })}

                <motion.li
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: dynamicNavLinks.length * 0.05, ease: EASE }}
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