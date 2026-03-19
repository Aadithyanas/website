// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import {
//     Target, Eye, ShieldCheck,
//     Cpu, Palette, Building,
//     Lightbulb, GraduationCap, Network, SearchCode, Database, Rocket,
//     Laptop, CloudCog, Bot, Zap, Briefcase, MessagesSquare, Users, Award, Clock, Star,
//     Mail, Phone
// } from "lucide-react";

// gsap.registerPlugin(ScrollTrigger);

// const fadeInVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
// };

// export const AboutSection = () => {
//     const sectionRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         if (sectionRef.current) {
//             gsap.fromTo(
//                 sectionRef.current.children,
//                 { opacity: 0, y: 30 },
//                 {
//                     opacity: 1, y: 0, duration: 0.8, stagger: 0.2,
//                     scrollTrigger: {
//                         trigger: sectionRef.current,
//                         start: "top 80%",
//                     }
//                 }
//             );
//         }
//     }, []);

//     return (
//         <section id="about" className="py-24 bg-[#050505] text-white relative border-t border-white/5">
//             <div className="max-w-7xl mx-auto px-6 relative z-10" ref={sectionRef}>
//                 <div className="text-center max-w-3xl mx-auto mb-16">
//                     <h2 className="text-cyan-400 font-mono tracking-widest uppercase mb-4 text-sm">About Us</h2>
//                     <h3 className="text-4xl md:text-5xl font-bold mb-6">Redefining Education & Technology</h3>
//                     <p className="text-gray-400 text-lg">
//                         <strong>AJU ED SOLUTIONS</strong> is redefining education & technology with <b>AI, ML, IoT, Robotics, ERP & Web</b> solutions.
//                     </p>
//                 </div>

//                 <div className="grid md:grid-cols-3 gap-8">
//                     {[
//                         { icon: <Target size={32} />, title: "Mission", desc: "Inspire learning and innovation through technology-driven education & enterprise." },
//                         { icon: <Eye size={32} />, title: "Vision", desc: "Lead globally in digital education and enterprise solutions." },
//                         { icon: <ShieldCheck size={32} />, title: "Values", desc: "Innovation, Integrity, Collaboration, and Excellence." },
//                     ].map((feature, i) => (
//                         <div key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl hover:bg-white/[0.05] hover:border-cyan-500/50 transition-all duration-500 group text-center">
//                             <div className="text-cyan-400 mb-6 flex justify-center group-hover:scale-110 group-hover:text-cyan-300 transition-all duration-300">{feature.icon}</div>
//                             <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
//                             <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     );
// };

// export const CompaniesSection = () => {
//     const sectionRef = useRef<HTMLDivElement>(null);
//     useEffect(() => {
//         if (sectionRef.current) {
//             gsap.fromTo(sectionRef.current.querySelectorAll('.company-card'),
//                 { opacity: 0, y: 40 },
//                 { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } }
//             );
//         }
//     }, []);

//     return (
//         <section id="companies" className="py-24 bg-black text-white relative border-t border-white/5" ref={sectionRef}>
//             <div className="max-w-7xl mx-auto px-6">
//                 <div className="text-center mb-16">
//                     <h2 className="text-blue-500 font-mono tracking-widest uppercase mb-4 text-sm">Our Portfolio</h2>
//                     <h3 className="text-4xl md:text-5xl font-bold">Our Companies</h3>
//                     <p className="text-gray-400 text-lg mt-4">Innovating across multiple domains under the AJU umbrella</p>
//                 </div>

//                 <div className="grid md:grid-cols-3 gap-8">
//                     {[
//                         { icon: <Cpu size={32} />, title: "AJU TECHZORA", desc: "Web and mobile development, IoT, Robotics, AI/ML & Tech Solutions at low cost for customers and enterprises.", color: "text-cyan-400" },
//                         { icon: <Palette size={32} />, title: "AJU Brandify", desc: "Branding, Digital Marketing & Web Solutions to help businesses grow and shine online.", color: "text-purple-400" },
//                         { icon: <Building size={32} />, title: "ScrumSpace CoWorks", desc: "Modern coworking spaces with community-driven initiatives for startups and creators.", color: "text-blue-400" },
//                     ].map((comp, i) => (
//                         <div key={i} className="company-card bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 p-8 rounded-2xl hover:border-white/30 transition-all duration-300">
//                             <div className={`${comp.color} mb-6 drop-shadow-[0_0_10px_currentColor]`}>{comp.icon}</div>
//                             <h4 className="text-xl font-bold mb-3">{comp.title}</h4>
//                             <p className="text-gray-400 text-sm leading-relaxed">{comp.desc}</p>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     );
// };

