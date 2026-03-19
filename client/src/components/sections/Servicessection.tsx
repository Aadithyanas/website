"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { motion, AnimatePresence } from "motion/react";
import {
  Laptop, CloudCog, Database, Network, Bot,
  Palette, Building, GraduationCap, Briefcase, Cpu,
} from "lucide-react";
import { useCompany, CompanyId } from "./CompanyContext";

// ── GlowingEffect ─────────────────────────────────────────────────────────────
interface GlowingEffectProps {
  blur?: number; inactiveZone?: number; proximity?: number; spread?: number;
  variant?: "default" | "white"; glow?: boolean; className?: string;
  disabled?: boolean; movementDuration?: number; borderWidth?: number;
}

const GlowingEffect = memo(({
  blur = 0, inactiveZone = 0.7, proximity = 0, spread = 20,
  variant = "default", glow = false, className, movementDuration = 2,
  borderWidth = 1, disabled = true,
}: GlowingEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  const handleMove = useCallback((e?: MouseEvent | { x: number; y: number }) => {
    if (!containerRef.current) return;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
      const element = containerRef.current;
      if (!element) return;
      const { left, top, width, height } = element.getBoundingClientRect();
      const mouseX = e?.x ?? lastPosition.current.x;
      const mouseY = e?.y ?? lastPosition.current.y;
      if (e) lastPosition.current = { x: mouseX, y: mouseY };
      const center = [left + width * 0.5, top + height * 0.5];
      const distanceFromCenter = Math.hypot(mouseX - center[0], mouseY - center[1]);
      const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;
      if (distanceFromCenter < inactiveRadius) { element.style.setProperty("--active", "0"); return; }
      const isActive = mouseX > left - proximity && mouseX < left + width + proximity &&
        mouseY > top - proximity && mouseY < top + height + proximity;
      element.style.setProperty("--active", isActive ? "1" : "0");
      if (!isActive) return;
      const currentAngle = parseFloat(element.style.getPropertyValue("--start")) || 0;
      const targetAngle = (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) / Math.PI + 90;
      const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
      animate(currentAngle, currentAngle + angleDiff, {
        duration: movementDuration, ease: [0.16, 1, 0.3, 1],
        onUpdate: (value) => element.style.setProperty("--start", String(value)),
      });
    });
  }, [inactiveZone, proximity, movementDuration]);

  useEffect(() => {
    if (disabled) return;
    const handleScroll = () => handleMove();
    const handlePointerMove = (e: PointerEvent) => handleMove(e);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.body.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("pointermove", handlePointerMove);
    };
  }, [handleMove, disabled]);

  const gradient = variant === "white"
    ? `repeating-conic-gradient(from 236.84deg at 50% 50%, #000, #000 calc(25% / 5))`
    : `radial-gradient(circle, #22d3ee 10%, #22d3ee00 20%),
       radial-gradient(circle at 40% 40%, #3b82f6 5%, #3b82f600 15%),
       radial-gradient(circle at 60% 60%, #818cf8 10%, #818cf800 20%),
       radial-gradient(circle at 40% 60%, #06b6d4 10%, #06b6d400 20%),
       repeating-conic-gradient(from 236.84deg at 50% 50%,
         #22d3ee 0%, #3b82f6 calc(25%/5), #818cf8 calc(50%/5),
         #06b6d4 calc(75%/5), #22d3ee calc(100%/5))`;

  return (
    <>
      <div className={["pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
        glow ? "opacity-100" : "", variant === "white" ? "border-white" : "", disabled ? "!block" : ""].join(" ")} />
      <div ref={containerRef}
        style={{ "--blur": `${blur}px`, "--spread": spread, "--start": "0", "--active": "0",
          "--glowingeffect-border-width": `${borderWidth}px`, "--repeating-conic-gradient-times": "5",
          "--gradient": gradient } as React.CSSProperties}
        className={["pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
          glow ? "opacity-100" : "", blur > 0 ? "blur-[var(--blur)]" : "", className ?? "", disabled ? "!hidden" : ""].join(" ")}
      >
        <div className={["glow rounded-[inherit]",
          'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
          "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
          "after:[background:var(--gradient)] after:[background-attachment:fixed]",
          "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
          "after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect]",
          "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]",
        ].join(" ")} />
      </div>
    </>
  );
});
GlowingEffect.displayName = "GlowingEffect";

