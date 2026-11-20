import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { m as motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Eye, Maximize2, X } from "lucide-react";
import { Link } from "react-router";
import { CompareSlider } from "@/components/CompareSlider";
import type { PublicBeforeAfterCase } from "@/lib/beforeAfterCase";


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


/** Fullscreen overlay with a large draggable comparison + close on Escape. */
function CompareFullscreen({
  title,
  beforeId,
  afterId,
  isRtl,
  onClose,
}: {
  title: string;
  beforeId: string | undefined | null;
  afterId: string | undefined | null;
  isRtl: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/92 backdrop-blur-sm p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 end-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label={isRtl ? "إغلاق" : "Close"}
      >
        <X className="h-5 w-5" />
      </button>
      <p className="mb-4 text-white/90 text-sm sm:text-base font-semibold" onClick={(e) => e.stopPropagation()}>
        {title}
      </p>
      <div
        className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CompareSlider
          beforeId={beforeId}
          afterId={afterId}
          beforeAlt={`${isRtl ? "قبل" : "Before"} — ${title}`}
          afterAlt={`${isRtl ? "بعد" : "After"} — ${title}`}
          isRtl={isRtl}
          eager
          className="aspect-[4/3] sm:aspect-[16/10]"
        />
      </div>
      <p className="mt-4 text-white/60 text-xs">
        {isRtl ? "اسحب للمقارنة" : "Drag to compare"}
      </p>
    </div>
  );
}

function CaseCard({ c, isRtl }: { c: PublicBeforeAfterCase; isRtl: boolean }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [touched, setTouched] = useState(false);
  const title = isRtl ? c.titleAr : c.titleEn;

  return (
    <div className="glass-card card-glow img-frame-gold rounded-3xl overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <CompareSlider
          beforeId={c.beforeImage}
          afterId={c.afterImage}
          beforeAlt={`${isRtl ? "قبل" : "Before"} — ${title}`}
          afterAlt={`${isRtl ? "بعد" : "After"} — ${title}`}
          isRtl={isRtl}
          className="aspect-square"
          onInteract={() => setTouched(true)}
        />
        {/* Expand to fullscreen */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setFullscreen(true);
          }}
          className="absolute bottom-3 end-3 z-20 p-2 rounded-full bg-black/50 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-black/70 transition-all"
          aria-label={isRtl ? "عرض بملء الشاشة" : "View fullscreen"}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {!touched && (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isRtl ? "اسحب للمقارنة" : "Drag to compare"}
          </p>
        )}
      </div>

      {fullscreen && (
        <CompareFullscreen
          title={title || ""}
          beforeId={c.beforeImage}
          afterId={c.afterImage}
          isRtl={isRtl}
          onClose={() => setFullscreen(false)}
        />
      )}
    </div>
  );
}

export default function BeforeAfter() {
  const { t, dir, locale } = useI18n();
  const isRtl = dir === "rtl";
  const isArabic = locale === "ar";
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const cases = useQuery(api.beforeAfter.listPublic);
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
                  <div className="glass-card card-glow img-frame-gold rounded-3xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
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
