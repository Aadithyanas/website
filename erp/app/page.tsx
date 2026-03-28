"use client";
import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, ServerCog, CreditCard, LayoutDashboard, Zap, Shield, GitCommit, Network, Workflow, Lock } from "lucide-react";
import Link from "next/link";
import Workflow3D from "@/src/components/landing/Workflow3D";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  
  // Parallax scroll tracking for UI
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      {/* 3D Flow Background */}
      {mounted && <Workflow3D />}

      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-[#020202]/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <Workflow className="text-indigo-500" size={28} />
            <span className="text-white">OMNIS <span className="text-gray-500 font-medium">ERP</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-bold text-gray-400">
            <a href="#pipeline" className="hover:text-white transition-colors">The Pipeline</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/erp/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">Sign In</Link>
            <Link href="/erp/signup" className="text-sm font-bold bg-white text-black px-6 py-2.5 rounded-full hover:bg-gray-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Initialize
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-48 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse border border-indigo-300/50" />
              Omnis ERP v2.0 Live
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1]">
              The Essential ERP <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400">
                For Seamless Connections.
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-medium">
              Making teamwork incredibly easy. Omnis ERP is an interconnected mesh of Task Management, Automated Payroll, and Team Connectivity—all synchronized in real-time.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 z-20 relative">
              <Link href="/erp/dashboard" className="group w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-gray-100 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                Launch Workspace <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#pipeline" className="w-full sm:w-auto px-8 py-4 bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#222] hover:border-[#444] text-white rounded-full font-bold text-lg flex items-center justify-center transition-all hover:bg-[#111]">
                View The Pipeline
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Pipeline Workflow (Animated Scrolling Timeline) */}
      <section id="pipeline" className="relative z-10 py-32 bg-[#020202]">
        <div className="max-w-5xl mx-auto px-6 relative">
          
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">The Data Pipeline</h2>
            <p className="text-gray-400 text-xl font-medium">How smooth connections make work easy across the ERP.</p>
          </div>

          {/* Central Line */}
          <div className="absolute left-[28px] md:left-1/2 top-[250px] bottom-[100px] w-0.5 bg-gradient-to-b from-indigo-500 via-emerald-500 to-amber-500 opacity-20 hidden sm:block md:-translate-x-1/2 rounded-full" />

          <div className="flex flex-col gap-24 relative">
            
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full"
            >
              <div className="w-full md:w-1/2 md:text-right">
                <div className="inline-block p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-6 text-indigo-400">
                  <LayoutDashboard size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-4">1. Task Connections</h3>
                <p className="text-gray-400 text-lg leading-relaxed">Admins and Leaders cleanly inject new objectives into active Sprints. Omnis ERP immediately allocates the proper team connections, removing all the friction of management.</p>
              </div>
              <div className="hidden md:flex relative w-12 h-12 bg-[#0a0a0a] border-4 border-[#020202] rounded-full z-10 items-center justify-center shrink-0">
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(79,70,229,1)]" />
              </div>
              <div className="w-full md:w-1/2 p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />
                <div className="flex items-center gap-3 mb-4 opacity-50"><GitCommit size={16} /> <span className="text-xs font-mono uppercase">Sprint // Alpha</span></div>
                <div className="h-4 w-3/4 bg-[#1a1a1a] rounded-full mb-3" />
                <div className="h-4 w-1/2 bg-[#1a1a1a] rounded-full" />
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 w-full"
            >
              <div className="w-full md:w-1/2">
                <div className="inline-block p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-6 text-emerald-400">
                  <Network size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-4">2. Real-Time Network Sync</h3>
                <p className="text-gray-400 text-lg leading-relaxed">The instant a task node changes state, our WebSocket mesh updates everyone seamlessly. No manual refreshing, just pure instant connectivity between departments.</p>
              </div>
              <div className="hidden md:flex relative w-12 h-12 bg-[#0a0a0a] border-4 border-[#020202] rounded-full z-10 items-center justify-center shrink-0">
                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,1)]" />
              </div>
              <div className="w-full md:w-1/2 p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl relative">
                 <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
                 <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between p-3 bg-[#111] rounded-xl border border-[#222]"><div className="w-8 h-8 rounded-full bg-emerald-500/20" /><div className="w-24 h-2 bg-[#222] rounded-full" /></div>
                   <div className="flex items-center justify-between p-3 bg-[#111] rounded-xl border border-[#222]"><div className="w-8 h-8 rounded-full bg-indigo-500/20" /><div className="w-16 h-2 bg-[#222] rounded-full" /></div>
                 </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full"
            >
              <div className="w-full md:w-1/2 md:text-right">
                <div className="inline-block p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-6 text-amber-400">
                  <CreditCard size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-4">3. Automated Payroll Integrations</h3>
                <p className="text-gray-400 text-lg leading-relaxed">At month-end, Omnis ERP collates connected attendance data, deducts leaves automatically, and handles 1-click bulk disbursements securely via the Razorpay API.</p>
              </div>
              <div className="hidden md:flex relative w-12 h-12 bg-[#0a0a0a] border-4 border-[#020202] rounded-full z-10 items-center justify-center shrink-0">
                <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(245,158,11,1)]" />
              </div>
              <div className="w-full md:w-1/2 p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-amber-500/5 pointer-events-none" />
                <div className="text-center">
                  <div className="text-4xl font-mono text-white mb-2">$14,230.00</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-500">Processing Direct Deposit</div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-32 bg-[#050505] border-t border-[#111]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Structured For Scale</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-xl">Deploy Omnis ERP instantly without negotiating with salespeople.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            {/* Base Tier */}
            <div className="p-10 bg-[#0a0a0a] border border-[#1a1a1a] rounded-[2rem] hover:border-[#333] transition-colors">
              <h3 className="text-xl font-bold text-gray-400 mb-2">Starter Node</h3>
              <div className="text-4xl font-black mb-6">Free<span className="text-lg text-gray-500 font-medium tracking-normal"> / 30 Days</span></div>
              <ul className="flex flex-col gap-4 mb-10 text-sm text-gray-300">
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-indigo-500"/> Connect up to 5 Members</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-indigo-500"/> Standard Agile Boards</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-indigo-500"/> Native Authentication</li>
                <li className="flex items-center gap-3 text-gray-600"><Lock size={16} /> Payroll & Finances Locked</li>
                <li className="flex items-center gap-3 text-gray-600"><Lock size={16} /> Read-only API</li>
              </ul>
              <Link href="/erp/signup" className="block w-full text-center py-4 bg-[#111] hover:bg-[#222] border border-[#333] rounded-2xl font-bold transition-all hover:scale-[1.02]">Initialize Trial</Link>
            </div>

            {/* Core Iteration */}
            <div className="p-10 bg-gradient-to-br from-[#0f101f] to-[#0a0f12] border border-indigo-500/40 rounded-[2.5rem] relative transform md:-translate-y-8 shadow-[0_0_80px_rgba(79,70,229,0.15)] ring-1 ring-white/5">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">Omnis Prime</div>
              <h3 className="text-xl font-bold text-indigo-400 mb-2">Operational Sync</h3>
              <div className="text-5xl font-black mb-6">$49<span className="text-xl text-gray-500 font-medium tracking-normal"> / mo</span></div>
              <ul className="flex flex-col gap-5 mb-10 text-sm md:text-base text-gray-200">
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-indigo-400"/> Up to 50 Connected Users</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-indigo-400"/> Unlocked Payroll Engine</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-indigo-400"/> 1-Click Razorpay Disbursements</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-indigo-400"/> Advanced Role Permissions</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-indigo-400"/> Full WebSocket Architecture</li>
              </ul>
              <Link href="/erp/signup" className="block w-full text-center py-4 bg-white text-black hover:bg-gray-100 rounded-2xl font-black transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(255,255,255,0.15)]">Upgrade Protocol</Link>
            </div>

            {/* Enterprise Tier */}
            <div className="p-10 bg-[#0a0a0a] border border-[#1a1a1a] rounded-[2rem] hover:border-[#333] transition-colors">
              <h3 className="text-xl font-bold text-gray-400 mb-2">Enterprise Mesh</h3>
              <div className="text-4xl font-black mb-6">$199<span className="text-lg text-gray-500 font-medium tracking-normal"> / yr</span></div>
              <ul className="flex flex-col gap-4 mb-10 text-sm text-gray-300">
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500"/> Unlimited Seat Count</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500"/> Everything in Prime</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500"/> Custom Storage Buckets</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500"/> Priority 24/7 Server SLA</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500"/> Custom Single Sign-On (SSO)</li>
              </ul>
              <Link href="mailto:contact@ajued.com" className="block w-full text-center py-4 bg-[#111] hover:bg-[#222] border border-[#333] rounded-2xl font-bold transition-all hover:scale-[1.02]">Contact Architects</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] bg-[#000] py-16 text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-6">
           <Workflow className="text-indigo-500" size={24} />
           <span className="text-xl font-black">OMNIS <span className="text-gray-500 font-medium">ERP</span></span>
        </div>
        <p className="text-sm font-semibold text-gray-600">&copy; {new Date().getFullYear()} Omnis Software Systems. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

// Quick helper
function XCircleIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
