import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const placeholderFaqKeys = ["q1", "q2", "q3", "q4", "q5", "q6"];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function FAQ() {
  const { t, dir, locale } = useI18n();
  const isRtl = dir === "rtl";
  const isArabic = locale === "ar";
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const faqs = useQuery(api.faq.listActive);
  const sectionCMS = useQuery(api.homepageSettings.getSectionContent, { key: "faqSection" });

  const displayFaqs = faqs && faqs.length > 0 ? faqs : null;

  return (
    <section id="faq" className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16" dir={dir}>
          {/* Left Header */}
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="lg:col-span-2"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-medium text-muted-foreground mb-6">
              {sectionCMS?.badgeAr && sectionCMS?.badgeEn ? (isArabic ? sectionCMS.badgeAr : sectionCMS.badgeEn) : t.faq.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="text-foreground">{sectionCMS?.titleAr && sectionCMS?.titleEn ? (isArabic ? sectionCMS.titleAr : sectionCMS.titleEn) : t.faq.title}</span>{" "}
              <span className="block font-serif-luxury text-primary mt-1">
                {sectionCMS?.titleHighlightAr && sectionCMS?.titleHighlightEn ? (isArabic ? sectionCMS.titleHighlightAr : sectionCMS.titleHighlightEn) : t.faq.titleHighlight}
              </span>
            </h2>
            <p className="mt-4 sm:mt-6 text-base text-muted-foreground leading-relaxed">
              {sectionCMS?.subtitleAr && sectionCMS?.subtitleEn ? (isArabic ? sectionCMS.subtitleAr : sectionCMS.subtitleEn) : t.faq.subtitle}
            </p>
          </motion.div>

          {/* Right Accordion */}
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={{
              ...fadeInUp,
              visible: { ...fadeInUp.visible, transition: { duration: 0.6, delay: 0.2 } },
            }}
            className="lg:col-span-3"
          >
            <div className="glass-elevated rounded-3xl p-2 sm:p-3">
              <Accordion type="single" collapsible className="w-full">
                {displayFaqs
                  ? displayFaqs.map((faq, i) => (
                      <AccordionItem
                        key={faq._id}
                        value={faq._id}
                        className="border-b border-border/30 last:border-b-0 px-4 sm:px-6"
                      >
                        <AccordionTrigger className="text-sm sm:text-base font-medium text-foreground hover:no-underline py-5 sm:py-6 text-start">
                          {isRtl ? faq.questionAr : faq.questionEn}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5 sm:pb-6">
                          {isRtl ? faq.answerAr : faq.answerEn}
                        </AccordionContent>
                      </AccordionItem>
                    ))
                  : placeholderFaqKeys.map((qKey, i) => (
                      <AccordionItem
                        key={qKey}
                        value={qKey}
                        className="border-b border-border/30 last:border-b-0 px-4 sm:px-6"
                      >
                        <AccordionTrigger className="text-sm sm:text-base font-medium text-foreground hover:no-underline py-5 sm:py-6 text-start">
                          {t.faq[qKey as keyof typeof t.faq]}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5 sm:pb-6">
                          {t.faq[`a${i + 1}` as keyof typeof t.faq]}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
              </Accordion>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
