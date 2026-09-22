import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { m as motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Star, Award } from "lucide-react";
import { Link } from "react-router";
import { useRef } from "react";
import { trackEvent } from "@/lib/track";
import { cn } from "@/lib/utils";

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

interface TrustBadgeInfo {
  labelAr?: string;
  labelEn?: string;
  icon?: string;
  enabled?: boolean;
}

/** Luxury masked word-by-word reveal. Each word rises from behind an
 *  overflow mask with a soft expo ease; the pb/-mb compensation keeps
 *  Arabic descenders from clipping at rest. */
function RevealWords({
  text,
  delay = 0,
  wordClassName,
}: {
  text: string;
  delay?: number;
  wordClassName?: string;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span className="flex flex-wrap gap-x-[0.26em]" aria-label={text}>
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em]"
        >
          <motion.span
            className={cn("inline-block will-change-transform", wordClassName)}
            initial={{ y: "115%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
              delay: delay + i * 0.06,
            }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);
  const heroCMS = useQuery(api.homepageSettings.getHeroSettings);

  // CMS → per-language fallback (each language checked independently)
  const isArabic = isRtl;
  const badge = isArabic
    ? (heroCMS?.badgeAr || t.hero.badge)
    : (heroCMS?.badgeEn || t.hero.badge);
  const heroTitle = isArabic
    ? (heroCMS?.titleAr || doctorSettings?.heroTitleAr || t.hero.title)
    : (heroCMS?.titleEn || doctorSettings?.heroTitleEn || t.hero.title);
  const heroHighlight = isArabic
    ? (heroCMS?.subtitleAr || doctorSettings?.heroSubtitleAr || t.hero.titleHighlight)
    : (heroCMS?.subtitleEn || doctorSettings?.heroSubtitleEn || t.hero.titleHighlight);
  const heroDescription = isArabic
    ? (heroCMS?.descriptionAr || t.hero.subtitle)
    : (heroCMS?.descriptionEn || t.hero.subtitle);
  const ctaText = isArabic
    ? (heroCMS?.ctaTextAr || t.hero.cta)
    : (heroCMS?.ctaTextEn || t.hero.cta);
  const ctaSecondaryText = isArabic
    ? (heroCMS?.ctaSecondaryTextAr || t.hero.ctaSecondary)
    : (heroCMS?.ctaSecondaryTextEn || t.hero.ctaSecondary);

  // Trust badges - CMS or translation defaults
  const defaultTrustBadges = [
    { labelAr: t.hero.trust1, labelEn: t.hero.trust1, icon: "award" },
    { labelAr: t.hero.trust2, labelEn: t.hero.trust2, icon: "star" },
    { labelAr: t.hero.trust3, labelEn: t.hero.trust3, icon: "sparkles" },
  ];
  const trustBadges: TrustBadgeInfo[] = heroCMS?.trustBadges?.length > 0
    ? heroCMS.trustBadges.filter((b: TrustBadgeInfo) => b.enabled !== false)
    : defaultTrustBadges;

  const trustIconMap: Record<string, typeof Award> = { award: Award, star: Star, sparkles: Sparkles };

  // Light parallax drift on the decorative elements as the user scrolls away
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const orb3Y = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const glass1Y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const glass2Y = useTransform(scrollYProgress, [0, 1], [0, 30]);
  // Gentle drift of the whole text block as the hero scrolls away
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 70]);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-[500px] md:min-h-[75vh] lg:min-h-[80vh] flex items-center hero-gradient overflow-hidden"
    >
      {/* Decorative orbs — subtle parallax */}
      <motion.div style={{ y: orb1Y, background: "rgba(197, 168, 130, 0.15)" }} className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <motion.div style={{ y: orb2Y, background: "rgba(212, 196, 173, 0.12)" }} className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <motion.div style={{ y: orb3Y, background: "rgba(139, 115, 85, 0.05)" }} className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />

      {/* Champagne radial glows — extra depth (decorative only) */}
      <motion.div
        style={{ y: orb1Y, background: "radial-gradient(circle, rgba(197,168,130,0.30) 0%, rgba(197,168,130,0) 70%)" }}
        className="absolute -top-24 -right-24 w-[34rem] h-[34rem] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <motion.div
        style={{ y: orb2Y, background: "radial-gradient(circle, rgba(212,196,173,0.28) 0%, rgba(212,196,173,0) 70%)" }}
        className="absolute -bottom-32 -left-24 w-[30rem] h-[30rem] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Glass decorative panels */}
      <motion.div style={{ y: glass1Y }} className="absolute top-32 end-8 lg:end-20 w-48 h-48 glass-subtle rounded-3xl rotate-12 opacity-60 hidden md:block" aria-hidden="true" />
      <motion.div style={{ y: glass2Y }} className="absolute bottom-24 start-8 lg:start-16 w-32 h-32 glass-subtle rounded-2xl -rotate-6 opacity-40 hidden md:block" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-12 sm:pt-32 sm:pb-20 lg:pt-32 lg:pb-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{ y: contentY }}
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

          {/* Heading — masked word-by-word reveal */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
          >
            <span className="block text-foreground">
              <RevealWords text={heroTitle} delay={0.35} />
            </span>
            <span className="block mt-1 sm:mt-2 font-serif-luxury">
              <RevealWords
                text={heroHighlight}
                delay={0.75}
                wordClassName="bg-gradient-to-l from-primary via-secondary to-primary bg-clip-text text-transparent"
              />
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
              <Link to="/consultation" onClick={() => trackEvent("cta", "hero-book")}>
                <Button
                  size="lg"
                  className="rounded-full btn-sheen bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base"
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
              {trustBadges.map((badge: TrustBadgeInfo, i: number) => {
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

      {/* Scroll hint — mouse + bouncing dot (hidden on small screens) */}
      <div
        className="absolute bottom-5 left-1/2 hidden md:flex flex-col items-center text-primary/60 pointer-events-none"
        aria-hidden="true"
      >
        <span className="h-9 w-5 rounded-full border border-primary/30 flex justify-center pt-1.5">
          <span className="h-1.5 w-1 rounded-full bg-current animate-bounce" />
        </span>
      </div>
    </section>
  );
}
