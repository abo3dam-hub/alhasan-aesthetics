import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, Quote } from "lucide-react";

const placeholderTestimonials = [
  { key: "t1", stars: 5 },
  { key: "t2", stars: 5 },
  { key: "t3", stars: 5 },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

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
            {sectionCMS?.badgeAr && sectionCMS?.badgeEn ? (isArabic ? sectionCMS.badgeAr : sectionCMS.badgeEn) : t.testimonials.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-foreground">{sectionCMS?.titleAr && sectionCMS?.titleEn ? (isArabic ? sectionCMS.titleAr : sectionCMS.titleEn) : t.testimonials.title}</span>{" "}
            <span className="font-serif-luxury text-primary">{sectionCMS?.titleHighlightAr && sectionCMS?.titleHighlightEn ? (isArabic ? sectionCMS.titleHighlightAr : sectionCMS.titleHighlightEn) : t.testimonials.titleHighlight}</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {sectionCMS?.subtitleAr && sectionCMS?.subtitleEn ? (isArabic ? sectionCMS.subtitleAr : sectionCMS.subtitleEn) : t.testimonials.subtitle}
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" dir={dir}>
          {displayTestimonials
            ? displayTestimonials.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={{
                    ...fadeInUp,
                    visible: { ...fadeInUp.visible, transition: { duration: 0.5, delay: 0.15 * i } },
                  }}
                >
                  <div className="glass-elevated rounded-3xl p-6 sm:p-8 h-full flex flex-col">
                    <Quote className="h-8 w-8 text-primary/30 mb-4 shrink-0" />
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: Math.min(item.rating, 5) }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-foreground/80 leading-relaxed flex-1">
                      {isRtl ? item.textAr : item.textEn}
                    </p>
                    <div className="mt-6 pt-5 border-t border-border/30">
                      <div className="flex items-center gap-3">
                        {item.avatar ? (
                          <img src={item.avatar} alt={isRtl ? item.nameAr : item.nameEn} className="h-10 w-10 rounded-full object-cover shrink-0" loading="lazy" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                            {(isRtl ? item.nameAr : item.nameEn).charAt(0)}
                          </div>
                        )}
                        <p className="text-sm font-semibold text-foreground">
                          {isRtl ? item.nameAr : item.nameEn}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            : placeholderTestimonials.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={{
                    ...fadeInUp,
                    visible: { ...fadeInUp.visible, transition: { duration: 0.5, delay: 0.15 * i } },
                  }}
                >
                  <div className="glass-elevated rounded-3xl p-6 sm:p-8 h-full flex flex-col">
                    <Quote className="h-8 w-8 text-primary/30 mb-4 shrink-0" />
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: item.stars }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-foreground/80 leading-relaxed flex-1">
                      {t.testimonials[item.key as keyof typeof t.testimonials]}
                    </p>
                    <div className="mt-6 pt-5 border-t border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                          {(t.testimonials[`${item.key}Name` as keyof typeof t.testimonials] as string).charAt(0)}
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.testimonials[`${item.key}Name` as keyof typeof t.testimonials]}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
