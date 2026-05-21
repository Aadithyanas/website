"use client";

import Nav from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import { CompanyProvider } from "@/src/components/sections/Index";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Products3DPage() {
  return (
    <CompanyProvider initialCompany="techzora">
      <main className="min-h-screen flex flex-col" style={{ background: "#000", color: "#eef2ff" }}>
        <Nav />
        
        <div className="flex-grow pt-32 pb-20 bg-gradient-to-b from-black to-indigo-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <p className="font-mono tracking-widest uppercase text-sm mb-4" style={{ color: "rgba(99,102,241,0.85)" }}>
                Techzora Exclusive
              </p>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
                style={{
                  background: "linear-gradient(135deg, #eef2ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                3D Products
              </h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                Explore our cutting-edge 3D products and hardware solutions, designed exclusively by AJU Techzora.
              </p>
            </motion.div>

            {/* 3D Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Product Card 1: Mini Robot */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 group flex flex-col items-center text-center overflow-hidden hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Full Width Image Container */}
                <div className="relative w-full aspect-[4/3] mb-6 flex flex-col items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                  <Image src="/images/products/mini_robot.png" alt="Mini Robot" fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Bottom Gradient Fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/40 to-transparent flex items-end justify-center pb-4">
                    <span className="text-xs font-mono tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity text-indigo-200 drop-shadow-md">3D Model: Mini Robot</span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="px-6 pb-6 flex flex-col flex-grow items-center relative z-10 w-full">
                  <h3 className="text-xl font-bold mb-2">Mini Robot</h3>
                  <p className="text-slate-400 text-sm mb-6 flex-grow">A compact, agile, and fully programmable mini robot designed for dynamic tech explorations and learning.</p>
                  <button className="mt-auto px-8 py-3 rounded-full text-sm font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300 w-full uppercase tracking-wider">
                    View 3D Model
                  </button>
                </div>
              </motion.div>

              {/* Product Card 2: Robotic Arm */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 group flex flex-col items-center text-center overflow-hidden hover:shadow-[0_0_40px_rgba(6,214,160,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Full Width Image Container */}
                <div className="relative w-full aspect-[4/3] mb-6 flex flex-col items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                  <Image src="/images/products/robotic_arm.png" alt="Robotic Arm" fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Bottom Gradient Fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/40 to-transparent flex items-end justify-center pb-4">
                    <span className="text-xs font-mono tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity text-cyan-200 drop-shadow-md">3D Model: Robotic Arm</span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="px-6 pb-6 flex flex-col flex-grow items-center relative z-10 w-full">
                  <h3 className="text-xl font-bold mb-2">Robotic Arm</h3>
                  <p className="text-slate-400 text-sm mb-6 flex-grow">High-precision articulated robotic arm for automated assembly, prototyping, and intricate operations.</p>
                  <button className="mt-auto px-8 py-3 rounded-full text-sm font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(6,214,160,0.5)] transition-all duration-300 w-full uppercase tracking-wider">
                    View 3D Model
                  </button>
                </div>
              </motion.div>

              {/* Product Card 3: Iron Man Heart / Arc Reactor */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative rounded-3xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-all duration-300 group flex flex-col items-center text-center overflow-hidden hover:shadow-[0_0_40px_rgba(244,114,182,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Full Width Image Container */}
                <div className="relative w-full aspect-[4/3] mb-6 flex flex-col items-center justify-center text-pink-400 group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                  <Image src="/images/products/cyber_heart.png" alt="Cybernetic Heart" fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Bottom Gradient Fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/40 to-transparent flex items-end justify-center pb-4">
                    <span className="text-xs font-mono tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity text-pink-200 drop-shadow-md">3D Model: Arc Core</span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="px-6 pb-6 flex flex-col flex-grow items-center relative z-10 w-full">
                  <h3 className="text-xl font-bold mb-2">Cybernetic Heart</h3>
                  <p className="text-slate-400 text-sm mb-6 flex-grow">A futuristic, Iron Man-inspired energy core replica. Highly detailed 3D model with glowing emission nodes.</p>
                  <button className="mt-auto px-8 py-3 rounded-full text-sm font-bold bg-pink-500/10 text-pink-300 border border-pink-500/30 hover:bg-pink-500 hover:text-white hover:shadow-[0_0_20px_rgba(244,114,182,0.5)] transition-all duration-300 w-full uppercase tracking-wider">
                    View 3D Model
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </CompanyProvider>
  );
}
