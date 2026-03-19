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
    <main className="bg-black min-h-screen text-white">
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
