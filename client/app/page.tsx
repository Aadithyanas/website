import Nav from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import Hero from "@/src/components/Hero";
import {
  AboutSection,
  CompaniesSection,
  InitiativesSection,
  ServicesSection,
  AchievementsSection,
  TestimonialsSection,
  ContactSection,
  CompanyProvider 
} from "../src/components/sections/Index";

export default function Home() {
  return (
    <CompanyProvider>
    <main className="min-h-screen" style={{ background: "#000", color: "#eef2ff" }}>
      <Nav />
      <Hero />
      <AboutSection />
      <CompaniesSection />
      {/* <InitiativesSection /> */}
      <ServicesSection />
      {/* <AchievementsSection /> */}
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
    </CompanyProvider>
  );
}
