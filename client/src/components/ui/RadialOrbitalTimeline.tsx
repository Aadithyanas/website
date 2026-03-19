// "use client";
// import { useState, useEffect, useRef } from "react";
// import { ArrowRight, Link, Zap } from "lucide-react";

// // ── Minimal inline Badge / Button / Card to avoid shadcn dependency issues ──
// const Badge = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
//   <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
//     {children}
//   </span>
// );

// const Button = ({
//   className = "", children, onClick, variant = "outline", size = "sm",
// }: {
//   className?: string; children: React.ReactNode;
//   onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
//   variant?: string; size?: string;
// }) => (
//   <button
//     className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-white/20 bg-transparent hover:bg-white/10 text-white/80 hover:text-white px-2 py-0 h-6 text-xs ${className}`}
//     onClick={onClick}
//   >
//     {children}
//   </button>
// );

// const Card = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
//   <div className={`rounded-lg border bg-black/90 text-white shadow-sm ${className}`}>{children}</div>
// );
// const CardHeader = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
//   <div className={`flex flex-col space-y-1.5 p-4 pb-2 ${className}`}>{children}</div>
// );
// const CardTitle = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
//   <h3 className={`text-sm font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
// );
// const CardContent = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
//   <div className={`p-4 pt-0 ${className}`}>{children}</div>
// );

// // ── Types ──────────────────────────────────────────────────────────────────────
// interface TimelineItem {
//   id: number;
//   title: string;
//   date: string;
//   content: string;
//   category: string;
//   icon: React.ElementType;
//   relatedIds: number[];
//   status: "completed" | "in-progress" | "pending";
//   energy: number;
// }

// interface RadialOrbitalTimelineProps {
//   timelineData: TimelineItem[];
// }

// // ── Component ─────────────────────────────────────────────────────────────────
// export default function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
//   const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
//   const [rotationAngle, setRotationAngle] = useState<number>(0);
//   const [autoRotate, setAutoRotate] = useState<boolean>(true);
//   const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
//   const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const orbitRef = useRef<HTMLDivElement>(null);
//   const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

//   const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (e.target === containerRef.current || e.target === orbitRef.current) {
//       setExpandedItems({});
//       setActiveNodeId(null);
//       setPulseEffect({});
//       setAutoRotate(true);
//     }
//   };

//   const toggleItem = (id: number) => {
//     setExpandedItems((prev) => {
//       const newState: Record<number, boolean> = {};
//       Object.keys(prev).forEach((key) => { newState[parseInt(key)] = false; });
//       newState[id] = !prev[id];

//       if (!prev[id]) {
//         setActiveNodeId(id);
//         setAutoRotate(false);
//         const related = timelineData.find((i) => i.id === id)?.relatedIds ?? [];
//         const pulse: Record<number, boolean> = {};
//         related.forEach((r) => { pulse[r] = true; });
//         setPulseEffect(pulse);
//         const idx = timelineData.findIndex((i) => i.id === id);
//         setRotationAngle(270 - (idx / timelineData.length) * 360);
//       } else {
//         setActiveNodeId(null);
//         setAutoRotate(true);
//         setPulseEffect({});
//       }
//       return newState;
//     });
//   };

//   useEffect(() => {
//     if (!autoRotate) return;
//     const t = setInterval(() => {
//       setRotationAngle((p) => Number(((p + 0.3) % 360).toFixed(3)));
//     }, 50);
//     return () => clearInterval(t);
//   }, [autoRotate]);

//   const calcPos = (index: number, total: number) => {
//     const angle = ((index / total) * 360 + rotationAngle) % 360;
//     const radius = 200;
//     const rad = (angle * Math.PI) / 180;
//     return {
//       x: radius * Math.cos(rad),
//       y: radius * Math.sin(rad),
//       zIndex: Math.round(100 + 50 * Math.cos(rad)),
//       opacity: Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(rad)) / 2))),
//     };
//   };

//   const isRelated = (id: number) => {
//     if (!activeNodeId) return false;
//     return (timelineData.find((i) => i.id === activeNodeId)?.relatedIds ?? []).includes(id);
//   };

//   const statusStyles = (s: TimelineItem["status"]) =>
//     s === "completed"   ? "text-white bg-black border-white" :
//     s === "in-progress" ? "text-black bg-white border-black" :
//                           "text-white bg-black/40 border-white/50";

