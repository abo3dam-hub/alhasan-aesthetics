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

    // Twitter/X card meta
    const setOrCreateMeta = (attr: string, val: string) => {
      let meta = document.querySelector(`meta[name="${attr}"], meta[property="${attr}"]`);
      if (meta) meta.setAttribute("content", val);
      else { meta = document.createElement("meta"); meta.setAttribute("name", attr); meta.setAttribute("content", val); document.head.appendChild(meta); }
    };
    setOrCreateMeta("twitter:card", "summary_large_image");
    if (title) setOrCreateMeta("twitter:title", title);
    if (desc) setOrCreateMeta("twitter:description", desc);
    if (seoCMS?.ogImage) setOrCreateMeta("twitter:image", seoCMS.ogImage);
  }, [seoCMS, doctorSettings, dir]);

  // Default all visible if no settings saved
  const isVisible = (section: string) => {
    if (!visibility) return true; // default to visible while loading
    return visibility[section] !== false;
  };

  return (
    <div className="min-h-screen">
      <GlassNavbar />
      <a href="#home" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">
        Skip to main content
      </a>
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

      {/* MedicalOrganization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalBusiness",
            name: doctorSettings?.doctorNameEn || "Dr. Al Hasan Al Saiem",
            description: seoCMS?.metaDescriptionEn || "Aesthetic & Plastic Surgery by Dr. Al Hasan Al Saiem",
            telephone: doctorSettings?.phone || undefined,
            email: doctorSettings?.email || undefined,
            address: doctorSettings?.addressEn ? {
              "@type": "PostalAddress",
              streetAddress: doctorSettings.addressEn,
            } : undefined,
            medicalSpecialty: ["PlasticSurgery", "DermatologicCosmeticProcedures"],
            url: typeof window !== "undefined" ? window.location.origin : undefined,
          }),
        }}
      />
    </div>
  );
}
