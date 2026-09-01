import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

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

export default function BeforeAfter() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const cases = useQuery(api.beforeAfter.listActive);

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
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-medium text-muted-foreground mb-6">
            {t.beforeAfter.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-foreground">{t.beforeAfter.title}</span>{" "}
            <span className="font-serif-luxury text-primary">{t.beforeAfter.titleHighlight}</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t.beforeAfter.subtitle}
          </p>
        </motion.div>

        {/* Cases Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" dir={dir}>
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
                  <div className="glass-card rounded-3xl overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={c.afterImage}
                        alt={isRtl ? c.titleAr : c.titleEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute top-3 end-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm z-10">
                        {isRtl ? "بعد" : "After"}
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <p className="text-sm font-semibold text-foreground">
                        {isRtl ? c.titleAr : c.titleEn}
                      </p>
                    </div>
                  </div>
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
                  <div className="glass-card rounded-3xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
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
              className="rounded-full glass-card hover:bg-white/60 px-8 h-12 text-sm border-border/60"
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
