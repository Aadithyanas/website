"use client";

import React from "react";
import { Mail, Phone } from "lucide-react";

export const ContactSection = () => (
  <section
    id="contact"
    className="py-24 bg-[#030303] text-white relative border-t border-white/5"
  >
    <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row gap-16">

      {/* Left */}
      <div className="md:w-1/2">
        <h2 className="text-cyan-400 font-mono tracking-widest uppercase mb-4 text-sm">
          Engage Protocols
        </h2>
        <h3 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h3>
        <p className="text-gray-400 text-lg mb-10">
          Reach out to us to start building the future, together.
        </p>

        <div className="space-y-6">
          <div className="flex items-center gap-4 text-gray-300">
            <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 text-cyan-400">
              <Mail size={24} />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-mono mb-1">EMAIL</div>
              <div className="font-medium text-cyan-100">
                <a href="mailto:info@ajuedsolutions.com" className="hover:text-cyan-400">
                  info@ajuedsolutions.com
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-300">
            <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 text-cyan-400">
              <Phone size={24} />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-mono mb-1">PHONE</div>
              <div className="font-medium text-cyan-100">
                <a href="tel:+918301973970" className="hover:text-cyan-400">
                  +91 8301 973 970
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="md:w-1/2">
        <div className="bg-white/[0.02] border border-white/10 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />

          <form
            className="relative z-10 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Form submitted successfully!");
            }}
          >
            <input
              type="text"
              placeholder="Your Name"
              required
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors w-full text-white"
            />
            <input
              type="email"
              placeholder="Your Email"
              required
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors w-full text-white"
            />
            <textarea
              placeholder="Your Message"
              required
              rows={4}
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors w-full resize-none text-white"
            />

            <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-xl p-4 flex gap-4 items-center">
              <span className="font-mono text-xl tracking-[0.2em] font-bold text-cyan-400 select-none">
                AJU3D
              </span>
              <input
                type="text"
                placeholder="Enter CAPTCHA"
                required
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 flex-grow focus:outline-none focus:border-cyan-500/50 transition-colors text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all uppercase text-sm mt-4"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
);