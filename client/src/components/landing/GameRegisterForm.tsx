"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, User, Phone, CheckCircle2, MessageCircle,
  GraduationCap, Calendar, Clock, Info, HelpCircle,
  Target, ChevronDown
} from "lucide-react";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzcMynMEagRfrpZZvGLQOU-FtBfFhnYb487kW_ArBteCqsQS_XpSdfwL3KlPHY3hCL8Eg/exec";

export default function GameRegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    role: "Student",
    studentName: "",
    grade: "",
    phone: "",
    whatsapp: "",
    date: "",
    timeSlot: "",
    source: "",
    interest: ""
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const formBoxRef = useRef<HTMLDivElement>(null);

  // Fetch current slot occupancy
  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        console.log("Fetching live occupancy data...");
        const response = await fetch(APPS_SCRIPT_URL);
        if (response.ok) {
          const data = await response.json();
          console.log("Occupancy data received:", data);
          setSlotCounts(data);
        }
      } catch (error) {
        console.error("Failed to fetch slot occupancy:", error);
      }
    };
    fetchOccupancy();
    const interval = setInterval(fetchOccupancy, 20000);
    return () => clearInterval(interval);
  }, []);

  const isValid = () => {
    const basicValid = formData.name && formData.role && formData.grade &&
      formData.phone && formData.whatsapp && formData.date &&
      formData.timeSlot && formData.source && formData.interest;
    if (formData.role === "Parent") return basicValid && formData.studentName;
    return basicValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus("loading");

    try {
      const dataToSend = {
        ...formData,
        studentName: formData.role === "Parent" ? formData.studentName : ""
      };

      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(dataToSend),
      });

      setStatus("success");
      setMessage("Transmission successful. Your request is in the system.");

      setFormData({
        name: "",
        role: "Student",
        studentName: "",
        grade: "",
        phone: "",
        whatsapp: "",
        date: "",
        timeSlot: "",
        source: "",
        interest: ""
      });
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
      setMessage("Signal lost. Please try again.");
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
          <h3 className="text-4xl font-black text-white tracking-tight">✅ SLOT RESERVED</h3>
          <p className="text-xl text-zinc-400 max-w-md mx-auto leading-relaxed">
            Signal received. Our team will contact you to confirm your entry.
          </p>
        </div>
        <button
          onClick={() => { setStatus("idle"); }}
          className="px-10 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-full transition-all border border-white/5 shadow-xl"
        >
          Initialize Another
        </button>
      </motion.div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl flex flex-col items-center gap-12 py-8 lg:py-12 mt-8 lg:mt-0">
      <motion.form
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={handleSubmit}
        className="w-full space-y-10 p-8 md:p-12 bg-zinc-950/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-3xl relative overflow-hidden"
      >
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Registration</h2>
          <p className="text-zinc-500 text-xs font-bold tracking-[0.3em] uppercase">Fill in the details below to register for the event.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1 */}
          <div className="space-y-8">
            <InputWrapper label="Applicant Name" icon={User}>
              <input
                type="text" required placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
              />
            </InputWrapper>

            <InputWrapper label="Identification Status">
              <Dropdown
                value={formData.role}
                onChange={(role: string) => setFormData({ ...formData, role, studentName: role === "Student" ? "" : formData.studentName })}
                options={["Student", "Parent"]}
                placeholder="Select Role"
                icon={Target}
              />
            </InputWrapper>

            <AnimatePresence>
              {formData.role === "Parent" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <InputWrapper label="03. Child Identity" icon={User}>
                    <input
                      type="text" required placeholder="Student's Name"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                    />
                  </InputWrapper>
                </motion.div>
              )}
            </AnimatePresence>

            <InputWrapper label="Academic Level">
              <Dropdown
                value={formData.grade}
                onChange={(grade: string) => setFormData({ ...formData, grade })}
                options={["6–8", "9–10", "+1 / +2", "College"]}
                placeholder="Select Grade"
                icon={GraduationCap}
              />
            </InputWrapper>

            <div className="space-y-8">
              <InputWrapper label="Phone Number" icon={Phone}>
                <input
                  type="tel" required placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                />
              </InputWrapper>
              <InputWrapper label="WhatsApp" icon={MessageCircle}>
                <input
                  type="tel" required placeholder="WhatsApp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                />
              </InputWrapper>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-8">
            <InputWrapper label="Reserve Date">
              <Dropdown
                value={formData.date}
                onChange={(date: string) => setFormData({ ...formData, date, timeSlot: "" })}
                options={["April 12", "April 13", "April 14"]}
                placeholder="Select Date"
                icon={Calendar}
              />
            </InputWrapper>

            <InputWrapper label="Slot Allocation">
              <Dropdown
                value={formData.timeSlot}
                onChange={(timeSlot: string) => setFormData({ ...formData, timeSlot })}
                disabled={!formData.date}
                options={[
                  "10:00 – 10:30", "10:30 – 11:00", "11:00 – 11:30", "11:30 – 12:00",
                  "2:00 – 2:30", "2:30 – 3:00", "3:00 – 3:30", "3:30 – 4:00",
                  "4:00 – 4:30", "4:30 – 5:00"
                ].map(s => {
                  const currentCount = slotCounts[`${formData.date}|${s}`] || 0;
                  const isFull = currentCount >= 5;
                  return {
                    label: isFull ? `${s} (FULL)` : `${s} (${5 - currentCount} seats left)`,
                    value: s,
                    disabled: isFull
                  };
                })}
                placeholder={!formData.date ? "Select Date First" : "Pick a Slot"}
                icon={Clock}
              />
            </InputWrapper>

            <InputWrapper label="How did you hear about us?">
              <Dropdown
                value={formData.source}
                onChange={(source: string) => setFormData({ ...formData, source })}
                options={["Bus stop interaction", "Instagram", "Friend", "Walk-in"]}
                placeholder="How did you find us?"
                icon={Info}
              />
            </InputWrapper>

            <InputWrapper label="Interest">
              <Dropdown
                value={formData.interest}
                onChange={(interest: string) => setFormData({ ...formData, interest })}
                options={[
                  "Just exploring",
                  "Interested in robotics",
                  "Looking for career programs"
                ]}
                placeholder="Primary Focus"
                icon={Target}
              />
            </InputWrapper>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={status === "loading" || !isValid()}
            className="w-full py-5 bg-white hover:bg-zinc-200 disabled:opacity-10 text-black font-black text-sm  flex items-center justify-center gap-4 transition-all shadow-xl "
          >
            {status === "loading" ? "UPLOADING..." : "SUBMIT REGISTRATION"}
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
    {Icon && <Icon className="absolute left-5 top-5 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />}
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