// ── Service definitions ───────────────────────────────────────────────────────
const ALL_SERVICES = [
  {
    key: "web",
    icon: <Laptop className="h-5 w-5" />,
    title: "Web & App Development",
    description: "Custom websites, mobile apps, progressive web apps, and fully responsive solutions crafted for every device.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    companies: ["techzora"] as CompanyId[],
    area: "md:[grid-area:1/1/2/5] xl:[grid-area:1/1/2/5]",
  },
  {
    key: "aiml",
    icon: <Database className="h-5 w-5" />,
    title: "AI / ML & Data Analytics",
    description: "Predictive analytics, custom AI models, data dashboards, and research support turning raw data into intelligence.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    companies: ["techzora"] as CompanyId[],
    area: "md:[grid-area:1/5/2/9] xl:[grid-area:1/5/2/9]",
  },
  {
    key: "iot",
    icon: <Network className="h-5 w-5" />,
    title: "IoT Solutions",
    description: "Smart classrooms, connected sensor networks, and real-time monitoring systems for modern intelligent environments.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    companies: ["techzora"] as CompanyId[],
    area: "md:[grid-area:1/9/2/13] xl:[grid-area:1/9/2/13]",
  },
  {
    key: "erp",
    icon: <CloudCog className="h-5 w-5" />,
    title: "ERP & Automation",
    description: "Enterprise resource planning, workflow automation, and digital transformation for education & business.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    companies: ["techzora"] as CompanyId[],
    area: "md:[grid-area:2/1/3/5] xl:[grid-area:2/1/3/5]",
  },
  {
    key: "branding",
    icon: <Palette className="h-5 w-5" />,
    title: "Branding & Marketing",
    description: "Logo design, brand strategy, digital marketing, and social media campaigns via AJU Brandify.",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
    companies: ["brandify"] as CompanyId[],
    area: "md:[grid-area:2/5/3/9] xl:[grid-area:2/5/3/9]",
  },
  {
    key: "robotics",
    icon: <Bot className="h-5 w-5" />,
    title: "Robotics & Automation",
    description: "Low-cost robotics kits, lab automation, and hands-on robotics education programs for students.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    companies: ["techzora"] as CompanyId[],
    area: "md:[grid-area:2/9/3/13] xl:[grid-area:2/9/3/13]",
  },
  {
    key: "cowork",
    icon: <Building className="h-5 w-5" />,
    title: "Co-working Spaces",
    description: "Flexible workspace rentals, community networking, and startup-friendly facilities at ScrumSpace CoWorks.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    companies: ["scrumspace"] as CompanyId[],
    area: "md:[grid-area:3/1/4/5] xl:[grid-area:3/1/4/5]",
  },
  {
    key: "coaching",
    icon: <GraduationCap className="h-5 w-5" />,
    title: "BTech Coaching",
    description: "Engineering coaching, subject tutorials, coding labs, and practical workshops for engineering students.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
    companies: ["ajuedsolution"] as CompanyId[], // default only
    area: "md:[grid-area:3/5/4/9] xl:[grid-area:3/5/4/9]",
  },
  {
    key: "internship",
    icon: <Briefcase className="h-5 w-5" />,
    title: "Internships & Projects",
    description: "Hands-on industry projects, internship opportunities, and mentorship programs bridging academics and careers.",
    image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80",
    companies: ["ajuedsolution"] as CompanyId[], // default only
    area: "md:[grid-area:3/9/4/13] xl:[grid-area:3/9/4/13]",
  },
];

const COMPANY_META: Record<CompanyId, { label: string; color: string; icon: React.ReactNode }> = {
  default:        { label: "All Services",        color: "text-cyan-400",   icon: null },
  ajuedsolution:  { label: "AJU ED Solutions",    color: "text-cyan-400",   icon: <Cpu size={14} /> },
  techzora:       { label: "AJU TECHZORA",        color: "text-cyan-400",   icon: <Cpu size={14} /> },
  brandify:       { label: "AJU Brandify",        color: "text-purple-400", icon: <Palette size={14} /> },
  scrumspace:     { label: "ScrumSpace CoWorks",  color: "text-blue-400",   icon: <Building size={14} /> },
};

