"use client";

import React, { useEffect, useState, Suspense } from "react";
import Nav from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import { CompanyProvider } from "@/src/components/sections/Index";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function OrderDetailsContent() {
  const searchParams = useSearchParams();
  const [item, setItem] = useState<string | null>(null);
  const [comment, setComment] = useState<string | null>(null);

  useEffect(() => {
    setItem(searchParams.get("item"));
    setComment(searchParams.get("comment"));
  }, [searchParams]);

  // Determine the image based on the item
  let imageSrc = "/images/products/3d_nameboard.png";
  if (item === "Articulated Cobra") imageSrc = "/images/products/3d_cobra.png";
  if (item === "Articulated Python") imageSrc = "/images/products/3d_python.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl"
    >
      <h1 className="text-3xl font-bold mb-8 text-center text-indigo-300">Custom Order Details</h1>
      
      {item ? (
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="relative w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-white/10">
            <Image src={imageSrc} alt={item} fill className="object-cover" />
          </div>
          
          <div className="w-full md:w-1/2 space-y-6">
            <div>
              <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-1">Product</h2>
              <p className="text-2xl font-bold">{item}</p>
            </div>
            
            <div>
              <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-1">Customer Comment / Request</h2>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <p className="text-indigo-200 italic">"{comment || "No special requests."}"</p>
              </div>
            </div>

            <div className="pt-4">
              <button className="w-full px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors uppercase tracking-widest text-sm">
                Accept & Process Order
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-400 py-12">
          <p>No order details found in URL.</p>
        </div>
      )}
    </motion.div>
  );
}

export default function OrderDetailsPage() {
  return (
    <CompanyProvider initialCompany="techzora">
      <main className="min-h-screen flex flex-col" style={{ background: "#000", color: "#eef2ff" }}>
        <Nav />
        
        <div className="flex-grow pt-32 pb-20 bg-gradient-to-b from-black to-indigo-950/20 flex items-center justify-center">
          <div className="max-w-3xl w-full mx-auto px-4 sm:px-6">
            <Suspense fallback={<div className="text-center text-indigo-300 py-12">Loading...</div>}>
              <OrderDetailsContent />
            </Suspense>
          </div>
        </div>

        <Footer />
      </main>
    </CompanyProvider>
  );
}
