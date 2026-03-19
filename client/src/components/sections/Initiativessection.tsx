"use client";

import React from "react";
import { Network, Bot, Lightbulb, SearchCode, Zap, Rocket } from "lucide-react";

const INITIATIVES = [
  {
    title: "Smart Classrooms & IoT Labs",
    desc: "Transforming learning spaces into AI-powered, sensor-enabled smart environments for immersive education.",
    icon: <Network />,
  },
  {
    title: "Low-Cost Robotics & Automation",
    desc: "Hands-on robotics kits for students to explore automation, design thinking, and real-world problem solving.",
    icon: <Bot />,
  },
  {
    title: "AI & Machine Intelligence",
    desc: "Predictive analytics, computer vision, and AI-driven applications that give students futuristic problem-solving skills.",
    icon: <Lightbulb />,
  },
  {
    title: "Digital Skill Acceleration",
    desc: "Upskilling in cloud, coding, data analytics, and cyber-physical systems for future tech careers.",
    icon: <SearchCode />,
  },
  {
    title: "IoT & Embedded Systems",
    desc: "Hands-on experience with microcontrollers, ESP32, Arduino, and smart sensor networks for real-world IoT solutions.",
    icon: <Zap />,
  },
  {
    title: "Robotics Competitions & Hackathons",
    desc: "Challenging students to innovate, build, and compete with tech solutions that shape tomorrow's world.",
    icon: <Rocket />,
  },
];

export const InitiativesSection = () => (
  <section
    id="initiatives"
    className="py-24 bg-[#030303] text-white relative border-t border-white/5"
  >
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-purple-400 font-mono tracking-widest uppercase mb-4 text-sm">
          Future-Ready
        </h2>
        <h3 className="text-4xl md:text-5xl font-bold">Initiatives</h3>
        <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
          Pioneering the next generation of AI, IoT, Robotics, and Digital
          Education to empower innovators, creators, and tech enthusiasts.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INITIATIVES.map((item, i) => (
          <div
            key={i}
            className="group p-6 bg-black border border-white/10 rounded-2xl hover:bg-white/[0.02] hover:border-cyan-500/50 transition-all"
          >
            <div className="text-cyan-400 mb-4 bg-cyan-900/20 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h4 className="text-lg font-bold mb-2 text-white group-hover:text-cyan-300 transition-colors">
              {item.title}
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);