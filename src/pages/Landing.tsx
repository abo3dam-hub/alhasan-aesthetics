import GlassNavbar from "@/components/GlassNavbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Procedures from "@/components/sections/Procedures";
import BeforeAfter from "@/components/sections/BeforeAfter";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <GlassNavbar />
      <main>
        <Hero />
        <About />
        <Procedures />
        <BeforeAfter />
        <Testimonials />
        <FAQ />
        <Contact />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
