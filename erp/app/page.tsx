"use client";
import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, ServerCog, CreditCard, LayoutDashboard, Zap, Shield, HelpCircle } from "lucide-react";
import Link from "next/link";
import ThreeBackground from "@/src/components/landing/ThreeBackground";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* 3D Background */}
      {mounted && <ThreeBackground />}

      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
            <ServerCog className="text-indigo-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">AJU ERP</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-bold text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/erp/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">Login</Link>
            <Link href="/erp/signup" className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-gray-200 transition-transform active:scale-95 shadow-lg shadow-white/10">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse border border-white/20"/>
              The Next Evolution of Enterprise Management
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
              Unify Your Workforce, <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
                Automate Your Growth.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium">
              A deeply integrated ERP built for speed. Connect your agile task workflows, real-time team management, and automated Razorpay payroll in one beautifully dark, highly performant hub.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/erp/dashboard" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                Launch Workspace <ArrowRight size={18} />
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#333] text-white rounded-full font-bold text-base flex items-center justify-center transition-all hover:scale-105 active:scale-95">
                Explore Features
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="relative z-10 py-32 bg-[#000] border-t border-[#111]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Built for scale. Designed for speed.</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Our ERP drops the archaic corporate bloat. Experience seamless WebSockets, Instant Syncing, and incredibly intuitive UI for modern tech teams.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-3xl hover:border-[#333] transition-colors group">
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Agile Task Management</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Break down complex projects into granular tasks. Assign teams, define Sprints, manage status pipelines (QA, Review, To Do), and discuss directly on task cards with rich media uploads.</p>
            </div>

            <div className="p-8 bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-3xl hover:border-[#333] transition-colors group">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <CreditCard size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Automated Payroll System</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Instantly calculate net take-home salary subtracting algorithmic leave deductions. Disburse hundreds of secure multi-currency payments in one click using our deep Razorpay integration.</p>
            </div>

            <div className="p-8 bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-3xl hover:border-[#333] transition-colors group">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant WebSocket Sync</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Say goodbye to refreshing pages. Every task shift, status change, and paycheck clearance propagates instantly across every machine in your entire organization via WebSockets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Pick the plan that scales perfectly with your operational needs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="p-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl">
              <h3 className="text-xl font-bold text-gray-400 mb-2">Starter Trial</h3>
              <div className="text-4xl font-black mb-6">Free<span className="text-lg text-gray-500 font-medium"> / 1st month</span></div>
              <ul className="flex flex-col gap-4 mb-8 text-sm text-gray-300">
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-indigo-500"/> Up to 5 Team Members</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-indigo-500"/> Standard Task Boards</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-indigo-500"/> Basic Notifications</li>
                <li className="flex items-center gap-3 text-gray-600"><XCircleIcon /> Payroll Automation Access</li>
                <li className="flex items-center gap-3 text-gray-600"><XCircleIcon /> WebSockets Real-time</li>
              </ul>
              <Link href="/erp/signup" className="block w-full text-center py-3 bg-[#111] hover:bg-[#222] border border-[#333] rounded-xl font-bold transition-colors">Start Trial</Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-2 border-indigo-500/50 rounded-3xl relative transform md:-translate-y-4 shadow-[0_0_50px_rgba(79,70,229,0.1)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">Most Popular</div>
              <h3 className="text-xl font-bold text-indigo-400 mb-2">Pro Core</h3>
              <div className="text-4xl font-black mb-6">$49<span className="text-lg text-gray-500 font-medium"> / month</span></div>
              <ul className="flex flex-col gap-4 mb-8 text-sm text-gray-300">
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-400"/> Up to 50 Team Members</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-400"/> Full Access to Payroll</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-400"/> Razorpay One-Click Pay</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-400"/> Role-based Access Levels</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-400"/> Full WebSocket Connectivity</li>
              </ul>
              <Link href="/erp/signup" className="block w-full text-center py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors text-white shadow-lg shadow-indigo-500/30">Get Pro</Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl">
              <h3 className="text-xl font-bold text-gray-400 mb-2">Enterprise Scale</h3>
              <div className="text-4xl font-black mb-6">$199<span className="text-lg text-gray-500 font-medium"> / year</span></div>
              <ul className="flex flex-col gap-4 mb-8 text-sm text-gray-300">
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-indigo-500"/> Unlimited Members</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-indigo-500"/> Everything in Pro</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-indigo-500"/> Custom Cloud Storage</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-indigo-500"/> Priority 24/7 SLA Support</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-indigo-500"/> White-labeled Domains</li>
              </ul>
              <Link href="mailto:contact@ajued.com" className="block w-full text-center py-3 bg-[#111] hover:bg-[#222] border border-[#333] rounded-xl font-bold transition-colors">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] bg-[#000] py-12 text-center text-sm font-semibold text-gray-600">
        <p>&copy; {new Date().getFullYear()} AJU Ed Solutions. All Rights Reserved. Transforming operational logistics for modern teams.</p>
      </footer>
    </div>
  );
}

// Quick helper
function XCircleIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
