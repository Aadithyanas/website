"use client";

import Nav from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import {
  AboutSection,
  ServicesSection,
  ContactSection,
  CompanyProvider 
} from "@/src/components/sections/Index";
import { motion } from "framer-motion";
import { Palette, TrendingUp, Megaphone, Share2, Target } from "lucide-react";

export default function BrandifyPage() {
  return (
    <CompanyProvider initialCompany="brandify">
      <main className="min-h-screen" style={{ background: "#000", color: "#eef2ff" }}>
        <Nav />
        
        {/* Premium Hero Section for Brandify */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-600/10 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono tracking-widest uppercase mb-6"
                >
                  <Palette size={14} />
                  Creative Studio
                </motion.div>
                
                <motion.img
                  src="/images/brands/brandify.png"
                  alt="AJU Brandify"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="w-80 sm:w-[28rem] md:w-[36rem] lg:w-[48rem] object-contain mb-8 mx-auto lg:mx-0"
                  style={{
                    filter: "drop-shadow(0 0 40px rgba(6,214,160,0.4))",
                  }}
                />
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed"
                >
                  Crafting unique brand identities and digital growth strategies that make your business stand out and thrive in the modern market.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-wrap justify-center lg:justify-start gap-4"
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium">
                    <TrendingUp size={16} className="text-emerald-400" />
                    Growth
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium">
                    <Megaphone size={16} className="text-emerald-400" />
                    Marketing
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium">
                    <Target size={16} className="text-emerald-400" />
                    Strategy
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 relative"
              >
                <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full animate-pulse" />
                  <img 
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80" 
                    alt="Branding Excellence" 
                    className="relative z-10 w-full h-full object-cover rounded-3xl border border-white/10 shadow-2xl"
                  />
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl animate-bounce" />
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-teal-500/20 rounded-full blur-xl" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <AboutSection />
        
        <div className="py-20 bg-gradient-to-b from-black to-emerald-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <Palette size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4">Brand Identity</h3>
                <p className="text-slate-400 leading-relaxed">
                  Logos, typography, and visual languages that define your company&apos;s core values and presence.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <Megaphone size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4">Digital Marketing</h3>
                <p className="text-slate-400 leading-relaxed">
                  Data-driven campaigns across social media and search engines to maximize your reach and ROI.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <Share2 size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4">Content Strategy</h3>
                <p className="text-slate-400 leading-relaxed">
                  Engaging content and storytelling that builds community and keeps your audience coming back.
                </p>
              </div>
            </div>
          </div>
        </div>

        <ServicesSection />
        <ContactSection />
        <Footer />
      </main>
    </CompanyProvider>
  );
}
