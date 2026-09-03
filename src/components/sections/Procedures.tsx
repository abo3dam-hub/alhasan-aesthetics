import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import {
  Eye,
  UserRound,
  SmilePlus,
  Droplets,
  Scissors,
  Sparkles,
  Heart,
  ArrowUpDown,
  Stethoscope,
  Ban,
  Star,
  Shield,
  Zap,
  Activity,
  Sun,
  Moon,
} from "lucide-react";
import { ResolvedImage } from "@/components/ResolvedImage";

// Icon mapping from string name to component
const iconMap: Record<string, typeof Eye> = {
  Eye, UserRound, SmilePlus, Droplets, Scissors, Sparkles,
  Heart, ArrowUpDown, Stethoscope, Ban, Star, Shield, Zap, Activity, Sun, Moon,
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Procedures() {
  const { t, dir, locale } = useI18n();
  const isArabic = locale === "ar";
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const cmsProcedures = useQuery(api.procedures.listActive);
  const sectionCMS = useQuery(api.homepageSettings.getSectionContent, { key: "proceduresSection" });


  // Use CMS procedures if available
  const displayProcedures = cmsProcedures && cmsProcedures.length > 0
    ? cmsProcedures.map((p) => ({
        slug: p.slug,
        title: dir === "rtl" ? p.titleAr : p.titleEn,
        description: dir === "rtl" ? p.descriptionAr : p.descriptionEn,
        icon: iconMap[p.icon] || Sparkles,
        image: p.image,
        price: p.price,
      }))
    : null;

  return (
    <section id="procedures" className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 luxury-gradient pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
          dir={dir}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-medium text-muted-foreground mb-6">
            {sectionCMS?.badgeAr && sectionCMS?.badgeEn ? (isArabic ? sectionCMS.badgeAr : sectionCMS.badgeEn) : t.procedures.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-foreground">{sectionCMS?.titleAr && sectionCMS?.titleEn ? (isArabic ? sectionCMS.titleAr : sectionCMS.titleEn) : t.procedures.title}</span>{" "}
            <span className="font-serif-luxury text-primary">{sectionCMS?.titleHighlightAr && sectionCMS?.titleHighlightEn ? (isArabic ? sectionCMS.titleHighlightAr : sectionCMS.titleHighlightEn) : t.procedures.titleHighlight}</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {sectionCMS?.subtitleAr && sectionCMS?.subtitleEn ? (isArabic ? sectionCMS.subtitleAr : sectionCMS.subtitleEn) : t.procedures.subtitle}
          </p>
        </motion.div>

        {/* Grid — CMS-driven when available */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5" dir={dir}>
          {displayProcedures
            ? displayProcedures.map((proc, i) => (
                <motion.div
                  key={proc.slug}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={{
                    ...fadeInUp,
                    visible: {
                      ...fadeInUp.visible,
                      transition: { duration: 0.5, delay: 0.06 * i },
                    },
                  }}
                >
                  <Link to={`/procedure/${proc.slug}`} className="block h-full">
                    <div className="glass-card rounded-3xl overflow-hidden h-full hover:bg-white/60 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:scale-[1.02]">
                      {proc.image ? (
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <ResolvedImage ref={proc.image} alt={proc.title} imgClassName="w-full h-full group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </div>
                      ) : (
                        <div className="p-5 sm:p-6">
                          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
                            <proc.icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      )}
                      <div className="p-5 sm:p-6">
                        {proc.image && (
                          <div className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 mb-3">
                            <proc.icon className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">
                          {proc.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">
                          {proc.description}
                        </p>
                        {proc.price && (
                          <p className="text-sm font-semibold text-primary mb-3">{proc.price}</p>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                          {t.procedures.learnMore}
                          <Arrow className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            : null}
        </div>

        {/* View All */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mt-10 sm:mt-12"
        >
          <Link to="/procedures">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full glass-card hover:bg-white/60 px-8 h-12 text-sm border-border/60"
            >
              {t.procedures.viewAll}
              <Arrow className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
