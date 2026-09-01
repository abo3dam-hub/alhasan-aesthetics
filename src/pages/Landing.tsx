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
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { useI18n } from "@/i18n";

export default function Landing() {
  const { t, dir } = useI18n();
  const visibility = useQuery(api.homepageSettings.getHomepageSettings);
  const seoCMS = useQuery(api.homepageSettings.getSEOSettings);
  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);

  // Dynamic SEO
  useEffect(() => {
    const isArabic = dir === "rtl";
    const title = seoCMS?.siteTitleEn && seoCMS?.siteTitleAr
      ? (isArabic ? seoCMS.siteTitleAr : seoCMS.siteTitleEn)
      : (doctorSettings?.doctorNameEn
        ? `${doctorSettings.doctorNameEn} — Aesthetic & Plastic Surgery`
        : document.title);
    if (title) document.title = title;

    const desc = seoCMS?.metaDescriptionEn && seoCMS?.metaDescriptionAr
      ? (isArabic ? seoCMS.metaDescriptionAr : seoCMS.metaDescriptionEn)
      : undefined;
    if (desc) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", desc);
    }

    if (seoCMS?.ogImage) {
      let ogMeta = document.querySelector('meta[property="og:image"]');
      if (ogMeta) ogMeta.setAttribute("content", seoCMS.ogImage);
    }
  }, [seoCMS, doctorSettings, dir]);

  // Default all visible if no settings saved
  const isVisible = (section: string) => {
    if (!visibility) return true; // default to visible while loading
    return visibility[section] !== false;
  };

  return (
    <div className="min-h-screen">
      <GlassNavbar />
      <main>
        {isVisible("hero") && <Hero />}
        {isVisible("about") && <About />}
        {isVisible("procedures") && <Procedures />}
        {isVisible("beforeAfter") && <BeforeAfter />}
        {isVisible("testimonials") && <Testimonials />}
        {isVisible("faq") && <FAQ />}
        {isVisible("cta") && <CTA />}
        {isVisible("contact") && <Contact />}
      </main>
      <Footer />
    </div>
  );
}
