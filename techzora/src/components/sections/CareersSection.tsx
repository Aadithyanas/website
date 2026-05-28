"use client";

import React, { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useCompany, CompanyId } from "./CompanyContext";
import { Briefcase, Video, Palette, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const VP = { once: true, amount: 0.2 };

const fadeUp = (delay = 0, distance = 28) => ({
  hidden: { opacity: 0, y: distance, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, delay, ease: EASE },
  },
});

interface JobPost {
  id: string;
  title: string;
  type: string;
  location: string;
  description: string;
  requirements: string[];
  tools: string[];
  experience: string;
  color: string;
  icon: React.ReactNode;
}

const JOBS: Record<CompanyId, JobPost[]> = {
  default: [
    {
      id: "video-editor",
      title: "Senior Video Editor",
      type: "Full-time / Hybrid",
      location: "Kerala",
      description: "We are looking for a creative and skilled Video Editor to join our dynamic production team. You will be responsible for editing high-quality video content for our educational platforms and marketing campaigns.",
      requirements: [
        "Proven work experience as a Video Editor",
        "Creative mind and storytelling skills",
        "Ability to handle multiple projects and tight deadlines",
        "Strong portfolio of edited videos"
      ],
      tools: ["Adobe Premiere Pro", "After Effects", "Davinci Resolve", "CapCut (Desktop)", "Photoshop"],
      experience: "2+ Years in Professional Video Editing",
      color: "#818cf8",
      icon: <Video size={20} />
    }
  ],
  techzora: [
    {
        id: "frontend-dev",
        title: "Frontend Developer",
        type: "Full-time",
        location: "Remote / Hybrid",
        description: "Join our core engineering team to build state-of-the-art web applications. You will be working with Next.js, TypeScript, and Framer Motion.",
        requirements: [
          "Expertise in React and Next.js",
          "Deep understanding of CSS and animations",
          "Experience with state management libraries",
          "Clean code enthusiast"
        ],
        tools: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
        experience: "2+ Years in Frontend Development",
        color: "#06d6a0",
        icon: <Briefcase size={20} />
      }
  ],
  brandify: [
    {
        id: "graphic-designer",
        title: "Creative Graphic Designer",
        type: "Full-time",
        location: "Kerala",
        description: "We're searching for a creative visual storyteller who can transform complex ideas into stunning visual designs.",
        requirements: [
          "Strong portfolio of branding and digital design",
          "Expert knowledge of layout, typography, and color theory",
          "Ability to collaborate with marketing teams",
          "Eye for detail and aesthetic excellence"
        ],
        tools: ["Adobe Illustrator", "Photoshop", "Figma", "After Effects"],
        experience: "1.5+ Years in Brand Design",
        color: "#f472b6",
        icon: <Palette size={20} />
      }
  ],
  scrumspacecoworks: [],
  ajuedsolution: []
};

