import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function CTA() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const isArabic = isRtl;
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const ctaCMS = useQuery(api.homepageSettings.getCTASettings);

  if (ctaCMS?.enabled === false) return null;

  const badge = isArabic ? (ctaCMS?.badgeAr || null) : (ctaCMS?.badgeEn || null);
  const title = isArabic
    ? (ctaCMS?.titleAr || t.cta.title)
    : (ctaCMS?.titleEn || t.cta.title);
  const subtitle = isArabic
    ? (ctaCMS?.descriptionAr || t.cta.subtitle)
    : (ctaCMS?.descriptionEn || t.cta.subtitle);
  const buttonText = isArabic
    ? (ctaCMS?.buttonTextAr || t.cta.button)
    : (ctaCMS?.buttonTextEn || t.cta.button);

  return (
    <section className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          dir={dir}
        >
          <div className="glass-elevated rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden glow-champagne">
            <div className="absolute top-0 left-1/4 w-40 h-40 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              {badge && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm font-medium text-primary mb-4">
                  <Sparkles className="h-4 w-4" />
                  {badge}
                </div>
              )}
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-6">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                <span className="text-foreground">{title}</span>
              </h2>

              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {subtitle}
              </p>

              {(ctaCMS?.buttonEnabled !== false) && (
                <div className="mt-8 sm:mt-10">
                  <Link to={ctaCMS?.buttonDestination || "/consultation"}>
                    <Button
                      size="lg"
                      className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 px-8 sm:px-10 h-14 text-base"
                    >
                      {buttonText}
                      <Arrow className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