// ── GridItem ──────────────────────────────────────────────────────────────────
const GridItem = ({ area, icon, title, description, image }: {
  area: string; icon: React.ReactNode; title: string; description: string; image: string;
}) => (
  <li className={["min-h-[16rem] list-none", area].join(" ")}>
    <div className="relative h-full rounded-[1.25rem] border border-white/10 p-2 md:rounded-[1.5rem] md:p-3">
      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-[#050505] shadow-[0px_0px_27px_0px_rgba(0,20,40,0.4)]">
        <div className="relative h-40 w-full shrink-0 overflow-hidden">
          <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#050505]" />
        </div>
        <div className="flex flex-1 flex-col justify-between gap-3 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 rounded-lg border border-white/10 bg-white/[0.04] p-2 text-cyan-400">{icon}</div>
            <h3 className="text-base font-semibold leading-snug tracking-tight text-white md:text-lg">{title}</h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  </li>
);

// ── ServicesSection ───────────────────────────────────────────────────────────
export const ServicesSection = () => {
  const { activeCompany } = useCompany();
  const meta = COMPANY_META[activeCompany];

  // Filter services based on active company
 const visibleServices =
  activeCompany === "default"
    ? ALL_SERVICES
    : ALL_SERVICES.filter((s) =>
        s.companies.includes(activeCompany)
      );
  // Re-assign grid areas for filtered view (simple flow layout)
  const areaMap = [
    "md:[grid-area:1/1/2/5] xl:[grid-area:1/1/2/5]",
    "md:[grid-area:1/5/2/9] xl:[grid-area:1/5/2/9]",
    "md:[grid-area:1/9/2/13] xl:[grid-area:1/9/2/13]",
    "md:[grid-area:2/1/3/5] xl:[grid-area:2/1/3/5]",
    "md:[grid-area:2/5/3/9] xl:[grid-area:2/5/3/9]",
    "md:[grid-area:2/9/3/13] xl:[grid-area:2/9/3/13]",
    "md:[grid-area:3/1/4/5] xl:[grid-area:3/1/4/5]",
    "md:[grid-area:3/5/4/9] xl:[grid-area:3/5/4/9]",
    "md:[grid-area:3/9/4/13] xl:[grid-area:3/9/4/13]",
  ];

  const rows = Math.ceil(visibleServices.length / 3);

  return (
    <section id="services" className="py-24 bg-black text-white relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header — animates when company changes */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCompany}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="text-center mb-16"
          >
            <h2 className="text-cyan-400 font-mono tracking-widest uppercase mb-4 text-sm">Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-bold">
              {activeCompany === "default" ? "Services" : `${meta.label} Services`}
            </h3>

            {/* Active company badge */}
            {activeCompany !== "default" && (
              <div className={`inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium ${meta.color}`}>
                {meta.icon}
                {meta.label}
                <span className="text-gray-500 text-xs ml-1">
                  — {visibleServices.length} service{visibleServices.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
              {activeCompany === "default"
                ? "Empowering education, enterprises, and innovators with futuristic solutions."
                : `Showing services offered by ${meta.label}. Click a company above to switch.`}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Grid — cards animate in/out */}
        <AnimatePresence mode="wait">
          <motion.ul
            key={activeCompany + "-grid"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`grid grid-cols-1 gap-4 md:grid-cols-12 lg:gap-4`}
            style={{ gridTemplateRows: `repeat(${rows}, auto)` }}
          >
            {visibleServices.map((svc, i) => (
              <motion.div
                key={svc.key}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: [0.34, 1.1, 0.64, 1] }}
                className={["list-none", areaMap[i] ?? ""].join(" ")}
                style={{ listStyle: "none" }}
              >
                {/* Re-wrap to keep GridItem's li-based styling */}
                <ul className="h-full">
                  <GridItem
                    area=""
                    icon={svc.icon}
                    title={svc.title}
                    description={svc.description}
                    image={svc.image}
                  />
                </ul>
              </motion.div>
            ))}
          </motion.ul>
        </AnimatePresence>

        {/* Empty state */}
        {visibleServices.length === 0 && (
          <div className="text-center py-24 text-gray-600">
            <p className="text-lg font-mono">No services found for this company.</p>
          </div>
        )}
      </div>
    </section>
  );
};