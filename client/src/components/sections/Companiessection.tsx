"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cpu, Palette, Building, CheckCircle2,GraduationCap} from "lucide-react";
import { useCompany, CompanyId } from "./CompanyContext";

gsap.registerPlugin(ScrollTrigger);

const COMPANIES: {
  id: CompanyId;
  icon: React.ReactNode;
  title: string;
  tagline: string;
  desc: string;
  color: string;
  accent: string;
  border: string;
  services: string[];
}[] = [
  {
    id: "techzora",
    icon: <Cpu size={32} />,
    title: "AJU TECHZORA",
    tagline: "Tech & Innovation",
    desc: "Web and mobile development, IoT, Robotics, AI/ML & Tech Solutions at low cost for customers and enterprises.",
    color: "text-cyan-400",
    accent: "rgba(34,211,238,0.12)",
    border: "rgba(34,211,238,0.5)",
    services: ["Web & App", "AI / ML", "IoT", "Robotics", "ERP"],
  },
  {
    id: "brandify",
    icon: <Palette size={32} />,
    title: "AJU Brandify",
    tagline: "Branding & Growth",
    desc: "Branding, Digital Marketing & Web Solutions to help businesses grow and shine online.",
    color: "text-purple-400",
    accent: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.5)",
    services: ["Branding", "Marketing"],
  },
  {
    id: "scrumspace",
    icon: <Building size={32} />,
    title: "ScrumSpace CoWorks",
    tagline: "Community & Workspace",
    desc: "Modern coworking spaces with community-driven initiatives for startups and creators.",
    color: "text-blue-400",
    accent: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.5)",
    services: ["Co-working"],
  },
//   {
//   id: "ajuedsolution" as CompanyId,
//   icon: <GraduationCap size={32} />,
//   title: "AJU ED Solutions",
//   tagline: "Main Organization",
//   desc: "The parent organization behind all initiatives — BTech coaching, internships, and the full suite of education technology solutions.",
//   color: "text-cyan-400",
//   accent: "rgba(34,211,238,0.12)",
//   border: "rgba(34,211,238,0.5)",
//   services: ["All Services"],
// },
];

export const CompaniesSection = () => {
  const { activeCompany, setActiveCompany } = useCompany();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(
      cardRefs.current.filter(Boolean),
      { opacity: 0, y: 48, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.7, stagger: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      }
    );
  }, []);

  const handleClick = (id: CompanyId) => {
    if (activeCompany === id) {
      setActiveCompany("default");
    } else {
      setActiveCompany(id);
      setTimeout(() => {
        const el = document.getElementById("services");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    }
  };

  return (
    <section
      id="companies"
      className="py-24 bg-black text-white relative border-t border-white/5"
      ref={sectionRef}
    >
      <style>{`
        .company-card-inner {
          transition: transform 0.35s cubic-bezier(0.34,1.2,0.64,1),
                      box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease;
        }
        .company-card-inner:hover { transform: translateY(-6px) scale(1.02); }
        .company-card-inner.active-card { transform: translateY(-8px) scale(1.03); }
      `}</style>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
         
          <h3 className="text-4xl md:text-5xl font-bold">Our Companies</h3>
          <p className="text-gray-400 text-lg mt-4">Innovating across multiple domains under the AJU umbrella</p>
          <p className="text-gray-600 text-sm mt-3 font-mono tracking-wide">
            ↓ Click a company card to filter services below
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {COMPANIES.map((comp, i) => {
            const isActive = activeCompany === comp.id;
            return (
              <div
                key={comp.id}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="cursor-pointer"
                onClick={() => handleClick(comp.id)}
              >
                <div
                  className={`company-card-inner relative rounded-2xl p-8 overflow-hidden ${isActive ? "active-card" : ""}`}
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${comp.accent}, rgba(5,5,5,0.9))`
                      : "linear-gradient(135deg, rgba(255,255,255,0.03), transparent)",
                    border: `1px solid ${isActive ? comp.border : "rgba(255,255,255,0.08)"}`,
                    boxShadow: isActive ? `0 0 40px ${comp.accent}, 0 8px 32px rgba(0,0,0,0.5)` : "none",
                  }}
                >
                  {/* Active badge */}
                  {isActive && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15">
                      <CheckCircle2 size={11} className={comp.color} />
                      <span className={`text-[10px] font-semibold tracking-widest uppercase ${comp.color}`}>Active</span>
                    </div>
                  )}

                  {/* Glow blob */}
                  {isActive && (
                    <div
                      className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
                      style={{ background: `radial-gradient(circle, ${comp.accent} 0%, transparent 70%)`, filter: "blur(24px)" }}
                    />
                  )}

                  {/* Icon */}
                  <div className={`${comp.color} mb-3 drop-shadow-[0_0_10px_currentColor] transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                    {comp.icon}
                  </div>

                  {/* Tagline */}
                  <p className={`text-xs font-mono tracking-widest uppercase mb-2 ${comp.color} opacity-70`}>{comp.tagline}</p>

                  {/* Title */}
                  <h4 className="text-xl font-bold mb-3">{comp.title}</h4>

                  {/* Desc */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">{comp.desc}</p>

                  {/* Service pills */}
                  <div className="flex flex-wrap gap-2">
                    {comp.services.map((s) => (
                      <span
                        key={s}
                        className={`text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border transition-all duration-300 ${
                          isActive ? `${comp.color} border-current bg-white/5` : "text-gray-600 border-white/10"
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* CTA hint */}
                  <div className={`mt-5 text-xs font-mono tracking-widest transition-all duration-300 ${isActive ? comp.color : "text-gray-700"}`}>
                    {isActive ? "▼ Showing filtered services" : "Click to filter services →"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset button */}
        {activeCompany !== "default" && (
          <div className="text-center mt-8 animate-fade-in">
            <button
              onClick={() => setActiveCompany("default")}
              className="text-xs text-gray-500 hover:text-white font-mono tracking-widest uppercase border border-white/10 px-5 py-2.5 rounded-full hover:border-white/30 transition-all duration-200"
            >
              ✕ Show All Services
            </button>
          </div>
        )}
      </div>
    </section>
  );
};