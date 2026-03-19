"use client";

import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Menu, X } from "lucide-react";

gsap.registerPlugin(ScrollToPlugin);

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const underlineRef = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (id: string, name?: string) => {
    setIsMobileMenuOpen(false);
    if (name) setActiveLink(name);
    gsap.to(window, { duration: 1, scrollTo: id, ease: "power3.inOut" });
  };

  const navLinks = [
    { name: "Home", id: "#home" },
    { name: "About", id: "#about" },
    { name: "Companies", id: "#companies" },
   
    { name: "Services", id: "#services" },
   
    { name: "Testimonials", id: "#testimonials" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Exo+2:wght@300;400;500;600&display=swap');

        .nav-root {
          font-family: 'Exo 2', sans-serif;
        }

        /* Glassmorphism nav background */
        .nav-glass {
          background: transparent;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-glass.scrolled {
          background: rgba(2, 10, 20, 0.55);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 1px 0 rgba(0, 255, 255, 0.08) inset,
            0 -1px 0 rgba(0, 255, 255, 0.05) inset;
        }

        /* Logo */
        .logo-text {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          letter-spacing: 0.12em;
          background: linear-gradient(135deg, #67e8f9 0%, #3b82f6 60%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .logo-img {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
          filter: drop-shadow(0 0 6px rgba(0, 255, 255, 0.3));
        }
        .logo-wrap:hover .logo-img {
          transform: scale(1.15) rotate(-4deg);
          filter: drop-shadow(0 0 12px rgba(0, 255, 255, 0.7));
        }

        /* Nav link button */
        .nav-link {
          position: relative;
          font-family: 'Exo 2', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(200, 220, 240, 0.7);
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 2px;
          transition: color 0.25s ease;
          outline: none;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0%;
          height: 1.5px;
          background: linear-gradient(90deg, #22d3ee, #3b82f6);
          border-radius: 99px;
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 8px rgba(34, 211, 238, 0.6);
        }
        .nav-link:hover,
        .nav-link.active {
          color: #67e8f9;
          text-shadow: 0 0 14px rgba(103, 232, 249, 0.5);
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }

        /* CTA Button */
        .cta-btn {
          position: relative;
          font-family: 'Exo 2', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #67e8f9;
          background: rgba(6, 182, 212, 0.06);
          border: 1px solid rgba(34, 211, 238, 0.35);
          border-radius: 100px;
          padding: 8px 22px;
          cursor: pointer;
          overflow: hidden;
          transition: color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          backdrop-filter: blur(8px);
        }
        .cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(59, 130, 246, 0.15));
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .cta-btn:hover {
          color: #fff;
          border-color: rgba(34, 211, 238, 0.8);
          box-shadow:
            0 0 20px rgba(34, 211, 238, 0.3),
            0 0 40px rgba(34, 211, 238, 0.1),
            inset 0 0 20px rgba(34, 211, 238, 0.05);
        }
        .cta-btn:hover::before {
          opacity: 1;
        }
        .cta-btn-inner {
          position: relative;
          z-index: 1;
        }

        /* Shimmer sweep on CTA hover */
        .cta-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -75%;
          width: 50%;
          height: 200%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent);
          transform: skewX(-20deg);
          transition: left 0.55s ease;
        }
        .cta-btn:hover::after {
          left: 130%;
        }

        /* Mobile menu */
        .mobile-menu {
          background: rgba(2, 8, 18, 0.92);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-top: 1px solid rgba(34, 211, 238, 0.1);
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mobile-link {
          font-family: 'Exo 2', sans-serif;
          font-size: 1rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(200, 220, 240, 0.75);
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 16px;
          position: relative;
          transition: color 0.25s ease;
        }
        .mobile-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%) scaleY(0);
          width: 2px;
          height: 60%;
          background: linear-gradient(180deg, #22d3ee, #3b82f6);
          border-radius: 99px;
          transition: transform 0.25s ease;
        }
        .mobile-link:hover {
          color: #67e8f9;
        }
        .mobile-link:hover::before {
          transform: translateY(-50%) scaleY(1);
        }

        /* Hamburger */
        .menu-btn {
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(34, 211, 238, 0.25);
          border-radius: 8px;
          padding: 6px;
          cursor: pointer;
          color: #22d3ee;
          transition: background 0.25s ease, box-shadow 0.25s ease;
        }
        .menu-btn:hover {
          background: rgba(6, 182, 212, 0.18);
          box-shadow: 0 0 14px rgba(34, 211, 238, 0.25);
        }
      `}</style>

      <nav
        ref={navRef}
        className={`nav-root nav-glass fixed top-0 w-full z-50 ${isScrolled ? "scrolled" : ""}`}
        style={{ paddingTop: isScrolled ? "2px" : "10px", paddingBottom: isScrolled ? "2px" : "10px", transition: "padding 0.4s ease" }}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

          {/* Logo */}
          <div
            className="logo-wrap flex items-center gap-3 cursor-pointer"
            onClick={() => handleScrollTo("#home", "Home")}
          >
            <img
              src="/images/logo.png"
              alt="AJU ED SOLUTIONS Logo"
              className="logo-img w-15 h-15 object-contain"
            />
            <span className="logo-text text-xl md:text-2xl">AJU ED SOLUTIONS</span>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex gap-7 items-center">
            {navLinks.map((link) => (
              <li key={link.name}>
                <button
                  className={`nav-link ${activeLink === link.name ? "active" : ""}`}
                  onClick={() => handleScrollTo(link.id, link.name)}
                >
                  {link.name}
                </button>
              </li>
            ))}
            <li>
              <button
                className="cta-btn"
                onClick={() => handleScrollTo("#contact", "Contact")}
              >
                <span className="cta-btn-inner">Contact</span>
              </button>
            </li>
          </ul>

          {/* Mobile menu toggle */}
          <button
            className="menu-btn lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="mobile-menu lg:hidden absolute top-full left-0 w-full">
            <ul className="flex flex-col items-start py-6 gap-5 px-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <button
                    className="mobile-link"
                    onClick={() => handleScrollTo(link.id, link.name)}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
              <li className="mt-2">
                <button
                  className="cta-btn"
                  onClick={() => handleScrollTo("#contact", "Contact")}
                >
                  <span className="cta-btn-inner">Contact</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};

export default Nav;