// export const InitiativesSection = () => {
//     const initiatives = [
//         { title: "Smart Classrooms & IoT Labs", desc: "Transforming learning spaces into AI-powered, sensor-enabled smart environments for immersive education.", icon: <Network /> },
//         { title: "Low-Cost Robotics & Automation", desc: "Hands-on robotics kits for students to explore automation, design thinking, and real-world problem solving.", icon: <Bot /> },
//         { title: "AI & Machine Intelligence", desc: "Predictive analytics, computer vision, and AI-driven applications that give students futuristic problem-solving skills.", icon: <Lightbulb /> },
//         { title: "Digital Skill Acceleration", desc: "Upskilling in cloud, coding, data analytics, and cyber-physical systems for future tech careers.", icon: <SearchCode /> },
//         { title: "IoT & Embedded Systems", desc: "Hands-on experience with microcontrollers, ESP32, Arduino, and smart sensor networks for real-world IoT solutions.", icon: <Zap /> },
//         { title: "Robotics Competitions & Hackathons", desc: "Challenging students to innovate, build, and compete with tech solutions that shape tomorrow’s world.", icon: <Rocket /> },
//     ];

//     return (
//         <section id="initiatives" className="py-24 bg-[#030303] text-white relative border-t border-white/5">
//             <div className="max-w-7xl mx-auto px-6">
//                 <div className="text-center mb-16">
//                     <h2 className="text-purple-400 font-mono tracking-widest uppercase mb-4 text-sm">Future-Ready</h2>
//                     <h3 className="text-4xl md:text-5xl font-bold">Initiatives</h3>
//                     <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">Pioneering the next generation of AI, IoT, Robotics, and Digital Education to empower innovators, creators, and tech enthusiasts.</p>
//                 </div>

//                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {initiatives.map((item, i) => (
//                         <div key={i} className="group p-6 bg-black border border-white/10 rounded-2xl hover:bg-white/[0.02] hover:border-cyan-500/50 transition-all">
//                             <div className="text-cyan-400 mb-4 bg-cyan-900/20 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">{item.icon}</div>
//                             <h4 className="text-lg font-bold mb-2 text-white group-hover:text-cyan-300 transition-colors">{item.title}</h4>
//                             <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     );
// };

// export const ServicesSection = () => {
//     const services = [
//         { title: "Web & App Development", desc: "Custom websites, mobile apps, progressive web apps, and responsive solutions.", icon: <Laptop /> },
//         { title: "ERP & Automation Solutions", desc: "ERP systems, workflow automation, digital transformation for education & business.", icon: <CloudCog /> },
//         { title: "AI/ML & Data Analytics", desc: "Predictive analytics, AI models, data insights, dashboards, and research support.", icon: <Database /> },
//         { title: "IoT Solutions", desc: "Smart classrooms, connected devices, sensors, and monitoring systems.", icon: <Network /> },
//         { title: "Robotics & Automation", desc: "Low-cost robotics kits, lab automation, and robotics education programs.", icon: <Bot /> },
//         { title: "Branding & Marketing", desc: "Logo design, brand strategy, digital marketing, social media campaigns (Aju Brandify).", icon: <Palette /> },
//         { title: "Co-working Spaces", desc: "Flexible workspace rentals, community networking, and startup-friendly facilities (ScrumSpace CoWorks).", icon: <Building /> },
//         { title: "BTech Coaching", desc: "Engineering coaching, subject tutorials, coding labs, and practical workshops.", icon: <GraduationCap /> },
//         { title: "Internships & Projects", desc: "Hands-on industry projects, internship opportunities, and mentorship programs.", icon: <Briefcase /> },
//     ];

//     return (
//         <section id="services" className="py-24 bg-black text-white relative border-t border-white/5">
//             <div className="max-w-7xl mx-auto px-6">
//                 <div className="text-center mb-16">
//                     <h2 className="text-cyan-400 font-mono tracking-widest uppercase mb-4 text-sm">Capabilities</h2>
//                     <h3 className="text-4xl md:text-5xl font-bold">Services</h3>
//                     <p className="text-gray-400 text-lg mt-4">Empowering education, enterprises, and innovators with futuristic solutions.</p>
//                 </div>

//                 <div className="grid md:grid-cols-3 gap-6">
//                     {services.map((svc, i) => (
//                         <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-cyan-500/40 transition-colors flex flex-col items-center text-center">
//                             <div className="text-cyan-400 mb-4 p-3 bg-cyan-500/10 rounded-full">{svc.icon}</div>
//                             <h4 className="font-bold text-lg mb-2">{svc.title}</h4>
//                             <p className="text-sm text-gray-400">{svc.desc}</p>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     );
// };

// export const AchievementsSection = () => {
//     return (
//         <section id="achievements" className="py-20 bg-[#060606] text-white border-t border-white/5 relative overflow-hidden">
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-cyan-900/20 blur-[120px] pointer-events-none"></div>

