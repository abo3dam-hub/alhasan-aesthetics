import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import GlassNavbar from "@/components/GlassNavbar";
import { cn } from "@/lib/utils";
import { ResolvedImage } from "@/components/ResolvedImage";



export default function BeforeAfterPage() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const [activeFilter, setActiveFilter] = useState("all");
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});

  const cases = useQuery(api.beforeAfter.listActive);
  const procedures = useQuery(api.procedures.listActive);

  // Build filters dynamically from CMS procedures
  const procedureFilters = [
    { key: "all", ar: "الكل", en: "All" },
    ...(procedures ?? []).map((p) => ({
      key: p.slug,
      ar: p.titleAr,
      en: p.titleEn,
    })),
  ];

  const filteredCases =
    activeFilter === "all"
      ? cases
      : cases?.filter((c) => c.procedureType === activeFilter);

  const handleSliderChange = (id: string, value: number) => {
    setSliderValues((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <GlassNavbar />

      {/* Header */}
      <section className="pt-24 pb-12 hero-gradient">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-bold text-foreground mb-4">
              {isRtl ? "نتائج" : "Results"}{" "}
              <span className="text-primary">
                {isRtl ? "قبل وبعد" : "Before & After"}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {isRtl
                ? "نفخر بعرض نتائج حقيقية لمرضانا. كل حالة هي قصة نجاح فريدة."
                : "We're proud to showcase real results from our patients. Each case is a unique success story."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {procedureFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeFilter === filter.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "glass-subtle text-muted-foreground hover:text-foreground hover:bg-white/40"
                )}
              >
                {isRtl ? filter.ar : filter.en}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {!filteredCases || filteredCases.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {isRtl
                  ? "لا توجد نتائج حالياً. سيتم إضافة صور قريباً."
                  : "No results available yet. Images will be added soon."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredCases.map((caseItem, index) => {
                  const sliderVal = sliderValues[caseItem._id] ?? 50;
                  return (
                    <motion.div
                      key={caseItem._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="glass-card rounded-2xl overflow-hidden"
                    >
                      {/* Before/After Slider */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {/* After (background) */}
                        <ResolvedImage
                          ref={caseItem.afterImage}
                          alt="After"
                          imgClassName="absolute inset-0 w-full h-full object-cover"
                          fallbackClassName="absolute inset-0"
                        />
                        {/* Before (clipped) */}
                        <div
                          className="absolute inset-0 overflow-hidden"
                          style={{ width: `${sliderVal}%` }}
                        >
                          <div style={{ width: `${10000 / Math.max(sliderVal, 1)}%`, maxWidth: "none" }}>
                            <ResolvedImage
                              ref={caseItem.beforeImage}
                              alt="Before"
                              imgClassName="w-full h-full object-cover"
                              fallbackClassName="w-full h-full"
                              lazy={false}
                            />
                          </div>
                        </div>
                        {/* Slider Handle */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                          style={{ left: `${sliderVal}%` }}
                        >
                          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-black/10">
                            <ChevronLeft className="h-3 w-3 text-foreground" />
                            <ChevronRight className="h-3 w-3 text-foreground" />
                          </div>
                        </div>
                        {/* Labels */}
                        <div className="absolute top-3 start-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm z-10">
                          {isRtl ? "قبل" : "Before"}
                        </div>
                        <div className="absolute top-3 end-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm z-10">
                          {isRtl ? "بعد" : "After"}
                        </div>
                        {/* Range Input */}
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={sliderVal}
                          onChange={(e) =>
                            handleSliderChange(
                              caseItem._id,
                              Number(e.target.value)
                            )
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                        />
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground">
                          {isRtl ? caseItem.titleAr : caseItem.titleEn}
                        </h3>
                        {(caseItem.descriptionAr || caseItem.descriptionEn) && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {isRtl
                              ? caseItem.descriptionAr
                              : caseItem.descriptionEn}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-elevated rounded-3xl p-8 sm:p-12 glow-champagne"
          >
            <h3 className="text-xl sm:text-2xl font-serif-luxury font-bold text-foreground mb-4">
              {isRtl
                ? "تبي تشوف نتائج مشابهة لحالتك؟"
                : "Want to see results similar to your case?"}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {isRtl
                ? "احجز استشارة مجانية ود. الحسن الصايم يوريك نتائج مشابهة."
                : "Book a free consultation and Dr. Al Hasan Al Saiem will show you similar results."}
            </p>
            <Link to="/consultation">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base">
                {isRtl ? "احجز استشارتك" : "Book Consultation"}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
