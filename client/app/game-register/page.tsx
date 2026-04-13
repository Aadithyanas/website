"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, User, Phone, CheckCircle2, MessageCircle,
  GraduationCap, Calendar, Info, Code,
  Target, ChevronDown, Building2, BookOpen
} from "lucide-react";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzcMynMEagRfrpZZvGLQOU-FtBfFhnYb487kW_ArBteCqsQS_XpSdfwL3KlPHY3hCL8Eg/exec";

export default function InternshipApplicationForm() {
  const [formData, setFormData] = useState({
    name: "",
    educationLevel: "College",
    institutionName: "",
    course: "",
    currentYear: "",
    phone: "",
    whatsapp: "",
    internshipTrack: "",
    startDate: "",
    endDate: "",
    source: "",
    whyInternship: ""
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const isValid = () => {
    return formData.name && formData.educationLevel && formData.institutionName &&
      formData.course && formData.currentYear && formData.phone && 
      formData.whatsapp && formData.internshipTrack && formData.startDate &&
      formData.endDate && formData.source && formData.whyInternship;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(formData),
      });

      setStatus("success");
      setMessage("Application submitted successfully!");

      setFormData({
        name: "",
        educationLevel: "College",
        institutionName: "",
        course: "",
        currentYear: "",
        phone: "",
        whatsapp: "",
        internshipTrack: "",
        startDate: "",
        endDate: "",
        source: "",
        whyInternship: ""
      });
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
      setMessage("Submission failed. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl flex flex-col items-center justify-center space-y-8 p-12 bg-zinc-900/50 backdrop-blur-3xl border border-white/5 rounded-[3rem] text-center shadow-2xl relative"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/20 blur-[100px] pointer-events-none" />
        <div className="w-24 h-24 bg-gradient-to-tr from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center border border-green-500/30">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <div className="space-y-4">
          <h3 className="text-4xl font-black text-white tracking-tight">✅ APPLICATION RECEIVED</h3>
          <p className="text-xl text-zinc-400 max-w-md mx-auto leading-relaxed">
            Your internship application has been submitted. Our team will review and contact you soon.
          </p>
        </div>
        <button
          onClick={() => { setStatus("idle"); }}
          className="px-10 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-full transition-all border border-white/5 shadow-xl"
        >
          Submit Another Application
        </button>
      </motion.div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="relative w-full max-w-4xl flex flex-col items-center gap-12 py-8 lg:py-12 lg:mt-0">
      <motion.form
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={handleSubmit}
        className="w-full space-y-2 p-4 md:p-12 bg-zinc-950/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-3xl relative overflow-hidden"
      >
        <div className="space-y-2 text-center md:text-left mb-8">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Internship Application</h2>
          <p className="text-zinc-500 text-xs font-bold tracking-[0.3em] uppercase">Complete the form to apply for our internship program</p>
=======
    <main className="min-h-screen flex flex-col" style={{ background: "#000", color: "#eef2ff" }}>
      <Nav />
      {/* Added pt-32 to clear fixed navbar, reduced mb-6 for tighter layout */}
      <div className="flex-1 flex flex-col items-center justify-start pt-32 lg:pt-40 p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(67,56,202,0.1),transparent_50%)]">
        <div className="max-w-4xl w-full text-center space-y-4 lg:space-y-2 mb-8 ">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            Level Up Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">Journey</span>
          </h1>
          <p className="text-zinc-500 text-xs font-bold tracking-[0.3em] uppercase">Complete the form to book your free workshop seat</p>

>>>>>>> bfd22b0 (add intenship form)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1 */}
          <div className="space-y-8">
            <InputWrapper label="Full Name" icon={User}>
              <input
                type="text" required placeholder="Your Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
              />
            </InputWrapper>

            <InputWrapper label="Education Level">
              <Dropdown
                value={formData.educationLevel}
                onChange={(level: string) => setFormData({ ...formData, educationLevel: level })}
                options={["School", "College"]}
                placeholder="Select Level"
                icon={GraduationCap}
              />
            </InputWrapper>

            <InputWrapper label="Institution Name" icon={Building2}>
              <input
                type="text" required placeholder="School/College Name"
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
              />
            </InputWrapper>

            <InputWrapper label="Course/Stream">
              <Dropdown
                value={formData.course}
                onChange={(course: string) => setFormData({ ...formData, course })}
                options={[
                  "Computer Science",
                  "Information Technology",
                  "Electronics",
                  "Mechanical",
                  "Electrical",
                  "Science Stream",
                  "Commerce Stream",
                  "Other Engineering",
                  "Other"
                ]}
                placeholder="Select Course/Stream"
                icon={BookOpen}
              />
            </InputWrapper>

            <InputWrapper label="Current Year/Class">
              <Dropdown
                value={formData.currentYear}
                onChange={(year: string) => setFormData({ ...formData, currentYear: year })}
                options={
                  formData.educationLevel === "School" 
                    ? ["8th", "9th", "10th", "11th", "12th"]
                    : ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year"]
                }
                placeholder="Select Year/Class"
                icon={Calendar}
              />
            </InputWrapper>

            <div className="space-y-8">
              <InputWrapper label="Phone Number" icon={Phone}>
                <input
                  type="tel" required placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                />
              </InputWrapper>
              <InputWrapper label="WhatsApp Number" icon={MessageCircle}>
                <input
                  type="tel" required placeholder="WhatsApp Number"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                />
              </InputWrapper>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-8">
            <InputWrapper label="Internship Track">
              <Dropdown
                value={formData.internshipTrack}
                onChange={(track: string) => setFormData({ ...formData, internshipTrack: track })}
                options={[
                  "Robotics",
                  "Python Programming",
                  "Java Development",
                  "MERN Stack"
                ]}
                placeholder="Choose Internship Track"
                icon={Code}
              />
            </InputWrapper>

            <InputWrapper label="Why Do You Want This Internship?" icon={Target}>
              <textarea
                required
                placeholder="Tell us about your interest and goals..."
                value={formData.whyInternship}
                onChange={(e) => setFormData({ ...formData, whyInternship: e.target.value })}
                rows={4}
                className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium resize-none"
              />
            </InputWrapper>

            <InputWrapper label="Internship Start Date" icon={Calendar}>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
              />
            </InputWrapper>

            <InputWrapper label="Internship End Date" icon={Calendar}>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
              />
            </InputWrapper>

            <InputWrapper label="How Did You Hear About Us?">
              <Dropdown
                value={formData.source}
                onChange={(source: string) => setFormData({ ...formData, source })}
                options={[
                  "College/School Notice",
                  "Instagram",
                  "Friend Referral",
                  "LinkedIn",
                  "Walk-in",
                  "Other"
                ]}
                placeholder="Select Source"
                icon={Info}
              />
            </InputWrapper>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={status === "loading" || !isValid()}
            className="w-full py-5 bg-white hover:bg-zinc-200 disabled:opacity-10 text-black font-black text-sm flex items-center justify-center gap-4 transition-all shadow-xl rounded-[1.5rem]"
          >
            {status === "loading" ? "SUBMITTING APPLICATION..." : "SUBMIT APPLICATION"}
            <Send className="w-5 h-5" />
          </button>
        </div>

        {status === "error" && (
          <p className="text-red-500 text-[10px] font-black uppercase text-center mt-4 tracking-widest">{message}</p>
        )}
      </motion.form>
    </div>
  );
}

const InputWrapper = ({ label, children, icon: Icon }: any) => (
  <div className="space-y-3">
    <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-5 top-5 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />}
      {children}
    </div>
  </div>
);

const Dropdown = ({ value, onChange, options, placeholder, icon: Icon, disabled = false }: any) => (
  <div className="relative group">
    {Icon && <Icon className="absolute left-5 top-5 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10" />}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full ${Icon ? "pl-14" : "pl-6"} pr-12 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all font-medium disabled:opacity-20`}
    >
      <option value="" disabled className="bg-zinc-900">{placeholder}</option>
      {options.map((opt: any) => {
        const isFull = typeof opt === 'object' ? opt.disabled : false;
        const label = typeof opt === 'object' ? opt.label : opt;
        const val = typeof opt === 'object' ? opt.value : opt;
        return (
          <option key={val} value={val} disabled={isFull} className="bg-zinc-900 py-2">
            {label}
          </option>
        );
      })}
    </select>
    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none group-hover:text-zinc-400 transition-colors" />
  </div>
);