//             <div className="max-w-7xl mx-auto px-6 relative z-10">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
//                     <div><h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 mb-2 drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]">150+</h3><p className="text-gray-400 font-mono text-sm uppercase"><Briefcase className="inline w-4 h-4 mr-1 text-cyan-400" /> Projects Delivered</p></div>
//                     <div><h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 mb-2 drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]">50+</h3><p className="text-gray-400 font-mono text-sm uppercase"><Users className="inline w-4 h-4 mr-1 text-cyan-400" /> Educational Partners</p></div>
//                     <div><h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 mb-2 drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]">100+</h3><p className="text-gray-400 font-mono text-sm uppercase"><Award className="inline w-4 h-4 mr-1 text-cyan-400" /> Workshops Conducted</p></div>
//                     <div><h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 mb-2 drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]">10+</h3><p className="text-gray-400 font-mono text-sm uppercase"><Clock className="inline w-4 h-4 mr-1 text-cyan-400" /> Years Experience</p></div>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export const TestimonialsSection = () => {
//     const testimonials = [
//         { text: "I had a wonderful experience at Aju ED Solutions. The faculty is highly knowledgeable, supportive, and always ready to clear doubts with patience. Highly recommended!", author: "Sradha Sunilkumar" },
//         { text: "Thank you for helping me complete my mini project and teaching me patiently along the way. Learning was easy and enjoyable.", author: "Sreelekshmy" },
//         { text: "The infrastructure is modern, classrooms well-equipped, and the learning environment truly inspiring. The staff is professional and genuinely focused on student growth.", author: "Athul Ashok" },
//         { text: "Aju sir’s classes helped me score very good grades. The teaching style made even tough subjects easier to understand.", author: "Abhishek" },
//         { text: "The workshops bridged the gap between academics and industry. Learned how subjects interconnect and apply in real-world scenarios.", author: "Abin A S" },
//     ];

//     return (
//         <section id="testimonials" className="py-24 bg-black text-white relative border-t border-white/5 overflow-hidden">
//             <div className="max-w-7xl mx-auto px-6 relative z-10">
//                 <div className="text-center mb-16">
//                     <h2 className="text-yellow-500 font-mono tracking-widest uppercase mb-4 text-sm">Feedback</h2>
//                     <h3 className="text-4xl md:text-5xl font-bold">Client Testimonials</h3>
//                 </div>

//                 <div className="flex overflow-x-auto gap-6 pb-8 snap-x scrollbar-hide">
//                     {testimonials.map((t, i) => (
//                         <div key={i} className="min-w-[300px] md:min-w-[400px] bg-white/[0.03] border border-white/10 p-8 rounded-2xl snap-center hover:border-yellow-500/50 transition-colors">
//                             <div className="flex text-yellow-500 mb-4">
//                                 {[...Array(5)].map((_, idx) => <Star key={idx} size={18} className="fill-current" />)}
//                             </div>
//                             <p className="text-gray-300 italic mb-6">"{t.text}"</p>
//                             <p className="font-bold text-cyan-400">- {t.author}</p>
//                         </div>
//                     ))}
//                 </div>

//                 <div className="text-center mt-8">
//                     <a href="https://rb.gy/36cf7e" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
//                         See More Google Reviews
//                     </a>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export const ContactSection = () => {
//     return (
//         <section id="contact" className="py-24 bg-[#030303] text-white relative border-t border-white/5">
//             <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row gap-16">

//                 <div className="md:w-1/2">
//                     <h2 className="text-cyan-400 font-mono tracking-widest uppercase mb-4 text-sm">Engage Protocols</h2>
//                     <h3 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h3>
//                     <p className="text-gray-400 text-lg mb-10">
//                         Reach out to us to start building the future, together.
//                     </p>

//                     <div className="space-y-6">
//                         <div className="flex items-center gap-4 text-gray-300">
//                             <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 text-cyan-400"><Mail size={24} /></div>
//                             <div>
//                                 <div className="text-xs text-gray-500 font-mono mb-1">EMAIL</div>
//                                 <div className="font-medium text-cyan-100"><a href="mailto:info@ajuedsolutions.com" className="hover:text-cyan-400">info@ajuedsolutions.com</a></div>
//                             </div>
//                         </div>
//                         <div className="flex items-center gap-4 text-gray-300">
//                             <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 text-cyan-400"><Phone size={24} /></div>
//                             <div>
//                                 <div className="text-xs text-gray-500 font-mono mb-1">PHONE</div>
//                                 <div className="font-medium text-cyan-100"><a href="tel:+918301973970" className="hover:text-cyan-400">+91 8301 973 970</a></div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="md:w-1/2">
//                     <div className="bg-white/[0.02] border border-white/10 p-8 rounded-3xl relative overflow-hidden">
//                         <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none"></div>

//                         <form className="relative z-10 space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Form submitted successfully!"); }}>
//                             <input type="text" placeholder="Your Name" required className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors w-full text-white" />
//                             <input type="email" placeholder="Your Email" required className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors w-full text-white" />
//                             <textarea placeholder="Your Message" required rows={4} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors w-full resize-none text-white"></textarea>

//                             <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-xl p-4 flex gap-4 items-center">
//                                 <span className="font-mono text-xl tracking-[0.2em] font-bold text-cyan-400 select-none">AJU3D</span>
//                                 <input type="text" placeholder="Enter CAPTCHA" required className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 flex-grow focus:outline-none focus:border-cyan-500/50 transition-colors text-white" />
//                             </div>

//                             <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all uppercase text-sm mt-4">
//                                 Send Message
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// };
