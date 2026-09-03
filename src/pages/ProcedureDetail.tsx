import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { useMemo, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  HeartPulse,
  BadgeCheck,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassNavbar from "@/components/GlassNavbar";
import { ResolvedImage } from "@/components/ResolvedImage";



export default function ProcedureDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";

  const convexProcedure = useQuery(
    api.procedures.getBySlug,
    slug ? { slug } : "skip"
  );
  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);

  const phoneNumber = useMemo(() => {
    const raw = doctorSettings?.phone || "";
    return raw.replace(/[^0-9+]/g, "");
  }, [doctorSettings]);

  const whatsappNumber = useMemo(() => {
    const raw = doctorSettings?.whatsappNumber || "";
    return raw.replace(/[^0-9]/g, "");
  }, [doctorSettings]);

  // Use only CMS data from Convex
  const displayData = convexProcedure ?? null;

  // Derived values — computed here so useEffect can reference them safely
  const title = displayData ? (isRtl ? displayData.titleAr : displayData.titleEn) : "";
  const description = displayData ? (isRtl ? displayData.descriptionAr : displayData.descriptionEn) : "";
  const longDescription = displayData
    ? (isRtl ? displayData.longDescriptionAr : displayData.longDescriptionEn)
    : "";
  const gallery = displayData?.gallery || [];

  // Dynamic SEO — must be called BEFORE any early returns (React Hook rules)
  useEffect(() => {
    if (!displayData) return;

    const seoTitle = isRtl
      ? (displayData.seoTitleAr || title)
      : (displayData.seoTitleEn || title);
    document.title = `${seoTitle} — Dr. Al Hasan`;

    const seoDesc = isRtl
      ? (displayData.seoDescriptionAr || description)
      : (displayData.seoDescriptionEn || description);
    if (seoDesc) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', seoDesc);
    }

    if (displayData.ogImage) {
      let og = document.querySelector('meta[property="og:image"]');
      if (og) og.setAttribute('content', displayData.ogImage);
    }

    // Twitter card
    const setOrCreateMeta = (attr: string, val: string) => {
      let meta = document.querySelector(`meta[name="${attr}"], meta[property="${attr}"]`);
      if (meta) meta.setAttribute("content", val);
      else { meta = document.createElement("meta"); meta.setAttribute("name", attr); meta.setAttribute("content", val); document.head.appendChild(meta); }
    };
    setOrCreateMeta("twitter:card", "summary_large_image");
    setOrCreateMeta("twitter:title", seoTitle);
    if (seoDesc) setOrCreateMeta("twitter:description", seoDesc);
    if (displayData.ogImage) setOrCreateMeta("twitter:image", displayData.ogImage);
  }, [displayData, isRtl, title, description]);

  if (convexProcedure === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground" dir={dir}>
        <GlassNavbar />
        <h1 className="text-2xl font-bold mb-4">
          {isRtl ? "الإجراء غير موجود" : "Procedure not found"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isRtl
            ? "الإجراء الذي تبحث عنه غير متاح حالياً."
            : "The procedure you're looking for is not available."}
        </p>
        <Link to="/">
          <Button variant="outline">
            {isRtl ? "العودة للرئيسية" : "Back to Home"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <GlassNavbar />

      {/* Hero Banner */}
      <section className="pt-24 pb-16 hero-gradient">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {isRtl ? (
                <>
                  العودة للرئيسية
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </>
              )}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm font-medium text-primary mb-6">
              <BadgeCheck className="h-4 w-4" />
              {isRtl ? "إجراء طبي متخصص" : "Specialized Procedure"}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-bold text-foreground mb-4">
              {title}
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl">
              {description}
            </p>

            {displayData.price && (
              <p className="mt-4 text-xl font-semibold text-primary">{displayData.price}</p>
            )}
          </motion.div>

          {/* Hero Image */}
          {displayData.image && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-8 rounded-2xl overflow-hidden glass-elevated"
            >
              <ResolvedImage ref={displayData.image} alt={title} imgClassName="w-full h-64 sm:h-80 lg:h-96 object-cover" lazy={false} />
            </motion.div>
          )}

          {/* Quick Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10"
          >
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "مدة الإجراء" : "Duration"}
                </p>
                <p className="font-semibold text-foreground">
                  {displayData.duration}
                </p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "فترة التعافي" : "Recovery"}
                </p>
                <p className="font-semibold text-foreground">
                  {displayData.recovery}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full Description */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-elevated rounded-3xl p-8 sm:p-12"
          >
            <h2 className="text-2xl font-serif-luxury font-bold text-foreground mb-6">
              {isRtl ? "تفاصيل الإجراء" : "Procedure Details"}
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
              {longDescription.split("\n").map((paragraph, i) => (
                <p key={i} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Before & After */}
      {(displayData.beforeImage || displayData.afterImage) && (
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl font-serif-luxury font-bold text-foreground mb-8">
                {isRtl ? "قبل وبعد" : "Before & After"}
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {displayData.beforeImage && (
                  <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="relative aspect-square">
                      <ResolvedImage ref={displayData.beforeImage} alt={`${title} - ${isRtl ? "قبل" : "Before"}`} imgClassName="w-full h-full object-cover" lazy={false} />
                      <div className="absolute top-3 start-3 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm">{isRtl ? "قبل" : "Before"}</div>
                    </div>
                  </div>
                )}
                {displayData.afterImage && (
                  <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="relative aspect-square">
                      <ResolvedImage ref={displayData.afterImage} alt={`${title} - ${isRtl ? "بعد" : "After"}`} imgClassName="w-full h-full object-cover" lazy={false} />
                      <div className="absolute top-3 end-3 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm">{isRtl ? "بعد" : "After"}</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl font-serif-luxury font-bold text-foreground mb-8">
                {isRtl ? "معرض الصور" : "Gallery"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {gallery.map((url, i) => (
                  <div key={i} className="glass-card rounded-2xl overflow-hidden">
                    <div className="aspect-square">
                      <ResolvedImage ref={url} alt={`${title} gallery ${i + 1}`} imgClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-elevated rounded-3xl p-8 sm:p-12 text-center glow-champagne"
          >
            <h3 className="text-xl sm:text-2xl font-serif-luxury font-bold text-foreground mb-4">
              {isRtl
                ? "هل تفكر في هذا الإجراء؟"
                : "Thinking about this procedure?"}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {isRtl
                ? "احجز استشارتك المجانية مع د. الحسن الصايم لتعرف إذا كان هذا الإجراء مناسب لك."
                : "Book your free consultation with Dr. Al Hasan Al Saiem to find out if this procedure is right for you."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/consultation?procedure=${slug}`}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base gap-2">
                  <Calendar className="h-4 w-4" />
                  {isRtl ? "احجز استشارتك المجانية" : "Book Free Consultation"}
                </Button>
              </Link>
              <a href={phoneNumber ? `tel:${phoneNumber}` : `/consultation`}>
                <Button
                  variant="outline"
                  className="rounded-full px-8 py-6 text-base gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {isRtl ? "اتصل بنا" : "Call Us"}
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Person / Physician Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: isRtl ? (doctorSettings?.doctorNameAr || "د. الحسن الصايم") : (doctorSettings?.doctorNameEn || "Dr. Al Hasan Al Saiem"),
            jobTitle: isRtl ? "استشاري جراحة تجميلية" : "Aesthetic & Plastic Surgery Consultant",
            medicalSpecialty: ["PlasticSurgery", "DermatologicCosmeticProcedures"],
            telephone: doctorSettings?.phone || undefined,
            email: doctorSettings?.email || undefined,
          }),
        }}
      />

      {/* BreadcrumbList Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: isRtl ? "الرئيسية" : "Home",
                item: typeof window !== "undefined" ? window.location.origin : "",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: isRtl ? "الإجراءات" : "Procedures",
                item: typeof window !== "undefined" ? `${window.location.origin}/procedures` : "",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: title,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
