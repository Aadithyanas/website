"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  FacebookIcon, InstagramIcon, YoutubeIcon, LinkedinIcon,
  Twitter, Mail, Phone, MapPin, Bot, Cpu, Building2,
  ArrowUpRight, Heart,
} from "lucide-react";

interface FooterLink { title: string; href: string; }
interface FooterLinkGroup { label: string; links: FooterLink[]; }

const socialLinks = [
  { title: "Facebook",  href: "#", icon: FacebookIcon,  color: "#818cf8" },
  { title: "Instagram", href: "#", icon: InstagramIcon, color: "#f472b6" },
  { title: "YouTube",   href: "#", icon: YoutubeIcon,   color: "#fb923c" },
  { title: "LinkedIn",  href: "#", icon: LinkedinIcon,  color: "#38bdf8" },
  { title: "Twitter",   href: "#", icon: Twitter,       color: "#a5b4fc" },
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

function AnimatedContainer({
  delay = 0.1, children, className,
}: { delay?: number; children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const FOOTER_HEIGHT = 700;

export const Footer = () => (
  <footer
    className="relative w-full"
    style={{
      height: FOOTER_HEIGHT,
      clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)",
    }}
  >
    <div className="fixed bottom-0 w-full" style={{ height: FOOTER_HEIGHT }}>
      <div
        className="sticky overflow-y-auto h-full"
        style={{ top: `calc(100vh - ${FOOTER_HEIGHT}px)` }}
      >
        <div
          className="relative flex h-full w-full flex-col justify-between"
          style={{ background: "#000" }}
        >
          {/* Top decorative bar */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.6) 30%, rgba(6,214,160,0.5) 55%, rgba(244,114,182,0.4) 80%, transparent 100%)",
              boxShadow: "0 0 20px rgba(99,102,241,0.3)",
            }}
          />

          {/* Ambient glows */}
          <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute -top-32 left-1/4 w-[600px] h-[300px] rounded-full"
              style={{
                background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
            <div
              className="absolute bottom-0 right-1/4 w-[400px] h-[250px] rounded-full"
              style={{
                background: "radial-gradient(ellipse, rgba(6,214,160,0.05) 0%, transparent 70%)",
                filter: "blur(50px)",
              }}
            />
          </div>

          {/* ── Main content ── */}
          <div className="relative z-10 px-6 sm:px-10 pt-12 pb-6 flex flex-col gap-10 flex-1">

            {/* Top row: brand + links */}
            <div className="flex flex-col lg:flex-row gap-10">

              {/* Brand column */}
              <AnimatedContainer delay={0.05} className="w-full lg:max-w-sm shrink-0 space-y-6">

                {/* Logo + name */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(6,214,160,0.15))",
                      border: "1px solid rgba(99,102,241,0.3)",
                      boxShadow: "4px 4px 14px rgba(0,0,0,0.55), -2px -2px 8px rgba(255,255,255,0.04), 0 0 20px rgba(99,102,241,0.15)",
                    }}
                  >
                    <img
                      src="/images/logo.png"
                      alt="AJU ED SOLUTIONS"
                      className="w-7 h-7 object-contain"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                        img.parentElement!.innerHTML = `<span style="font-size:18px;font-weight:900;background:linear-gradient(135deg,#818cf8,#06d6a0);-webkit-background-clip:text;-webkit-text-fill-color:transparent">A</span>`;
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-base font-bold tracking-wider leading-none"
                      style={{
                        background: "linear-gradient(135deg, #a5b4fc, #6366f1, #06d6a0)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      AJU ED SOLUTIONS
                    </p>
                    <p
                      className="text-[10px] font-mono tracking-[0.2em] uppercase mt-0.5"
                      style={{ color: "rgba(110,130,168,0.65)" }}
                    >
                      LLP · Est. 2020
                    </p>
                  </div>
                </div>

                {/* Tagline */}
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(176,190,220,0.70)" }}
                >
                  Redefining education &amp; technology with AI, ML, IoT,
                  Robotics, ERP &amp; Web — empowering students, institutions,
                  and enterprises across Kerala and beyond.
                </p>

                {/* Company badges */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: <Cpu size={10} />,       label: "TECHZORA",   color: "#818cf8",  border: "rgba(99,102,241,0.28)",  bg: "rgba(99,102,241,0.07)"  },
                    { icon: <Bot size={10} />,        label: "Brandify",   color: "#06d6a0",  border: "rgba(6,214,160,0.28)",   bg: "rgba(6,214,160,0.07)"   },
                    { icon: <Building2 size={10} />,  label: "ScrumSpace", color: "#f472b6",  border: "rgba(244,114,182,0.25)", bg: "rgba(244,114,182,0.07)" },
                  ].map((b) => (
                    <span
                      key={b.label}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide"
                      style={{
                        color: b.color,
                        border: `1px solid ${b.border}`,
                        background: b.bg,
                        boxShadow: "3px 3px 10px rgba(0,0,0,0.48), -1px -1px 5px rgba(255,255,255,0.04)",
                      }}
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
                      className="group flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-250"
                      style={{
                        border: "1px solid rgba(255,255,255,0.07)",
                        background: "rgba(10,10,10,0.8)",
                        color: "rgba(110,130,168,0.65)",
                        boxShadow: "3px 3px 10px rgba(0,0,0,0.45), -1px -1px 5px rgba(255,255,255,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.color = s.color;
                        el.style.borderColor = `${s.color}44`;
                        el.style.background = `${s.color}12`;
                        el.style.boxShadow = `0 0 14px ${s.color}30, 3px 3px 10px rgba(0,0,0,0.48), -1px -1px 5px rgba(255,255,255,0.04)`;
                        el.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.color = "rgba(110,130,168,0.65)";
                        el.style.borderColor = "rgba(255,255,255,0.07)";
                        el.style.background = "rgba(10,10,10,0.8)";
                        el.style.boxShadow = "3px 3px 10px rgba(0,0,0,0.45), -1px -1px 5px rgba(255,255,255,0.04)";
                        el.style.transform = "translateY(0)";
                      }}
                    >
                      <s.icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>

                {/* Contact details */}
                <div className="space-y-2">
                  {[
                    { icon: <Mail size={12} />, label: "info@ajuedsolutions.com", href: "mailto:info@ajuedsolutions.com" },
                    { icon: <Phone size={12} />, label: "+91 8301 973 970", href: "tel:+918301973970" },
                    { icon: <MapPin size={12} />, label: "Kerala, India", href: "#" },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-2 text-xs transition-colors duration-200 group w-fit"
                      style={{ color: "rgba(110,130,168,0.68)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#a5b4fc"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(110,130,168,0.68)"; }}
                    >
                      <span style={{ color: "rgba(99,102,241,0.6)" }}>{item.icon}</span>
                      {item.label}
                    </a>
                  ))}
                </div>
              </AnimatedContainer>

              {/* Link columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full">
                {footerLinkGroups.map((group, index) => (
                  <AnimatedContainer key={group.label} delay={0.1 + index * 0.08}>
                    <h3
                      className="text-xs font-bold uppercase tracking-[0.2em] mb-5 inline-flex items-center gap-2"
                      style={{ color: "rgba(165,180,252,0.8)" }}
                    >
                      <span
                        className="w-4 h-px rounded-full"
                        style={{ background: "linear-gradient(90deg, #6366f1, #06d6a0)" }}
                      />
                      {group.label}
                    </h3>
                    <ul className="space-y-2.5">
                      {group.links.map((link) => (
                        <li key={link.title}>
                          <a
                            href={link.href}
                            className="group text-sm inline-flex items-center gap-1 transition-all duration-200"
                            style={{ color: "rgba(110,130,168,0.7)" }}
                            onMouseEnter={(e) => {
                              const el = e.currentTarget as HTMLAnchorElement;
                              el.style.color = "#a5b4fc";
                              el.style.paddingLeft = "4px";
                            }}
                            onMouseLeave={(e) => {
                              const el = e.currentTarget as HTMLAnchorElement;
                              el.style.color = "rgba(110,130,168,0.7)";
                              el.style.paddingLeft = "0";
                            }}
                          >
                            {link.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </AnimatedContainer>
                ))}
              </div>
            </div>

            {/* CTA strip */}
            <AnimatedContainer delay={0.35}>
              <div
                className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,214,160,0.06))",
                  border: "1px solid rgba(99,102,241,0.18)",
                  boxShadow: "5px 5px 18px rgba(0,0,0,0.5), -2px -2px 10px rgba(255,255,255,0.04)",
                }}
              >
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#eef2ff" }}>
                    Ready to innovate together?
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(176,190,220,0.65)" }}>
                    Let&apos;s build something exceptional — reach out today.
                  </p>
                </div>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide shrink-0 transition-all duration-250"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #818cf8)",
                    color: "#fff",
                    boxShadow: "0 4px 18px rgba(99,102,241,0.4), 3px 3px 12px rgba(0,0,0,0.45), -1px -1px 6px rgba(255,255,255,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.boxShadow = "0 8px 32px rgba(99,102,241,0.6), 3px 3px 12px rgba(0,0,0,0.45), -1px -1px 6px rgba(255,255,255,0.04)";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.boxShadow = "0 4px 18px rgba(99,102,241,0.4), 3px 3px 12px rgba(0,0,0,0.45), -1px -1px 6px rgba(255,255,255,0.04)";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  Get In Touch <ArrowUpRight size={15} />
                </a>
              </div>
            </AnimatedContainer>
          </div>

          {/* ── Bottom bar ── */}
          <div
            className="relative z-10 px-6 sm:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: "1px solid rgba(99,102,241,0.1)" }}
          >
            <p
              className="text-[11px] font-mono tracking-wide flex items-center gap-1.5"
              style={{ color: "rgba(110,130,168,0.5)" }}
            >
              © {new Date().getFullYear()} AJU ED SOLUTIONS LLP · All Rights Reserved · Made with
              <Heart size={10} style={{ color: "#f472b6", fill: "#f472b6" }} />
              in Kerala
            </p>
            <div className="flex gap-5">
              {["PRIVACY POLICY", "TERMS OF SERVICE"].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="text-[10px] font-mono tracking-widest transition-colors duration-200"
                  style={{ color: "rgba(110,130,168,0.5)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(165,180,252,0.85)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(110,130,168,0.5)"; }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  </footer>
);

export default Footer;