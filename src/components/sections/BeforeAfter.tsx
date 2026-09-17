import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Eye, MousePointerClick } from "lucide-react";
import { Link } from "react-router";
import { ResolvedImage } from "@/components/ResolvedImage";
import { cn } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";


const placeholderCases = [
  { label: "Rhinoplasty", labelAr: "تجميل الأنف" },
  { label: "Facelift", labelAr: "شد الوجه" },
  { label: "Liposuction", labelAr: "شفط الشحم" },
  { label: "Brow Lift", labelAr: "شد الجفون" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/** Homepage Before/After card — crossfades flip between the two frames:
 *  hover flips on hover-capable devices, tap toggles on touch. Both images are
 *  lazy-loaded so the extra frame costs nothing until it approaches the
 *  viewport; the flip itself is a GPU-cheap opacity/transform transition. */
function CaseCard({ c, isRtl }: { c: Doc<"beforeAfter">; isRtl: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const beforeLabel = isRtl ? "قبل" : "Before";
  const afterLabel = isRtl ? "بعد" : "After";

  return (
    <div className="glass-card card-glow rounded-3xl overflow-hidden group hover:shadow-lg transition-all duration-300">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        aria-pressed={flipped}
        aria-label={isRtl ? (flipped ? "عرض صورة بعد" : "عرض صورة قبل") : flipped ? "Show after photo" : "Show before photo"}
        className="relative aspect-square overflow-hidden w-full block cursor-pointer text-start"
      >
        {/* Before frame (default) */}
        <div className={cn("absolute inset-0 transition-all duration-700 ease-in-out", flipped ? "opacity-0 scale-[1.06]" : "opacity-100 scale-100")}>
          <ResolvedImage
            storageId={c.beforeImage}
            alt={beforeLabel + " — " + (isRtl ? c.titleAr : c.titleEn)}
            imgClassName="w-full h-full object-cover"
          />
        </div>

        {/* After frame (revealed on click/tap) */}
        <div className={cn("absolute inset-0 transition-all duration-700 ease-in-out", flipped ? "opacity-100 scale-100" : "opacity-0 scale-[1.06]")}>
          <ResolvedImage
            storageId={c.afterImage}
            alt={afterLabel + " — " + (isRtl ? c.titleAr : c.titleEn)}
            imgClassName="w-full h-full object-cover"
          />
        </div>

        {/* Legacy gradient + label */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-3 end-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm z-10 transition-colors duration-500">
          {flipped ? afterLabel : beforeLabel}
        </div>

        {/* Interactive flip affordance — transparent pulsing click-hint at the bottom corner */}
        <motion.div
          className="absolute bottom-1 end-2 pointer-events-none z-10"
          initial={false}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-full bg-black/30 text-white/90 text-[10px] font-medium backdrop-blur-md shadow-md border border-white/10">
            <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-primary/80">
              <motion.span
                className="absolute inset-0 rounded-full bg-primary/60"
                animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                aria-hidden="true"
              />
              <MousePointerClick className="h-2.5 w-2.5 text-white" />
            </span>
            {flipped
              ? (isRtl ? "اضغط لعرض قبل" : "Tap to see before")
              : (isRtl ? "اضغط لعرض بعد" : "Tap to see after")}
          </div>
        </motion.div>
      </button>
      <div className="p-4 sm:p-5">
        <p className="text-sm font-semibold text-foreground">
          {isRtl ? c.titleAr : c.titleEn}
        </p>
      </div>
    </div>
  );
}

export default function BeforeAfter() {
  const { t, dir, locale } = useI18n();
  const isRtl = dir === "rtl";
  const isArabic = locale === "ar";
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const cases = useQuery(api.beforeAfter.listActive);
  const sectionCMS = useQuery(api.homepageSettings.getSectionContent, { key: "beforeAfterSection" });

  const displayCases = cases && cases.length > 0 ? cases.slice(0, 4) : null;

  return (
    <section id="before-after" className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
          dir={dir}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-medium tracking-[0.06em] text-muted-foreground mb-6">
            {isArabic ? (sectionCMS?.badgeAr || t.beforeAfter.badge) : (sectionCMS?.badgeEn || t.beforeAfter.badge)}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-foreground">{isArabic ? (sectionCMS?.titleAr || t.beforeAfter.title) : (sectionCMS?.titleEn || t.beforeAfter.title)}</span>{" "}
            <span className="font-serif-luxury text-primary">{isArabic ? (sectionCMS?.titleHighlightAr || t.beforeAfter.titleHighlight) : (sectionCMS?.titleHighlightEn || t.beforeAfter.titleHighlight)}</span>
          </h2>
          <span className="title-line mt-5" aria-hidden="true" />
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty">
            {isArabic ? (sectionCMS?.subtitleAr || t.beforeAfter.subtitle) : (sectionCMS?.subtitleEn || t.beforeAfter.subtitle)}
          </p>
        </motion.div>

        {/* Cases Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6" dir={dir}>
          {displayCases
            ? displayCases.map((c, i) => (
                <motion.div
                  key={c._id}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={{
                    ...fadeInUp,
                    visible: { ...fadeInUp.visible, transition: { duration: 0.5, delay: 0.1 * i } },
                  }}
                >
                  <CaseCard c={c} isRtl={isRtl} />
                </motion.div>
              ))
            : placeholderCases.map((c, i) => (
                <motion.div
                  key={c.label}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={{
                    ...fadeInUp,
                    visible: { ...fadeInUp.visible, transition: { duration: 0.5, delay: 0.1 * i } },
                  }}
                >
                  <div className="glass-card card-glow rounded-3xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted/80 flex items-center justify-center">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-2xl bg-white/40 flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {isRtl ? "قبل" : "Before"}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-px w-6 bg-primary/40" />
                          <Eye className="h-4 w-4 text-primary" />
                          <div className="h-px w-6 bg-primary/40" />
                        </div>
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {isRtl ? "بعد" : "After"}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <p className="text-sm font-semibold text-foreground">
                        {isRtl ? c.labelAr : c.label}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>

        {/* View All */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mt-10 sm:mt-12"
        >
          <Link to="/before-after">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full btn-sheen glass-card hover:bg-white/60 px-8 h-12 text-sm border-border/60"
            >
              {t.beforeAfter.viewAll}
              <Arrow className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
