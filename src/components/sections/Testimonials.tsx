import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Star, Quote } from "lucide-react";
import { ResolvedImage } from "@/components/ResolvedImage";
import { Lightbox } from "@/components/Lightbox";
import { cn } from "@/lib/utils";

const placeholderTestimonials = [
  { key: "t1", stars: 5 },
  { key: "t2", stars: 5 },
  { key: "t3", stars: 5 },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

interface CarouselItem {
  id: string;
  rating: number;
  text: string;
  name: string;
  avatar?: string;
  images?: string[];
}

export default function Testimonials() {
  const { t, dir, locale } = useI18n();
  const isRtl = dir === "rtl";
  const isArabic = locale === "ar";
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const testimonials = useQuery(api.testimonials.listActive);
  const sectionCMS = useQuery(api.homepageSettings.getSectionContent, { key: "testimonialsSection" });

  const displayTestimonials =
    testimonials && testimonials.length > 0
      ? testimonials.slice(0, 6)
      : null;

  const items: CarouselItem[] = displayTestimonials
    ? displayTestimonials.map((item) => ({
        id: item._id,
        rating: Math.min(item.rating, 5),
        text: isRtl ? item.textAr : item.textEn,
        name: isRtl ? item.nameAr : item.nameEn,
        avatar: item.avatar || undefined,
        images: item.images || undefined,
      }))
    : placeholderTestimonials.map((item) => ({
        id: item.key,
        rating: item.stars,
        text: t.testimonials[item.key as keyof typeof t.testimonials],
        name: t.testimonials[`${item.key}Name` as keyof typeof t.testimonials] as string,
      }));

  // ── Carousel state ──
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportW, setViewportW] = useState(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightboxTarget, setLightboxTarget] = useState<{ images: string[]; index: number; name: string } | null>(null);
  const [lightboxOpenKey, setLightboxOpenKey] = useState(0);

  const visible = viewportW >= 1024 ? 3 : viewportW >= 640 ? 2 : 1;
  const cardW = viewportW / visible;
  const maxIndex = Math.max(0, items.length - visible);
  const current = Math.min(index, maxIndex);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setViewportW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Auto-play every 4.5s (paused on hover/focus)
  useEffect(() => {
    if (paused || items.length <= visible) return;
    const id = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 4500);
    return () => clearInterval(id);
  }, [paused, items.length, visible, maxIndex]);

  return (
    <section id="testimonials" className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
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
            {isArabic ? (sectionCMS?.badgeAr || t.testimonials.badge) : (sectionCMS?.badgeEn || t.testimonials.badge)}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-foreground">{isArabic ? (sectionCMS?.titleAr || t.testimonials.title) : (sectionCMS?.titleEn || t.testimonials.title)}</span>{" "}
            <span className="font-serif-luxury text-primary">{isArabic ? (sectionCMS?.titleHighlightAr || t.testimonials.titleHighlight) : (sectionCMS?.titleHighlightEn || t.testimonials.titleHighlight)}</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {isArabic ? (sectionCMS?.subtitleAr || t.testimonials.subtitle) : (sectionCMS?.subtitleEn || t.testimonials.subtitle)}
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <div
            ref={viewportRef}
            dir={dir}
            className="overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <motion.div
              className="flex"
              animate={{ x: isRtl ? current * cardW : -current * cardW }}
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
            >
              {items.map((item) => (
                <div key={item.id} className="shrink-0 px-2" style={{ width: `${100 / visible}%` }}>
                  <div className="glass-elevated rounded-3xl p-6 sm:p-8 h-full flex flex-col">
                    <Quote className="h-8 w-8 text-primary/30 mb-4 shrink-0" />
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: item.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-foreground/80 leading-relaxed flex-1">
                      {item.text}
                    </p>
                    {item.images && item.images.length > 0 && (
                      <button
                        type="button"
                        className="mt-4 flex items-center gap-2 cursor-pointer"
                        onClick={() => { setLightboxTarget({ images: item.images as string[], index: 0, name: item.name }); setLightboxOpenKey((k) => k + 1); }}
                        aria-label={isArabic ? "عرض صور النتيجة" : "View result photos"}
                      >
                        {item.images.slice(0, 3).map((img, k) => (
                          <span
                            key={k}
                            className="relative overflow-hidden rounded-lg border border-border/40 h-14 w-14 shrink-0"
                          >
                            <ResolvedImage storageId={img} alt={`${item.name} photo ${k + 1}`} imgClassName="w-full h-full object-cover" />
                            {k === 2 && item.images!.length > 3 && (
                              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white bg-black/50">
                                +{item.images!.length - 3}
                              </span>
                            )}
                          </span>
                        ))}
                      </button>
                    )}
                    <div className="mt-6 pt-5 border-t border-border/30">
                      <div className="flex items-center gap-3">
                        {item.avatar ? (
                          <ResolvedImage storageId={item.avatar} alt={item.name} imgClassName="h-10 w-10 rounded-full object-cover shrink-0" lazy={false} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                            {item.name.charAt(0)}
                          </div>
                        )}
                        <p className="text-sm font-semibold text-foreground">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots */}
          {items.length > visible && (
            <div className="flex justify-center gap-2 mt-8" dir="ltr">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all cursor-pointer",
                    i === current ? "w-6 bg-primary" : "w-2 bg-primary/25 hover:bg-primary/50"
                  )}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <Lightbox
        key={lightboxOpenKey}
        images={lightboxTarget?.images ?? []}
        index={lightboxTarget?.index ?? null}
        onClose={() => setLightboxTarget(null)}
        alt={lightboxTarget?.name ?? ""}
      />
    </section>
  );
}