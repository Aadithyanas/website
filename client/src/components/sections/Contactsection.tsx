"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Phone, Send, CheckCircle2, AlertCircle,
  Loader2, MapPin, Clock, ArrowRight,
} from "lucide-react";

// ── Motion config ─────────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;
const VP   = { once: true, amount: 0.12 };

const fadeUp = (delay = 0, distance = 28) => ({
  hidden:  { opacity: 0, y: distance, filter: "blur(6px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.8, delay, ease: EASE },
  },
});

const fadeIn = (delay = 0) => ({
  hidden:  { opacity: 0, scale: 0.94, filter: "blur(6px)" },
  visible: {
    opacity: 1, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.7, delay, ease: EASE },
  },
});

// ── Shared input style ────────────────────────────────────────────────────────
const inputCls = [
  "w-full rounded-xl px-4 py-3 text-sm text-white",
  "placeholder:text-gray-600",
  "focus:outline-none transition-all duration-300",
].join(" ");

type Status = "idle" | "loading" | "success" | "error";

// ── Animated floating label input ─────────────────────────────────────────────
const Field = ({
  label, name, type = "text", value, onChange, required = true,
}: {
  label: string; name: string; type?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative">
      <motion.label
        animate={{ y: active ? -22 : 0, scale: active ? 0.82 : 1, color: active ? "#22d3ee" : "rgba(100,120,140,0.8)" }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="absolute left-4 top-3.5 pointer-events-none font-mono tracking-widest uppercase text-xs origin-left"
        style={{ transformOrigin: "left center" }}
      >
        {label}
      </motion.label>
      <input
        type={type} name={name} value={value} required={required}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={inputCls}
        style={{
          background: focused ? "rgba(34,211,238,0.04)" : "rgba(255,255,255,0.025)",
          border: `1px solid ${focused ? "rgba(34,211,238,0.45)" : "rgba(255,255,255,0.08)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(34,211,238,0.07)" : "none",
          paddingTop: "1.4rem",
          paddingBottom: "0.6rem",
        }}
      />
    </div>
  );
};

const TextAreaField = ({
  label, name, value, onChange, rows = 5,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number;
}) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative">
      <motion.label
        animate={{ y: active ? -22 : 0, scale: active ? 0.82 : 1, color: active ? "#22d3ee" : "rgba(100,120,140,0.8)" }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="absolute left-4 top-3.5 pointer-events-none font-mono tracking-widest uppercase text-xs origin-left"
        style={{ transformOrigin: "left center" }}
      >
        {label}
      </motion.label>
      <textarea
        name={name} value={value} rows={rows} required
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`${inputCls} resize-none`}
        style={{
          background: focused ? "rgba(34,211,238,0.04)" : "rgba(255,255,255,0.025)",
          border: `1px solid ${focused ? "rgba(34,211,238,0.45)" : "rgba(255,255,255,0.08)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(34,211,238,0.07)" : "none",
          paddingTop: "1.4rem",
          paddingBottom: "0.6rem",
        }}
      />
    </div>
  );
};

// ── Contact info card ─────────────────────────────────────────────────────────
const InfoCard = ({
  icon, label, value, href, delay,
}: {
  icon: React.ReactNode; label: string; value: string; href: string; delay: number;
}) => (
  <motion.a
    href={href}
    variants={fadeUp(delay, 20)}
    initial="hidden"
    whileInView="visible"
    viewport={VP}
    whileHover={{ x: 6, transition: { duration: 0.22 } }}
    className="flex items-center gap-4 p-4 rounded-2xl group no-underline"
    style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      transition: "background 0.3s ease, border-color 0.3s ease",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(34,211,238,0.06)";
      (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(34,211,238,0.25)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.025)";
      (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.07)";
    }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-cyan-400"
      style={{
        background: "rgba(34,211,238,0.07)",
        border: "1px solid rgba(34,211,238,0.18)",
        transition: "background 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] text-gray-600 font-mono tracking-[0.18em] uppercase mb-0.5">{label}</div>
      <div className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors duration-200 truncate">
        {value}
      </div>
    </div>
    <ArrowRight size={14} className="text-gray-600 group-hover:text-cyan-400 shrink-0 transition-colors duration-200" />
  </motion.a>
);

// ── Stat pill ─────────────────────────────────────────────────────────────────
const StatPill = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    variants={fadeUp(delay, 16)}
    initial="hidden"
    whileInView="visible"
    viewport={VP}
    className="flex flex-col items-center justify-center p-4 rounded-2xl text-center"
    style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
    }}
  >
    <span
      className="text-2xl font-bold font-mono"
      style={{
        background: "linear-gradient(135deg, #67e8f9, #3b82f6)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {value}
    </span>
    <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">{label}</span>
  </motion.div>
);

// ── Main component ────────────────────────────────────────────────────────────
export const ContactSection = () => {
  const [form, setForm]     = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");
    try {
      const res = await fetch("https://fastapi-backend-pj3e.onrender.com/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.status === "success") {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (err: unknown) {
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <section
      id="contact"
      className="py-28 bg-black text-white relative border-t border-white/5 overflow-hidden"
    >
      {/* ── Background atmosphere ── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 55% 45% at 15% 70%, rgba(6,182,212,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 45% 55% at 85% 25%, rgba(59,130,246,0.07) 0%, transparent 55%),
          radial-gradient(ellipse 35% 40% at 50% 100%, rgba(99,102,241,0.05) 0%, transparent 60%)
        `,
        filter: "blur(1px)",
      }} />

      {/* Subtle grid */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(34,211,238,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,211,238,0.02) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)",
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* ── Section header ── */}
        <div className="text-center mb-20">
          <motion.p
            variants={fadeUp(0, 12)} initial="hidden" whileInView="visible" viewport={VP}
            className="font-mono tracking-[0.24em] uppercase text-xs mb-5 inline-flex items-center gap-2"
            style={{ color: "rgba(34,211,238,0.75)" }}
          >
            <span className="w-8 h-px" style={{ background: "linear-gradient(90deg, transparent, #22d3ee)" }} />
            Get In Touch
            <span className="w-8 h-px" style={{ background: "linear-gradient(90deg, #22d3ee, transparent)" }} />
          </motion.p>

          <motion.h3
            variants={fadeUp(0.1, 28)} initial="hidden" whileInView="visible" viewport={VP}
            className="text-5xl md:text-6xl font-bold mb-5 tracking-tight"
          >
            Let's Build
            <span style={{
              display: "block",
              background: "linear-gradient(135deg, #67e8f9 0%, #3b82f6 50%, #a78bfa 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Something Great
            </span>
          </motion.h3>

          <motion.p
            variants={fadeUp(0.2, 16)} initial="hidden" whileInView="visible" viewport={VP}
            className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed"
          >
            Whether you're an institution, enterprise, or student — reach out and let's explore what we can build together.
          </motion.p>
        </div>

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-5 gap-8">

          {/* ── LEFT COLUMN (2/5) ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Contact cards */}
            <InfoCard icon={<Mail size={18} />}  label="Email"    value="info@ajuedsolutions.com" href="mailto:info@ajuedsolutions.com" delay={0.25} />
            <InfoCard icon={<Phone size={18} />} label="Phone"    value="+91 8301 973 970"         href="tel:+918301973970"              delay={0.32} />
            <InfoCard icon={<MapPin size={18} />} label="Location" value="Kerala, India"           href="https://maps.google.com"        delay={0.39} />
            <InfoCard icon={<Clock size={18} />}  label="Hours"    value="Mon–Sat, 9 AM – 6 PM"   href="#contact"                       delay={0.46} />

            {/* Stats row */}
            <motion.div
              variants={fadeUp(0.5, 16)} initial="hidden" whileInView="visible" viewport={VP}
              className="grid grid-cols-3 gap-3 mt-2"
            >
              <StatPill value="200+"  label="Students"  delay={0.52} />
              <StatPill value="50+"   label="Projects"  delay={0.58} />
              <StatPill value="3+"    label="Companies" delay={0.64} />
            </motion.div>

            {/* Quote card */}
            <motion.div
              variants={fadeUp(0.68, 16)} initial="hidden" whileInView="visible" viewport={VP}
              className="rounded-2xl p-5 mt-auto"
              style={{
                background: "linear-gradient(145deg, rgba(34,211,238,0.06), rgba(59,130,246,0.04))",
                border: "1px solid rgba(34,211,238,0.15)",
              }}
            >
              <div className="text-3xl text-cyan-500/30 font-serif leading-none mb-2">"</div>
              <p className="text-gray-400 text-sm leading-relaxed italic">
                Innovate. Educate. Empower. We're here to shape the future with you.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-[9px] font-bold text-white">A</div>
                <span className="text-xs text-gray-500 font-mono tracking-wide">AJU ED Solutions</span>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN (3/5) — Form ── */}
          <motion.div
            variants={fadeIn(0.3)} initial="hidden" whileInView="visible" viewport={VP}
            className="lg:col-span-3"
          >
            <div
              className="relative rounded-3xl p-8 h-full"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Corner glows */}
              <div aria-hidden className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)", filter: "blur(32px)" }} />
              <div aria-hidden className="absolute bottom-0 left-0 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", filter: "blur(28px)" }} />

              <AnimatePresence mode="wait">

                {/* ── Success ── */}
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.88, y: 20 }}
                    animate={{ opacity: 1, scale: 1,    y: 0  }}
                    exit={{   opacity: 0, scale: 0.88, y: -20 }}
                    transition={{ duration: 0.55, ease: EASE }}
                    className="flex flex-col items-center justify-center py-20 text-center gap-5"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                      className="w-20 h-20 rounded-full flex items-center justify-center text-cyan-400"
                      style={{
                        background: "rgba(34,211,238,0.08)",
                        border: "1px solid rgba(34,211,238,0.3)",
                        boxShadow: "0 0 40px rgba(34,211,238,0.2)",
                      }}
                    >
                      <CheckCircle2 size={36} />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
                    >
                      <h4 className="text-2xl font-bold text-white mb-2">Message Sent!</h4>
                      <p className="text-gray-400 text-sm max-w-xs mx-auto">
                        Thanks for reaching out. We'll get back to you within 24 hours.
                      </p>
                    </motion.div>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => setStatus("idle")}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="mt-2 text-xs text-gray-500 hover:text-white font-mono tracking-widest uppercase border border-white/10 px-5 py-2.5 rounded-full hover:border-white/25 transition-all duration-200"
                    >
                      Send Another
                    </motion.button>
                  </motion.div>

                ) : (

                  // ── Form ──
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 flex flex-col gap-5 h-full"
                    onSubmit={handleSubmit}
                  >
                    <div className="mb-1">
                      <h4 className="text-lg font-semibold text-white mb-1">Send us a message</h4>
                      <p className="text-gray-500 text-xs font-mono tracking-wide">All fields are required</p>
                    </div>

                    {/* Name + Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Your Name"  name="name"  value={form.name}  onChange={handleChange as any} />
                      <Field label="Your Email" name="email" type="email" value={form.email} onChange={handleChange as any} />
                    </div>

                    {/* Message */}
                    <TextAreaField label="Your Message" name="message" value={form.message} onChange={handleChange as any} rows={15} />

                    {/* Character count */}
                    <div className="flex justify-end -mt-2">
                      <span className="text-[10px] font-mono"
                        style={{ color: form.message.length > 400 ? "#f87171" : "rgba(100,120,140,0.6)" }}>
                        {form.message.length} / 500
                      </span>
                    </div>

                    {/* Error banner */}
                    <AnimatePresence>
                      {status === "error" && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, height: 0 }}
                          animate={{ opacity: 1, y: 0,  height: "auto" }}
                          exit={{   opacity: 0, y: -8,  height: 0 }}
                          transition={{ duration: 0.3, ease: EASE }}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 overflow-hidden"
                          style={{
                            background: "rgba(239,68,68,0.07)",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          <AlertCircle size={16} className="shrink-0" />
                          {errMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={status === "loading"}
                      whileHover={status !== "loading" ? { scale: 1.02, y: -2 } : {}}
                      whileTap={status  !== "loading" ? { scale: 0.98 } : {}}
                      className="w-full py-4 rounded-2xl text-white font-bold tracking-[0.12em] uppercase text-sm flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed mt-auto"
                      style={{
                        background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 60%, #6366f1 100%)",
                        boxShadow: "0 0 28px rgba(6,182,212,0.28), 0 4px 16px rgba(0,0,0,0.3)",
                        transition: "box-shadow 0.3s ease, opacity 0.2s ease, transform 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (status !== "loading")
                          (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            "0 0 48px rgba(6,182,212,0.5), 0 8px 24px rgba(0,0,0,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                          "0 0 28px rgba(6,182,212,0.28), 0 4px 16px rgba(0,0,0,0.3)";
                      }}
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Sending Message…
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </motion.button>

                    {/* Trust line */}
                    <p className="text-center text-[10px] text-gray-600 font-mono tracking-wide">
                      🔒 Your information is private and secure
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};