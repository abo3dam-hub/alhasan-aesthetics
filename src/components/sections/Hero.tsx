import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Star, Award } from "lucide-react";
import { Link } from "react-router";
import doctorImg from "/assets/1.jpg";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function Hero() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);
  const heroCMS = useQuery(api.homepageSettings.getHeroSettings);

  // CMS → fallback to translations
  const isArabic = isRtl;
  const badge = heroCMS?.badgeAr && heroCMS?.badgeEn
    ? (isArabic ? heroCMS.badgeAr : heroCMS.badgeEn)
    : t.hero.badge;
  const heroTitle = heroCMS?.titleAr && heroCMS?.titleEn
    ? (isArabic ? heroCMS.titleAr : heroCMS.titleEn)
    : (doctorSettings?.heroTitleAr || t.hero.title);
  const heroHighlight = heroCMS?.subtitleAr && heroCMS?.subtitleEn
    ? (isArabic ? heroCMS.subtitleAr : heroCMS.subtitleEn)
    : (doctorSettings?.heroSubtitleAr || t.hero.titleHighlight);
  const heroDescription = heroCMS?.descriptionAr && heroCMS?.descriptionEn
    ? (isArabic ? heroCMS.descriptionAr : heroCMS.descriptionEn)
    : t.hero.subtitle;
  const ctaText = heroCMS?.ctaTextAr && heroCMS?.ctaTextEn
    ? (isArabic ? heroCMS.ctaTextAr : heroCMS.ctaTextEn)
    : t.hero.cta;
  const ctaSecondaryText = heroCMS?.ctaSecondaryTextAr && heroCMS?.ctaSecondaryTextEn
    ? (isArabic ? heroCMS.ctaSecondaryTextAr : heroCMS.ctaSecondaryTextEn)
    : t.hero.ctaSecondary;
  const heroImage = heroCMS?.image || doctorImg;
  const doctorName = doctorSettings?.doctorNameEn || "Dr. Al Hasan";
  const doctorNameAr = doctorSettings?.doctorNameAr || "د. الحسن الصايم";
  const heroImageAlt = isArabic
    ? (heroCMS?.imageAltAr || heroCMS?.imageAltEn || doctorNameAr || "د. الحسن الصايم")
    : (heroCMS?.imageAltEn || heroCMS?.imageAltAr || doctorName || "Dr. Al Hasan");

  // Trust badges - CMS or translation defaults
  const defaultTrustBadges = [
    { labelAr: t.hero.trust1, labelEn: t.hero.trust1, icon: "award" },
    { labelAr: t.hero.trust2, labelEn: t.hero.trust2, icon: "star" },
    { labelAr: t.hero.trust3, labelEn: t.hero.trust3, icon: "sparkles" },
  ];
  const trustBadges = heroCMS?.trustBadges?.length > 0
    ? heroCMS.trustBadges.filter((b: any) => b.enabled !== false)
    : defaultTrustBadges;

  const trustIconMap: Record<string, typeof Award> = { award: Award, star: Star, sparkles: Sparkles };

  return (
    <section
      id="home"
      className="relative min-h-[500px] md:min-h-[75vh] lg:min-h-[80vh] flex items-center hero-gradient overflow-hidden"
    >
      {/* Decorative orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(197, 168, 130, 0.15)" }} />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(212, 196, 173, 0.12)" }} />
      <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full blur-2xl pointer-events-none" style={{ background: "rgba(139, 115, 85, 0.05)" }} />

      {/* Glass decorative panel */}
      <div className="absolute top-32 end-8 lg:end-20 w-48 h-48 glass-subtle rounded-3xl rotate-12 opacity-60 hidden md:block" />
      <div className="absolute bottom-24 start-8 lg:start-16 w-32 h-32 glass-subtle rounded-2xl -rotate-6 opacity-40 hidden md:block" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-12 sm:pt-32 sm:pb-20 lg:pt-32 lg:pb-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
          dir={dir}
        >
          {/* Badge */}
          {(heroCMS?.badgeEnabled !== false) && (
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs sm:text-sm font-medium text-muted-foreground mb-4 sm:mb-8">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {badge}
              </span>
            </motion.div>
          )}

          {/* Heading */}
          <motion.h1 variants={item} className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            <span className="block text-foreground">{heroTitle}</span>
            <span className="block mt-1 sm:mt-2 bg-gradient-to-l from-primary via-secondary to-primary bg-clip-text text-transparent font-serif-luxury">
              {heroHighlight}
            </span>
          </motion.h1>

          {/* Subtitle */}
          {heroDescription && (
            <motion.p
              variants={item}
              className="mt-4 sm:mt-8 text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-xl"
            >
              {heroDescription}
            </motion.p>
          )}

          {/* CTAs */}
          <motion.div
            variants={item}
            className="mt-6 sm:mt-10 flex flex-wrap gap-3 sm:gap-4"
          >
            {(heroCMS?.ctaEnabled !== false) && (
              <Link to="/consultation">
                <Button
                  size="lg"
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base"
                >
                  {ctaText}
                  <Arrow className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {(heroCMS?.ctaSecondaryEnabled !== false) && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("procedures")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-full glass-card hover:bg-white/60 px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base border-border/60"
              >
                {ctaSecondaryText}
              </Button>
            )}
          </motion.div>

          {/* Trust Badges */}
          {trustBadges.length > 0 && (
            <motion.div
              variants={item}
              className="mt-8 sm:mt-16 flex flex-wrap gap-3 sm:gap-6"
            >
              {trustBadges.map((badge: any, i: number) => {
                const IconComp = trustIconMap[badge.icon || "award"] || Award;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 glass-card rounded-2xl"
                  >
                    <div className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 shrink-0">
                      <IconComp className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground/80 whitespace-nowrap">
                      {isArabic ? badge.labelAr : badge.labelEn}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

      </div>
    </section>
  );
}
