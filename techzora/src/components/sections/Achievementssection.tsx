"use client";

import React from "react";
import { Briefcase, Users, Award, Clock } from "lucide-react";

const STATS = [
  { value: "150+", label: "Projects Delivered", icon: <Briefcase className="inline w-4 h-4 mr-1 text-cyan-400" /> },
  { value: "50+",  label: "Educational Partners", icon: <Users className="inline w-4 h-4 mr-1 text-cyan-400" /> },
  { value: "100+", label: "Workshops Conducted", icon: <Award className="inline w-4 h-4 mr-1 text-cyan-400" /> },
  { value: "10+",  label: "Years Experience", icon: <Clock className="inline w-4 h-4 mr-1 text-cyan-400" /> },
];

export const AchievementsSection = () => (
  <section
    id="achievements"
    className="py-20 bg-[#060606] text-white border-t border-white/5 relative overflow-hidden"
  >
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-cyan-900/20 blur-[120px] pointer-events-none" />

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {STATS.map((s, i) => (
          <div key={i}>
            <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 mb-2 drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              {s.value}
            </h3>
            <p className="text-gray-400 font-mono text-sm uppercase">
              {s.icon}
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);