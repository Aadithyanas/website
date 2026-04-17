"use client";

import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, User, Phone, CheckCircle2, MessageCircle,
  GraduationCap, Calendar, Info, Code,
  Target, ChevronDown, Building2, BookOpen, Mail
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwXMteA6m8P43KS0_7yGYyWCr3v1AZ9ktMOkjvq66EbVi_qgiiJ2ABYlc5hP2Rq8NiVmA/exec";

const COLLEGE_COURSES: Record<string, string[]> = {
  "B.Tech": [
    "Computer Science",
    "Information Technology",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Other Engineering"
  ],
  "Diploma": [
    "Computer Engineering",
    "Information Technology",
    "Electronics",
    "Mechanical",
    "Electrical",
    "Civil",
    "Other"
  ],
  "Degree": [
    "BCA (Computer Applications)",
    "BSc (Computer Science)",
    "BSc (IT)",
    "B.Com",
    "B.A",
    "BSc (Other)",
    "Other"
  ]
};

const SCHOOL_COURSES: Record<string, string[]> = {
  "10th Standard": ["SSLC", "ICSE", "CBSE", "Other"],
  "+2": ["Biology Science", "Computer Science", "Commerce", "Arts", "Other"]
};

export default function InternshipApplicationForm() {
  const [registrationType, setRegistrationType] = useState<"student" | "institution" | "workshop">("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    educationLevel: "College",
    institutionName: "",
    course: "",
    stream: "",
    currentYear: "",
    phone: "",
    whatsapp: "",
    internshipTrack: "",
    internshipPeriod: "",
    workshopCourse: "",
    durationDays: "",
    startDate: "",
    endDate: "",
    source: "",
    whyInternship: ""
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [sameAsPhone, setSameAsPhone] = useState(false);

  const validateForm = () => {
    const contactValid = formData.phone && formData.whatsapp;
    let baseValid = false;

    if (registrationType === "student") {
      baseValid = !!(formData.name && formData.email && formData.educationLevel && formData.institutionName &&
        formData.course && formData.stream && contactValid &&
        formData.internshipTrack && formData.internshipPeriod &&
        formData.startDate && formData.endDate && formData.source && customAmount);

      if (formData.educationLevel === "College") {
        baseValid = baseValid && !!formData.currentYear;
      }
    } else if (registrationType === "institution") {
      baseValid = !!(formData.name && formData.institutionName && formData.internshipTrack &&
        formData.internshipPeriod && contactValid);
    } else if (registrationType === "workshop") {
      baseValid = !!(formData.name && formData.institutionName && formData.workshopCourse &&
        formData.durationDays && contactValid);
    }

    if (!baseValid) return false;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Phone number must be exactly 10 digits.");
      return false;
    }

    return baseValid;
  };


  const [customAmount, setCustomAmount] = useState<string>("");

  const calculateBreakdown = () => {
    const base = parseFloat(customAmount) || 0;
    // Explicitly zero out all charges to ensure no overrides
    return { base, service: 0, gateway: 0, total: base };
  };

  const submitManual = async () => {
    setStatus("loading");
    try {
      const { total } = calculateBreakdown();
      if (total === 0) {
        alert("Please enter a valid amount");
        return;
      }

      const res = await axios.post(`${API_BASE}/api/internships/submit-manual`, {
        ...formData,
        amount: total
      });

      setStatus("success");
      setMessage("Application submitted successfully! Please check your email for payment instructions.");

      // Also sync to Google Sheets as secondary record
      axios.post(APPS_SCRIPT_URL, {
        ...formData,
        registrationType,
        status: "pending"
      }, {
        headers: { "Content-Type": "text/plain" }
      }).catch(err => console.error("Sheet sync failed:", err));

    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.detail || err.message || "Submission failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(false);

    if (!validateForm()) {
      setShowErrors(true);
      setStatus("error");
      setMessage("Please fill in all mandatory fields marked with *");
      return;
    }

    if (registrationType === "student") {
      await submitManual();
      return;
    }

    setStatus("loading");
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ ...formData, registrationType }),
      });

      setStatus("success");
      setMessage("Application submitted successfully!");

      setFormData({
        name: "",
        email: "",
        educationLevel: "College",
        institutionName: "",
        course: "",
        stream: "",
        currentYear: "",
        phone: "",
        whatsapp: "",
        internshipTrack: "",
        internshipPeriod: "",
        workshopCourse: "",
        durationDays: "",
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
        <div className="w-32 h-32 relative flex items-center justify-center">
          <img 
            src="/images/logo 3.png" 
            alt="Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-4xl font-black text-white tracking-tight">{registrationType === "student" ? "APPLICATION RECEIVED" : "REQUEST RECEIVED"}</h3>
          <p className="text-xl text-zinc-400 max-w-md mx-auto leading-relaxed">
            {registrationType === "student"
              ? "Your internship application has been submitted.Check the mail and complete the payment"
              : "Thank you for reaching out! Our team will contact you within 24 hours to discuss the collaboration."}
          </p>
        </div>
        <button
          onClick={() => { setStatus("idle"); }}
          className="px-10 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-full transition-all border border-white/5 shadow-xl"
        >
          Submit Another Request
        </button>
      </motion.div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl flex flex-col items-center gap-12 py-8 lg:py-12 lg:mt-0">
      <div className="text-center mb-10">
        <h2 className="text-5xl font-black text-white tracking-tight">Register Here</h2>
      </div>
      <motion.form
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={handleSubmit}
        className="w-full space-y-2 p-4 md:p-12 bg-zinc-950/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-3xl relative overflow-hidden"
      >


        {/* Registration Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { id: "student", label: "Student Internship", icon: GraduationCap },
            { id: "institution", label: "Institution Partnership", icon: Building2 },
            { id: "workshop", label: "Workshop Request", icon: Code }
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setRegistrationType(type.id as any)}
              className={`flex items-center justify-center gap-3 p-5 rounded-[1.5rem] border transition-all font-bold text-sm ${registrationType === type.id
                ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                : "bg-black/40 text-zinc-500 border-white/5 hover:border-white/20"
                }`}
            >
              <type.icon className={`w-5 h-5 ${registrationType === type.id ? "text-indigo-600" : "text-zinc-600"}`} />
              {type.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1 */}
          <div className="space-y-8">
            <InputWrapper label={registrationType === "student" ? "Full Name" : "Your Name / Authority Name"} icon={User} required error={showErrors && !formData.name}>
              <input
                type="text" required placeholder="Enter Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-14 pr-6 py-5 bg-black/40 border ${showErrors && !formData.name ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium`}
              />
            </InputWrapper>

            {registrationType === "student" && (
              <>
                <InputWrapper label="Email Address" icon={Mail} required error={showErrors && !formData.email}>
                  <input
                    type="email" required placeholder="Enter Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-14 pr-6 py-5 bg-black/40 border ${showErrors && !formData.email ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium`}
                  />
                </InputWrapper>

                <InputWrapper label="Education Level" required error={showErrors && !formData.educationLevel}>
                  <Dropdown
                    value={formData.educationLevel}
                    onChange={(level: string) => setFormData({
                      ...formData,
                      educationLevel: level,
                      course: "",
                      stream: "",
                      currentYear: ""
                    })}
                    options={["School", "College"]}
                    placeholder="Select Level"
                    icon={GraduationCap}
                    error={showErrors && !formData.educationLevel}
                  />
                </InputWrapper>

                <InputWrapper label="Institution Name" icon={Building2} required error={showErrors && !formData.institutionName}>
                  <input
                    type="text" required placeholder={formData.educationLevel === "School" ? "School Name" : "College Name"}
                    value={formData.institutionName}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                    className={`w-full pl-14 pr-6 py-5 bg-black/40 border ${showErrors && !formData.institutionName ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium`}
                  />
                </InputWrapper>

                <InputWrapper label="Select Course" required error={showErrors && !formData.course}>
                  <Dropdown
                    value={formData.course}
                    onChange={(course: string) => setFormData({ ...formData, course, stream: "" })}
                    options={Object.keys(formData.educationLevel === "School" ? SCHOOL_COURSES : COLLEGE_COURSES)}
                    placeholder="Select Course"
                    icon={BookOpen}
                    error={showErrors && !formData.course}
                  />
                </InputWrapper>

                <InputWrapper label="Select Stream/Board" required error={showErrors && !formData.stream}>
                  <Dropdown
                    value={formData.stream}
                    onChange={(stream: string) => setFormData({ ...formData, stream })}
                    options={
                      formData.course
                        ? (formData.educationLevel === "School" ? SCHOOL_COURSES[formData.course] : COLLEGE_COURSES[formData.course])
                        : []
                    }
                    placeholder="Select Stream"
                    icon={Target}
                    disabled={!formData.course}
                    error={showErrors && !formData.stream}
                  />
                </InputWrapper>

                {formData.educationLevel === "College" && (
                  <InputWrapper label="Current Semester" required error={showErrors && !formData.currentYear}>
                    <Dropdown
                      value={formData.currentYear}
                      onChange={(year: string) => setFormData({ ...formData, currentYear: year })}
                      options={[
                        "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
                        "5th Semester", "6th Semester", "7th Semester", "8th Semester"
                      ]}
                      placeholder="Select Semester"
                      icon={Calendar}
                      error={showErrors && !formData.currentYear}
                    />
                  </InputWrapper>
                )}
              </>
            )}

            {(registrationType === "institution" || registrationType === "workshop") && (
              <InputWrapper label={registrationType === "institution" ? "College/School Name" : "Name of Institute"} icon={Building2} required error={showErrors && !formData.institutionName}>
                <input
                  type="text" required placeholder="Institution Name"
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  className={`w-full pl-14 pr-6 py-5 bg-black/40 border ${showErrors && !formData.institutionName ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium`}
                />
              </InputWrapper>
            )}

            <div className="space-y-8">
              <InputWrapper label="Phone Number" icon={Phone} required error={showErrors && !formData.phone}>
                <input
                  type="tel" required placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      phone: val,
                      whatsapp: sameAsPhone ? val : prev.whatsapp 
                    }));
                  }}
                  className={`w-full pl-14 pr-6 py-5 bg-black/40 border ${showErrors && !formData.phone ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium`}
                />
              </InputWrapper>
              
              <div className="space-y-4">
                <InputWrapper label="WhatsApp Number" icon={MessageCircle} required error={showErrors && !formData.whatsapp}>
                  <input
                    type="tel" required placeholder="WhatsApp Number"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    disabled={sameAsPhone}
                    className={`w-full pl-14 pr-6 py-5 bg-black/40 border ${showErrors && !formData.whatsapp ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium disabled:opacity-50`}
                  />
                </InputWrapper>
                <label className="flex items-center gap-3 cursor-pointer group ml-1">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSameAsPhone(checked);
                        if (checked) {
                          setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
                        }
                      }}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-white/10 rounded-md bg-black/40 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all" />
                    <CheckCircle2 className="absolute w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform left-[3px]" />
                  </div>
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Same as Phone Number</span>
                </label>
              </div>
            </div>
          </div>

          {/* Column 2 */}
            <div className="space-y-8">
              {registrationType === "student" && (
                <>
                  <InputWrapper label="Internship Course" required error={showErrors && !formData.internshipTrack}>
                    <Dropdown
                      value={formData.internshipTrack}
                      onChange={(track: string) => setFormData({ ...formData, internshipTrack: track })}
                      options={["Robotics", "Python Django", "MERN Stack"]}
                      placeholder="Choose Internship Course"
                      icon={Code}
                      error={showErrors && !formData.internshipTrack}
                    />
                  </InputWrapper>

                  <InputWrapper label="Internship Duration" required error={showErrors && !formData.internshipPeriod}>
                    <Dropdown
                      value={formData.internshipPeriod}
                      onChange={(period: string) => setFormData({ ...formData, internshipPeriod: period })}
                      options={["1 Week", "2 Weeks", "3 Weeks", "1 Month", "2 Months", "3 Months", "4 Months", "6 Months", "Other"]}
                      placeholder="Select Duration"
                      icon={Calendar}
                      error={showErrors && !formData.internshipPeriod}
                    />
                  </InputWrapper>

                  <InputWrapper label="Why Do You Want This Internship? (Optional)" icon={Target}>
                    <textarea

                      placeholder="Tell us about your interest and goals..."
                      value={formData.whyInternship}
                      onChange={(e) => setFormData({ ...formData, whyInternship: e.target.value })}
                      rows={4}
                      className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium resize-none"
                    />
                  </InputWrapper>

                  <InputWrapper label="When would you like to start your internship" icon={Calendar} required error={showErrors && !formData.startDate}>
                    <input
                      type="date" required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      onClick={(e) => e.currentTarget.showPicker()}
                      style={{ colorScheme: 'dark' }}
                      className={`w-full pl-14 pr-6 py-5 bg-black/40 border ${showErrors && !formData.startDate ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium`}
                    />
                  </InputWrapper>

                  <InputWrapper label="When would you like to end your internship" icon={Calendar} required error={showErrors && !formData.endDate}>
                    <input
                      type="date" required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      onClick={(e) => e.currentTarget.showPicker()}
                      style={{ colorScheme: 'dark' }}
                      min={formData.startDate}
                      className={`w-full pl-14 pr-6 py-5 bg-black/40 border ${showErrors && !formData.endDate ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium`}
                    />
                  </InputWrapper>

                  <InputWrapper label="How Did You Hear About Us?" required error={showErrors && !formData.source}>
                    <Dropdown
                      value={formData.source}
                      onChange={(source: string) => setFormData({ ...formData, source })}
                      options={[
                        "University / College Communication",
                        "Social Media (Instagram)",
                        "Employee or Personal Referral",
                        "LinkedIn",
                        "Walk-in / On-site Inquiry",
                        "Other"
                      ]}
                      placeholder="Select Source"
                      icon={Info}
                      error={showErrors && !formData.source}
                    />
                  </InputWrapper>
                </>
              )}

              {registrationType === "institution" && (
                <>
                  <InputWrapper label="Choose Internship Track(s)" required error={showErrors && !formData.internshipTrack}>
                    <Dropdown
                      value={formData.internshipTrack}
                      onChange={(track: string) => setFormData({ ...formData, internshipTrack: track })}
                      options={["Robotics", "Python Django", "MERN Stack", "Custom/All"]}
                      placeholder="Choose Course"
                      icon={Code}
                      error={showErrors && !formData.internshipTrack}
                    />
                  </InputWrapper>

                  <InputWrapper label="Contract Period" icon={Calendar} required error={showErrors && !formData.internshipPeriod}>
                    <input
                      type="text" required placeholder="e.g., 1 Year, 6 Months"
                      value={formData.internshipPeriod}
                      onChange={(e) => setFormData({ ...formData, internshipPeriod: e.target.value })}
                      className={`w-full pl-14 pr-6 py-5 bg-black/40 border ${showErrors && !formData.internshipPeriod ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium`}
                    />
                  </InputWrapper>

                  <InputWrapper label="Brief About Your Idea / Collaboration" icon={Target} required error={showErrors && !formData.whyInternship}>
                    <textarea
                      required
                      placeholder="Tell us about your requirements or collaboration ideas..."
                      value={formData.whyInternship}
                      onChange={(e) => setFormData({ ...formData, whyInternship: e.target.value })}
                      rows={6}
                      className={`w-full pl-14 pr-6 py-5 bg-black/40 border ${showErrors && !formData.whyInternship ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium resize-none`}
                    />
                  </InputWrapper>
                </>
              )}

              {registrationType === "workshop" && (
                <>
                  <InputWrapper label="Choose Workshop Subject" required error={showErrors && !formData.workshopCourse}>
                    <Dropdown
                      value={formData.workshopCourse}
                      onChange={(course: string) => setFormData({ ...formData, workshopCourse: course })}
                      options={["Robotics Workshop", "coding Workshop", "AI & ML Workshop", "IoT Workshop", "Other"]}
                      placeholder="Choose Workshop"
                      icon={BookOpen}
                      error={showErrors && !formData.workshopCourse}
                    />
                  </InputWrapper>

                  <InputWrapper label="How many days you want?" icon={Calendar} required error={showErrors && !formData.durationDays}>
                    <input
                      type="text" required placeholder="e.g., 2 Days, 3 Days"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                      className={`w-full pl-14 pr-6 py-5 bg-black/40 border ${showErrors && !formData.durationDays ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium`}
                    />
                  </InputWrapper>

                  <InputWrapper label="Brief Requirements" icon={Target} required error={showErrors && !formData.whyInternship}>
                    <textarea
                      required
                      placeholder="Tell us about the target audience and specific topics..."
                      value={formData.whyInternship}
                      onChange={(e) => setFormData({ ...formData, whyInternship: e.target.value })}
                      rows={6}
                      className={`w-full pl-14 pr-6 py-5 bg-black/40 border ${showErrors && !formData.whyInternship ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium resize-none`}
                    />
                  </InputWrapper>
                </>
              )}
            </div>

        </div>

        {registrationType === "student" && (
          <div className="space-y-6 mb-8">
            <InputWrapper label="Internship Fee (Base)" icon={CheckCircle2} required error={showErrors && !customAmount}>
              <input
                type="number" required placeholder="Enter amount to pay (e.g. 2500)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className={`w-full pl-14 pr-6 py-5 bg-black/40 border ${showErrors && !customAmount ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-medium`}
              />
            </InputWrapper>

          
          </div>
        )}

        <div className="pt-6">
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-5 bg-white hover:bg-zinc-200 disabled:opacity-10 text-black font-black text-sm flex items-center justify-center gap-4 transition-all shadow-xl rounded-[1.5rem]"
          >
            {status === "loading"
              ? "PROCESSING..."
              : (registrationType === "student" ? "PAY & SUBMIT APPLICATION" : "SUBMIT APPLICATION")}
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

const InputWrapper = ({ label, children, icon: Icon, required, error }: any) => (
  <div className="space-y-3">
    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${error ? 'text-red-500' : 'text-zinc-500'}`}>
      {label} {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative group">
      {Icon && <Icon className={`absolute left-5 top-5 w-5 h-5 transition-colors pointer-events-none ${error ? 'text-red-500/50' : 'text-zinc-600 group-focus-within:text-indigo-400'}`} />}
      {children}
    </div>
  </div>
);

const Dropdown = ({ value, onChange, options, placeholder, icon: Icon, disabled = false, error }: any) => (
  <div className="relative group">
    {Icon && <Icon className={`absolute left-5 top-5 w-5 h-5 transition-colors pointer-events-none z-10 ${error ? 'text-red-500/50' : 'text-zinc-600 group-focus-within:text-indigo-400'}`} />}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full ${Icon ? "pl-14" : "pl-6"} pr-12 py-5 bg-black/40 border ${error ? 'border-red-500/50' : 'border-white/5'} rounded-[1.5rem] text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all font-medium disabled:opacity-20`}
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