//   return (
//     <div
//       className="w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden"
//       ref={containerRef}
//       onClick={handleContainerClick}
//     >
//       <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
//         <div
//           className="absolute w-full h-full flex items-center justify-center"
//           ref={orbitRef}
//           style={{ perspective: "1000px" }}
//         >
//           {/* Center orb */}
//           <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 animate-pulse flex items-center justify-center z-10">
//             <div className="absolute w-20 h-20 rounded-full border border-white/20 animate-ping opacity-70" />
//             <div className="absolute w-24 h-24 rounded-full border border-white/10 animate-ping opacity-50" style={{ animationDelay: "0.5s" }} />
//             <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md" />
//           </div>

//           {/* Orbit ring */}
//           <div className="absolute w-96 h-96 rounded-full border border-white/10" />

//           {/* Nodes */}
//           {timelineData.map((item, index) => {
//             const pos = calcPos(index, timelineData.length);
//             const isExp = expandedItems[item.id];
//             const isPulse = pulseEffect[item.id];
//             const rel = isRelated(item.id);
//             const Icon = item.icon;

//             return (
//               <div
//                 key={item.id}
//                 ref={(el) => (nodeRefs.current[item.id] = el)}
//                 className="absolute transition-all duration-700 cursor-pointer"
//                 style={{
//                   transform: `translate(${pos.x}px, ${pos.y}px)`,
//                   zIndex: isExp ? 200 : pos.zIndex,
//                   opacity: isExp ? 1 : pos.opacity,
//                 }}
//                 onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }}
//               >
//                 {/* Energy aura */}
//                 <div
//                   className={`absolute rounded-full -inset-1 ${isPulse ? "animate-pulse" : ""}`}
//                   style={{
//                     background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
//                     width: `${item.energy * 0.5 + 40}px`,
//                     height: `${item.energy * 0.5 + 40}px`,
//                     left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
//                     top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
//                   }}
//                 />

//                 {/* Icon circle */}
//                 <div className={`
//                   w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
//                   ${isExp ? "bg-white text-black border-white shadow-lg shadow-white/30 scale-150" :
//                     rel  ? "bg-white/50 text-black border-white animate-pulse" :
//                            "bg-black text-white border-white/40"}
//                 `}>
//                   <Icon size={16} />
//                 </div>

//                 {/* Label */}
//                 <div className={`absolute top-12 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300 ${isExp ? "text-white scale-125" : "text-white/70"}`}>
//                   {item.title}
//                 </div>

//                 {/* Expanded card */}
//                 {isExp && (
//                   <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-64 backdrop-blur-lg border-white/30 shadow-xl shadow-white/10 overflow-visible">
//                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50" />
//                     <CardHeader>
//                       <div className="flex justify-between items-center">
//                         <Badge className={`px-2 text-xs ${statusStyles(item.status)}`}>
//                           {item.status === "completed" ? "COMPLETE" : item.status === "in-progress" ? "IN PROGRESS" : "PENDING"}
//                         </Badge>
//                         <span className="text-xs font-mono text-white/50">{item.date}</span>
//                       </div>
//                       <CardTitle className="mt-2">{item.title}</CardTitle>
//                     </CardHeader>
//                     <CardContent className="text-xs text-white/80">
//                       <p>{item.content}</p>

//                       <div className="mt-4 pt-3 border-t border-white/10">
//                         <div className="flex justify-between items-center text-xs mb-1">
//                           <span className="flex items-center"><Zap size={10} className="mr-1" />Energy</span>
//                           <span className="font-mono">{item.energy}%</span>
//                         </div>
//                         <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
//                           <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${item.energy}%` }} />
//                         </div>
//                       </div>

//                       {item.relatedIds.length > 0 && (
//                         <div className="mt-4 pt-3 border-t border-white/10">
//                           <div className="flex items-center mb-2">
//                             <Link size={10} className="text-white/70 mr-1" />
//                             <h4 className="text-xs uppercase tracking-wider font-medium text-white/70">Connected</h4>
//                           </div>
//                           <div className="flex flex-wrap gap-1">
//                             {item.relatedIds.map((relId) => {
//                               const rel = timelineData.find((i) => i.id === relId);
//                               return (
//                                 <Button key={relId} onClick={(e) => { e.stopPropagation(); toggleItem(relId); }}>
//                                   {rel?.title}
//                                   <ArrowRight size={8} className="ml-1 text-white/60" />
//                                 </Button>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }