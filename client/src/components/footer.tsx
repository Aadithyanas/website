"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  FacebookIcon, InstagramIcon, YoutubeIcon, LinkedinIcon,
  Twitter, Mail, Phone, MapPin, Bot, Cpu, Building2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FooterLink { title: string; href: string; }
interface FooterLinkGroup { label: string; links: FooterLink[]; }

// ── Data ──────────────────────────────────────────────────────────────────────
const socialLinks = [
  { title: "Facebook",  href: "#", icon: FacebookIcon  },
  { title: "Instagram", href: "#", icon: InstagramIcon },
  { title: "YouTube",   href: "#", icon: YoutubeIcon   },
  { title: "LinkedIn",  href: "#", icon: LinkedinIcon  },
  { title: "Twitter",   href: "#", icon: Twitter       },
];

const footerLinkGroups: FooterLinkGroup[] = [
  {
    label: "Services",
    links: [
      { title: "Web & App Development", href: "#services" },
      { title: "ERP & Automation",      href: "#services" },
      { title: "AI / ML & Data",        href: "#services" },
      { title: "IoT Solutions",         href: "#services" },
      { title: "Robotics",              href: "#services" },
      { title: "Branding & Marketing",  href: "#services" },
      { title: "Co-working Spaces",     href: "#services" },
      { title: "BTech Coaching",        href: "#services" },
      { title: "Internships",           href: "#services" },
    ],
  },
  {
    label: "Companies",
    links: [
      { title: "AJU TECHZORA",       href: "#companies" },
      { title: "AJU Brandify",       href: "#companies" },
      { title: "ScrumSpace CoWorks", href: "#companies" },
    ],
  },
  {
    label: "Explore",
    links: [
      { title: "About Us",         href: "#about"        },
    
    
      { title: "Testimonials",     href: "#testimonials" },
      { title: "Contact Us",       href: "#contact"      },
      { title: "Privacy Policy",   href: "#"             },
      { title: "Terms of Service", href: "#"             },
    ],
  },
];

// ── AnimatedContainer ─────────────────────────────────────────────────────────
type AnimatedContainerProps = React.ComponentProps<typeof motion.div> & {
  children?: React.ReactNode;
  delay?: number;
};

function AnimatedContainer({ delay = 0.1, children, ...props }: AnimatedContainerProps) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
const FOOTER_HEIGHT = 640;

export const Footer = () => (
  <footer
    className="relative w-full"
    style={{
      height: FOOTER_HEIGHT,
      clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)",
    }}
  >
    <div
      className="fixed bottom-0 w-full"
      style={{ height: FOOTER_HEIGHT }}
    >
      <div
        className="sticky overflow-y-auto h-full"
        style={{ top: `calc(100vh - ${FOOTER_HEIGHT}px)` }}
      >
        {/* Background */}
        <div className="relative flex h-full w-full flex-col justify-between gap-5 bg-[#030303] border-t border-cyan-500/20 px-6 py-10 md:px-12">

          {/* Decorative glows */}
          <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] rounded-full"
              style={{
                background: "radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
            <div
              className="absolute top-0 left-0 w-[500px] h-[300px] -translate-y-1/2 -rotate-45 rounded-full"
              style={{
                background: "radial-gradient(ellipse, rgba(6,182,212,0.04) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
          </div>

          {/* Main content */}
          <div className="relative z-10 mt-2 flex flex-col gap-10 md:flex-row">

            {/* Brand column */}
            <AnimatedContainer delay={0.05} className="w-full max-w-xs shrink-0 space-y-5">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <img
                  src="/images/logo.png"
                  alt="AJU ED SOLUTIONS"
                  className="w-9 h-9 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <span
                  className="text-lg font-bold tracking-wider"
                  style={{
                    background: "linear-gradient(135deg,#67e8f9,#3b82f6,#a78bfa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  AJU ED SOLUTIONS
                </span>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed">
                Redefining education &amp; technology with AI, ML, IoT, Robotics,
                ERP &amp; Web solutions — empowering students, institutions, and enterprises.
              </p>

              {/* Company badges */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <Cpu size={11} />,      label: "TECHZORA"   },
                  { icon: <Bot size={11} />,       label: "Brandify"   },
                  { icon: <Building2 size={11} />, label: "ScrumSpace" },
                ].map((b) => (
                  <span
                    key={b.label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide text-cyan-400/80 border border-cyan-500/20 bg-cyan-500/5"
                  >
                    {b.icon}{b.label}
                  </span>
                ))}
              </div>

              {/* Social icons */}
              <div className="flex gap-2 flex-wrap">
                {socialLinks.map((s) => (
                  <a
                    key={s.title}
                    href={s.href}
                    aria-label={s.title}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-gray-400 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-200"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>

              {/* Contact */}
              <div className="space-y-1.5">
                <a href="mailto:info@ajuedsolutions.com" className="flex items-center gap-2 text-xs text-gray-500 hover:text-cyan-400 transition-colors">
                  <Mail size={11} className="text-cyan-500/50 shrink-0" />
                  info@ajuedsolutions.com
                </a>
                <a href="tel:+918301973970" className="flex items-center gap-2 text-xs text-gray-500 hover:text-cyan-400 transition-colors">
                  <Phone size={11} className="text-cyan-500/50 shrink-0" />
                  +91 8301 973 970
                </a>
                <span className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={11} className="text-cyan-500/50 shrink-0" />
                  Kerala, India
                </span>
              </div>
            </AnimatedContainer>

            {/* Link groups */}
            {footerLinkGroups.map((group, index) => (
              <AnimatedContainer key={group.label} delay={0.1 + index * 0.1} className="w-full">
                <div className="mb-8 md:mb-0">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-4">
                    {group.label}
                  </h3>
                  <ul className="space-y-2">
                    {group.links.map((link) => (
                      <li key={link.title}>
                        <a
                          href={link.href}
                          className="text-sm text-gray-500 hover:text-cyan-400 transition-colors duration-200 inline-block"
                        >
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedContainer>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="relative z-10 flex flex-col items-center justify-between gap-2 border-t border-white/5 pt-5 text-xs text-gray-600 font-mono md:flex-row">
            <p>© {new Date().getFullYear()} AJU ED SOLUTIONS. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-400 transition-colors">PRIVACY POLICY</a>
              <a href="#" className="hover:text-gray-400 transition-colors">TERMS OF SERVICE</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  </footer>
);

export default Footer;