"use client";

import Nav from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import { ContactSection } from "@/src/components/sections/Contactsection";
import { ServicesSection } from "@/src/components/sections/Servicessection";
import { AboutSection } from "@/src/components/sections/Aboutsection";
import { CompanyProvider } from "@/src/components/sections/Index";
import PrismaLandingPage from "@/src/components/Hero";

export default function TechzoraPage() {
  return (
    <CompanyProvider initialCompany="techzora">
      <main className="min-h-screen" style={{ background: "#000", color: "#eef2ff" }}>
        <Nav />
        <PrismaLandingPage />
        <AboutSection />
        <ServicesSection />
        <ContactSection />
        <Footer />
      </main>
    </CompanyProvider>
  );
}
