"use client";

import React, { useState, useEffect } from "react";
import Nav from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import { CompanyProvider } from "@/src/components/sections/Index";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Products3DPage() {
  // Preset Customization State (Only for Custom Name Plate)
  const [activeCustomize, setActiveCustomize] = useState<string | null>(null);
  const [presetComment, setPresetComment] = useState("");
  const [generatedLinks, setGeneratedLinks] = useState<{ [key: string]: string }>({});
  const [originUrl, setOriginUrl] = useState("");

  // Regular Order State (For items without text customization)
  const [showOrderFor, setShowOrderFor] = useState<string | null>(null);

  // Tab State
  const [activeCategory, setActiveCategory] = useState<"preset" | "custom">("preset");

  useEffect(() => {
    setOriginUrl(window.location.origin);
  }, []);

  const handleSavePresetCustomization = (itemName: string) => {
    if (!presetComment.trim()) return;
    
    const url = `${originUrl}/3dproducts/order?item=${encodeURIComponent(itemName)}&comment=${encodeURIComponent(presetComment)}`;
    
    setGeneratedLinks(prev => ({ ...prev, [itemName]: url }));
    setActiveCustomize(null); // Close the customization box
    setPresetComment(""); // Reset comment
  };

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
                Explore our high-quality 3D printed models, from articulated figures to custom-designed pieces.
              </p>
            </motion.div>

            {/* Category Tabs */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex bg-white/5 border border-white/10 p-1 rounded-full">
                <button 
                  onClick={() => setActiveCategory("preset")}
                  className={`px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 ${activeCategory === "preset" ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]" : "text-slate-400 hover:text-white"}`}
                >
                  Preset Models
                </button>
                <button 
                  onClick={() => setActiveCategory("custom")}
                  className={`px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 ${activeCategory === "custom" ? "bg-pink-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)]" : "text-slate-400 hover:text-white"}`}
                >
                  Custom Models
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeCategory === "preset" && (
                <motion.div 
                  key="preset"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-20"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {/* Product Card 1: Articulated Cobra */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/50 transition-all duration-300 group flex flex-col items-center text-center overflow-hidden hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Full Width Image Container */}
                  <div className="relative w-full aspect-[4/3] mb-6 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                    <Image src="/images/products/3d_cobra.png" alt="Articulated Cobra" fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/40 to-transparent flex items-end justify-center pb-4">
                      <span className="text-xs font-mono tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity text-amber-200 drop-shadow-md">3D Print: Cobra</span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="px-6 pb-6 flex flex-col flex-grow items-center relative z-10 w-full">
                    <h3 className="text-xl font-bold mb-2">Articulated Cobra</h3>
                    <p className="text-slate-400 text-sm mb-6 flex-grow">A highly detailed, fully articulated 3D printed cobra in a stunning tan and gold filament. Flexible and realistic.</p>
                    
                    {/* Ordering Options */}
                    <div className="w-full mt-auto space-y-4">
                      {showOrderFor === "Articulated Cobra" ? (
                        <div className="w-full bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 text-left">
                          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">How to Order</p>
                          <p className="text-slate-300 text-sm">DM the model name <strong className="text-white">"Articulated Cobra"</strong> to our WhatsApp number <strong className="text-white">+91 9876543210</strong>.</p>
                          <button onClick={() => setShowOrderFor(null)} className="mt-3 text-xs text-emerald-400/70 hover:text-emerald-400 underline uppercase tracking-wider font-bold">Close</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowOrderFor("Articulated Cobra")} 
                          className="w-full px-8 py-3 rounded-full text-sm font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all duration-300 uppercase tracking-wider"
                        >
                          Order Preset
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Product Card 2: Articulated Python */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-300 group flex flex-col items-center text-center overflow-hidden hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Full Width Image Container */}
                  <div className="relative w-full aspect-[4/3] mb-6 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                    <Image src="/images/products/3d_python.png" alt="Articulated Python" fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/40 to-transparent flex items-end justify-center pb-4">
                      <span className="text-xs font-mono tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity text-blue-200 drop-shadow-md">3D Print: Python</span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="px-6 pb-6 flex flex-col flex-grow items-center relative z-10 w-full">
                    <h3 className="text-xl font-bold mb-2">Articulated Python</h3>
                    <p className="text-slate-400 text-sm mb-6 flex-grow">A massive, dynamically poseable articulated python printed with a mesmerizing blue-to-purple gradient filament.</p>
                    
                    {/* Ordering Options */}
                    <div className="w-full mt-auto space-y-4">
                      {showOrderFor === "Articulated Python" ? (
                        <div className="w-full bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 text-left">
                          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">How to Order</p>
                          <p className="text-slate-300 text-sm">DM the model name <strong className="text-white">"Articulated Python"</strong> to our WhatsApp number <strong className="text-white">+91 9876543210</strong>.</p>
                          <button onClick={() => setShowOrderFor(null)} className="mt-3 text-xs text-emerald-400/70 hover:text-emerald-400 underline uppercase tracking-wider font-bold">Close</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowOrderFor("Articulated Python")} 
                          className="w-full px-8 py-3 rounded-full text-sm font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 uppercase tracking-wider"
                        >
                          Order Preset
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Product Card 3: Articulated Dragon */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative rounded-3xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-all duration-300 group flex flex-col items-center text-center overflow-hidden hover:shadow-[0_0_40px_rgba(34,197,94,0.15)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Full Width Image Container */}
                  <div className="relative w-full aspect-[4/3] mb-6 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                    <Image src="/images/products/3d_dragon.png" alt="Articulated Dragon Skeleton" fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/40 to-transparent flex items-end justify-center pb-4">
                      <span className="text-xs font-mono tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity text-green-200 drop-shadow-md">3D Print: Dragon</span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="px-6 pb-6 flex flex-col flex-grow items-center relative z-10 w-full">
                    <h3 className="text-xl font-bold mb-2">Neon Dragon Skeleton</h3>
                    <p className="text-slate-400 text-sm mb-6 flex-grow">A striking neon green articulated dragon skeleton. Handheld size with intricate bones and joints.</p>
                    
                    {/* Ordering Options */}
                    <div className="w-full mt-auto space-y-4">
                      {showOrderFor === "Neon Dragon Skeleton" ? (
                        <div className="w-full bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 text-left">
                          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">How to Order</p>
                          <p className="text-slate-300 text-sm">DM the model name <strong className="text-white">"Neon Dragon Skeleton"</strong> to our WhatsApp number <strong className="text-white">+91 9876543210</strong>.</p>
                          <button onClick={() => setShowOrderFor(null)} className="mt-3 text-xs text-emerald-400/70 hover:text-emerald-400 underline uppercase tracking-wider font-bold">Close</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowOrderFor("Neon Dragon Skeleton")} 
                          className="w-full px-8 py-3 rounded-full text-sm font-bold bg-green-500/10 text-green-300 border border-green-500/30 hover:bg-green-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all duration-300 uppercase tracking-wider"
                        >
                          Order Preset
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Product Card 4: Articulated Gecko */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="relative rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 group flex flex-col items-center text-center overflow-hidden hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Full Width Image Container */}
                  <div className="relative w-full aspect-[4/3] mb-6 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                    <Image src="/images/products/3d_gecko.png" alt="Articulated Gecko" fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/40 to-transparent flex items-end justify-center pb-4">
                      <span className="text-xs font-mono tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity text-cyan-200 drop-shadow-md">3D Print: Gecko</span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="px-6 pb-6 flex flex-col flex-grow items-center relative z-10 w-full">
                    <h3 className="text-xl font-bold mb-2">Articulated Gecko</h3>
                    <p className="text-slate-400 text-sm mb-6 flex-grow">A vibrant, multi-colored articulated gecko that is incredibly fun to pose and play with.</p>
                    
                    {/* Ordering Options */}
                    <div className="w-full mt-auto space-y-4">
                      {showOrderFor === "Articulated Gecko" ? (
                        <div className="w-full bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 text-left">
                          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">How to Order</p>
                          <p className="text-slate-300 text-sm">DM the model name <strong className="text-white">"Articulated Gecko"</strong> to our WhatsApp number <strong className="text-white">+91 9876543210</strong>.</p>
                          <button onClick={() => setShowOrderFor(null)} className="mt-3 text-xs text-emerald-400/70 hover:text-emerald-400 underline uppercase tracking-wider font-bold">Close</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowOrderFor("Articulated Gecko")} 
                          className="w-full px-8 py-3 rounded-full text-sm font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all duration-300 uppercase tracking-wider"
                        >
                          Order Preset
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Product Card 5: Articulated Scorpion */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="relative rounded-3xl bg-white/5 border border-white/10 hover:border-red-500/50 transition-all duration-300 group flex flex-col items-center text-center overflow-hidden hover:shadow-[0_0_40px_rgba(239,68,68,0.15)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Full Width Image Container */}
                  <div className="relative w-full aspect-[4/3] mb-6 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                    <Image src="/images/products/3d_scorpion.png" alt="Articulated Scorpion" fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/40 to-transparent flex items-end justify-center pb-4">
                      <span className="text-xs font-mono tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity text-red-200 drop-shadow-md">3D Print: Scorpion</span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="px-6 pb-6 flex flex-col flex-grow items-center relative z-10 w-full">
                    <h3 className="text-xl font-bold mb-2">Articulated Scorpion</h3>
                    <p className="text-slate-400 text-sm mb-6 flex-grow">A highly detailed mechanical scorpion with dark metallic and red filament. Menacing and flexible.</p>
                    
                    {/* Ordering Options */}
                    <div className="w-full mt-auto space-y-4">
                      {showOrderFor === "Articulated Scorpion" ? (
                        <div className="w-full bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 text-left">
                          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">How to Order</p>
                          <p className="text-slate-300 text-sm">DM the model name <strong className="text-white">"Articulated Scorpion"</strong> to our WhatsApp number <strong className="text-white">+91 9876543210</strong>.</p>
                          <button onClick={() => setShowOrderFor(null)} className="mt-3 text-xs text-emerald-400/70 hover:text-emerald-400 underline uppercase tracking-wider font-bold">Close</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowOrderFor("Articulated Scorpion")} 
                          className="w-full px-8 py-3 rounded-full text-sm font-bold bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300 uppercase tracking-wider"
                        >
                          Order Preset
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>

                  </div>
                </motion.div>
              )}
              
              {activeCategory === "custom" && (
                <motion.div 
                  key="custom"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-20"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Product Card 6: 3D Custom Name Plate (Text Customization) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="relative rounded-3xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-all duration-300 group flex flex-col items-center text-center overflow-hidden hover:shadow-[0_0_40px_rgba(236,72,153,0.15)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Full Width Image Container */}
                  <div className="relative w-full aspect-[4/3] mb-6 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                    <Image src="/images/products/3d_nameplate.png" alt="3D Custom Name Plate" fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/40 to-transparent flex items-end justify-center pb-4">
                      <span className="text-xs font-mono tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity text-pink-200 drop-shadow-md">3D Print: Name Plate</span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="px-6 pb-6 flex flex-col flex-grow items-center relative z-10 w-full">
                    <h3 className="text-xl font-bold mb-2">Custom 3D Name Plate</h3>
                    <p className="text-slate-400 text-sm mb-6 flex-grow">A beautiful 3D printed cursive name plate. Perfect for your desk, bedroom, or as a personalized gift.</p>
                    
                    {/* Customization Options (Exclusive to this product) */}
                    <div className="w-full mt-auto space-y-4">
                      <AnimatePresence>
                        {activeCustomize === "Custom Name Plate" && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full bg-black/40 p-4 rounded-xl border border-pink-500/30 text-left"
                          >
                            <label className="block text-xs uppercase tracking-widest text-pink-200/80 mb-2">Enter Name & Color</label>
                            <textarea 
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 transition-colors mb-3"
                              placeholder="Name: Anna, Color: Red..."
                              rows={2}
                              value={presetComment}
                              onChange={(e) => setPresetComment(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <button onClick={() => setActiveCustomize(null)} className="flex-1 px-4 py-2 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 transition-colors uppercase">
                                Cancel
                              </button>
                              <button onClick={() => handleSavePresetCustomization("Custom Name Plate")} className="flex-1 px-4 py-2 rounded-lg text-xs font-bold bg-pink-600 text-white hover:bg-pink-500 transition-colors uppercase">
                                Generate Link
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {generatedLinks["Custom Name Plate"] && (
                        <div className="w-full bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 text-left">
                          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Link Generated!</p>
                          <p className="text-slate-300 text-sm mb-3">DM this link to our WhatsApp number <strong className="text-white">+91 9876543210</strong> to process your order.</p>
                          <div className="bg-black/50 p-2 rounded text-xs text-blue-300 break-all border border-blue-500/20 font-mono">
                            {generatedLinks["Custom Name Plate"]}
                          </div>
                        </div>
                      )}

                      {!activeCustomize && !generatedLinks["Custom Name Plate"] && (
                        <button 
                          onClick={() => { setActiveCustomize("Custom Name Plate"); setPresetComment(""); }} 
                          className="w-full px-8 py-3 rounded-full text-sm font-bold bg-pink-500/10 text-pink-300 border border-pink-500/30 hover:bg-pink-500 hover:text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all duration-300 uppercase tracking-wider"
                        >
                          Customize & Order
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        <Footer />
      </main>
    </CompanyProvider>
  );
}
