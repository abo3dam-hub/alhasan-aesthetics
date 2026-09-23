import GlassNavbar from "@/components/GlassNavbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import InformationCard from "@/components/sections/InformationCard";
import Videos from "@/components/sections/Videos";
import Procedures from "@/components/sections/Procedures";
import BeforeAfter from "@/components/sections/BeforeAfter";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import CTA from "@/components/sections/CTA";
import InstagramSection from "@/components/sections/Instagram";
import Footer from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { useI18n } from "@/i18n";
import { safeJsonLd } from "@/lib/jsonLd";

/**
 * Areas served WITHOUT a physical clinic — the honest, Google-approved way to
 * appear in searches from Tartus, Beirut and Iraq. Never emit these as
 * addresses; only the real clinics (dashboard → Settings → Clinic Locations)
 * get physical addresses in the structured data.
 */
const AREA_SERVED = [
  { "@type": "City", name: "Tartus", containedInPlace: { "@type": "Country", name: "Syria" } },
  { "@type": "City", name: "Beirut", containedInPlace: { "@type": "Country", name: "Lebanon" } },
  { "@type": "Country", name: "Iraq" },
  { "@type": "Country", name: "Syria" },
  { "@type": "Country", name: "Lebanon" },
  { "@type": "Country", name: "United Arab Emirates" },
];

const CITY_COUNTRY: Record<string, string> = {
  Damascus: "Syria",
  Latakia: "Syria",
  Dubai: "United Arab Emirates",
};

/** Minimal shape of the `doctor` site-settings value (stored as v.any()). */
interface DoctorSettingsLike {
  doctorNameEn?: string;
  phone?: string;
  email?: string;
  addressEn?: string;
  clinics?: Array<{
    nameAr?: string;
    nameEn?: string;
    city?: string;
    addressAr?: string;
    addressEn?: string;
    phone?: string;
  }>;
}

/** MedicalClinic JSON-LD for the real clinics, falling back to the legacy single MedicalBusiness node. */
function buildClinicJsonLd(doctorSettings: DoctorSettingsLike | null | undefined, seoDescription: string | undefined, origin: string | undefined) {
  const clinics = Array.isArray(doctorSettings?.clinics)
    ? doctorSettings.clinics.filter((c) => c && (c.nameEn || c.nameAr || c.city))
    : [];
  const specialty = ["PlasticSurgery"];
  if (clinics.length > 0) {
    return {
      "@context": "https://schema.org",
      "@graph": clinics.map((c) => {
        const node: Record<string, unknown> = {
          "@type": "MedicalClinic",
          name: c.nameEn || c.nameAr || doctorSettings?.doctorNameEn || "Dr. Al Hasan Al Saiem",
          areaServed: AREA_SERVED,
          medicalSpecialty: specialty,
          url: origin,
        };
        if (c.addressEn || c.city) {
          node.address = {
            "@type": "PostalAddress",
            ...(c.addressEn ? { streetAddress: c.addressEn } : {}),
            ...(c.city ? { addressLocality: c.city } : {}),
            ...(c.city && CITY_COUNTRY[c.city] ? { addressCountry: CITY_COUNTRY[c.city] } : {}),
          };
        }
        const phone = c.phone || doctorSettings?.phone;
        if (phone) node.telephone = phone;
        return node;
      }),
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: doctorSettings?.doctorNameEn || "Dr. Al Hasan Al Saiem",
    description: seoDescription || "Aesthetic & Plastic Surgery by Dr. Al Hasan Al Saiem",
    telephone: doctorSettings?.phone || undefined,
    email: doctorSettings?.email || undefined,
    address: doctorSettings?.addressEn ? {
      "@type": "PostalAddress",
      streetAddress: doctorSettings.addressEn,
    } : undefined,
    areaServed: AREA_SERVED,
    medicalSpecialty: specialty,
    url: origin,
  };
}

export default function Landing() {
  const { dir } = useI18n();
  const visibility = useQuery(api.homepageSettings.getHomepageSettings);
  const seoCMS = useQuery(api.homepageSettings.getSEOSettings);
  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);

  // Dynamic SEO
  useEffect(() => {
    const isArabic = dir === "rtl";
    const title = isArabic
      ? (seoCMS?.siteTitleAr || (doctorSettings?.doctorNameEn ? `${doctorSettings.doctorNameEn} — Aesthetic & Plastic Surgery` : document.title))
      : (seoCMS?.siteTitleEn || (doctorSettings?.doctorNameEn ? `${doctorSettings.doctorNameEn} — Aesthetic & Plastic Surgery` : document.title));
    if (title) document.title = title;

    const desc = isArabic
      ? (seoCMS?.metaDescriptionAr || undefined)
      : (seoCMS?.metaDescriptionEn || undefined);
    if (desc) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", desc);
    }

    if (seoCMS?.ogImage) {
      const ogMeta = document.querySelector('meta[property="og:image"]');
      if (ogMeta) ogMeta.setAttribute("content", seoCMS.ogImage);
    }

    // hreflang: tell search engines which URL serves which language version
    const setOrCreateHreflang = (hreflang: string, href: string) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "alternate";
        link.setAttribute("hreflang", hreflang);
        document.head.appendChild(link);
      }
      link.href = href;
    };
    const pageOrigin = window.location.origin;
    setOrCreateHreflang("ar", `${pageOrigin}/ar`);
    setOrCreateHreflang("en", `${pageOrigin}/en`);
    setOrCreateHreflang("x-default", `${pageOrigin}/`);

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
        <div className="cvv">{isVisible("about") && <About />}</div>
        <div className="cvv">
          {isVisible("informationCard") && (
            <ErrorBoundary>
              <InformationCard />
            </ErrorBoundary>
          )}
        </div>
        <div className="cvv">{isVisible("videos") && <Videos />}</div>
        <div className="cvv">{isVisible("procedures") && <Procedures />}</div>
        <div className="cvv">{isVisible("beforeAfter") && <BeforeAfter />}</div>
        <div className="cvv">{isVisible("testimonials") && <Testimonials />}</div>
        <div className="cvv">{isVisible("faq") && <FAQ />}</div>
        <div className="cvv">{isVisible("cta") && <CTA />}</div>
        <div className="cvv">{isVisible("contact") && <Contact />}</div>
        {isVisible("instagram") && <InstagramSection />}
      </main>
      <Footer />

      {/* MedicalClinic Structured Data — real clinics only; served areas via areaServed */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(buildClinicJsonLd(
            doctorSettings,
            seoCMS?.metaDescriptionEn,
            typeof window !== "undefined" ? window.location.origin : undefined,
          )),
        }}
      />
    </div>
  );
}