export const CareersSection = () => {
  const reduced = useReducedMotion();
  const { activeCompany } = useCompany();
  const jobList = JOBS[activeCompany] || JOBS.default;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleApply = async (job: JobPost) => {
    const email = "careers@ajuedsolutions.com";
    const companyName = activeCompany === "default" ? "AJU ED SOLUTIONS" : `AJU ${activeCompany.charAt(0).toUpperCase() + activeCompany.slice(1)}`;
    const subject = encodeURIComponent(`Application for ${job.title} at ${companyName} - [Your Name]`);
    const body = encodeURIComponent(
      `Hello ${companyName} Team,\n\nI am writing to express my interest in the ${job.title} position as advertised on your website.\n\n` +
      `Experience: [Mention your years of experience]\n` +
      `Key Tools: ${job.tools.join(", ")}\n` +
      `Portfolio Link: [Link to your work/GitHub/Behance]\n` +
      `Current Location: [Your Location]\n\n` +
      `I have attached my resume for your review. Looking forward to hearing from you!\n\nBest regards,\n[Your Name]\n[Phone Number]`
    );

    try {
      await navigator.clipboard.writeText(email);
      setToastMessage("Email copied to clipboard! Opening mail client...");
    } catch (err) {
      setToastMessage("Opening mail client...");
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="careers"
      className="relative border-t py-28 overflow-hidden"
      style={{
        background: "#000",
        borderColor: "rgba(99,102,241,0.08)",
      }}
    >
      {/* Ambient glows */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 10% 20%, rgba(99,102,241,0.05) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(6,214,160,0.05) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-20">
          <motion.p
            variants={fadeUp(0, 12)}
            initial="hidden"
            whileInView="visible"
            viewport={VP}
            className="font-mono tracking-widest uppercase text-sm mb-5"
            style={{ color: "rgba(99,102,241,0.85)" }}
          >
            Careers
          </motion.p>
          <motion.h2
            variants={fadeUp(0.1, 28)}
            initial="hidden"
            whileInView="visible"
            viewport={VP}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
            style={{
              background: "linear-gradient(135deg, #eef2ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Join the Innovation
          </motion.h2>
          <motion.p
            variants={fadeUp(0.2, 20)}
            initial="hidden"
            whileInView="visible"
            viewport={VP}
            className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "rgba(176,190,220,0.85)" }}
          >
            At AJU ED SOLUTIONS, we empower creative minds to build the future of education and technology. 
            We are looking for passionate individuals who thrive on challenges and innovation.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {jobList.length > 0 ? (
            jobList.map((job, idx) => (
              <motion.div
                key={job.id}
                variants={fadeUp(0.3 + idx * 0.1, 32)}
                initial="hidden"
                whileInView="visible"
                viewport={VP}
                className="group relative overflow-hidden rounded-3xl p-8 sm:p-12"
                style={{
                  background: "linear-gradient(145deg, rgba(15,15,20,0.95), rgba(10,10,12,0.98))",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                }}
              >
                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${job.color}, transparent 70%)` }}
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Job Header */}
                  <div className="lg:col-span-5">
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: `${job.color}15`, border: `1px solid ${job.color}30`, color: job.color }}
                      >
                        {job.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{job.title}</h3>
                        <p className="text-sm text-indigo-300/70 font-medium tracking-wide uppercase">{job.type} • {job.location}</p>
                      </div>
                    </div>
                    <p className="text-indigo-100/60 text-sm leading-relaxed mb-8">
                      {job.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      {job.tools.map(tool => (
                        <span 
                          key={tool}
                          className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/5 bg-white/10 text-indigo-200/90"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleApply(job)}
                      className="group/btn relative px-8 py-4 rounded-2xl overflow-hidden transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto"
                      style={{ background: job.color }}
                    >
                      <span className="relative z-10 text-white font-bold uppercase tracking-widest text-xs">Apply via Email</span>
                      <ArrowRight className="relative z-10 text-white transition-transform duration-300 group-hover/btn:translate-x-1" size={16} />
                    </button>
                  </div>

                  {/* Right Column: Details */}
                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-white font-semibold mb-5 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        Requirements
                      </h4>
                      <ul className="space-y-3">
                        {job.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-indigo-100/50 leading-relaxed">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-5 flex items-center gap-2">
                        <Briefcase size={16} className="text-indigo-400" />
                        Desired Experience
                      </h4>
                      <p className="text-sm text-indigo-100/50 leading-relaxed">
                        {job.experience}
                      </p>
                      <div className="mt-8 p-5 rounded-2xl border border-white/5 bg-white/5">
                        <h5 className="text-white text-xs font-bold uppercase tracking-widest mb-2">Why Join Us?</h5>
                        <p className="text-[11px] text-indigo-100/40 leading-relaxed">
                          Flexible hours, cutting-edge tech stack, and a creative environment where your voice matters.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-indigo-200/50">No current openings for this branch. Check back soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Premium Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl flex items-center gap-3 border text-center whitespace-nowrap"
            style={{
              background: "rgba(10,10,12,0.92)",
              borderColor: "rgba(99,102,241,0.3)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.8), 0 0 15px rgba(99,102,241,0.2)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <p className="text-sm font-semibold text-white tracking-wide">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
