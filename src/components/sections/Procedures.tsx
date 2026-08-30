import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
} from "lucide-react";

const procedures = [
  { key: "blepharoplasty", icon: Eye },
  { key: "faceNeckLift", icon: UserRound },
  { key: "rhinoplasty", icon: SmilePlus },
  { key: "liposuctionFat", icon: Droplets },
  { key: "tummyTuck", icon: Scissors },
  { key: "botox", icon: Sparkles },
  { key: "fillers", icon: Heart },
  { key: "armThighLift", icon: ArrowUpDown },
  { key: "breastSurgery", icon: Stethoscope },
  { key: "scarRevision", icon: Ban },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Procedures() {
  const { t, dir } = useI18n();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

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
            {t.procedures.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-foreground">{t.procedures.title}</span>{" "}
            <span className="font-serif-luxury text-primary">{t.procedures.titleHighlight}</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t.procedures.subtitle}
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5" dir={dir}>
          {procedures.map((proc, i) => (
            <motion.div
              key={proc.key}
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
              <div className="glass-card rounded-3xl p-5 sm:p-6 h-full hover:bg-white/60 transition-all duration-300 group cursor-pointer">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
                  <proc.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">
                  {t.procedures[proc.key as keyof typeof t.procedures]}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  {t.procedures[`${proc.key}Desc` as keyof typeof t.procedures]}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                  {t.procedures.learnMore}
                  <Arrow className="h-3.5 w-3.5" />
                </span>
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
          <Button
            variant="outline"
            size="lg"
            className="rounded-full glass-card hover:bg-white/60 px-8 h-12 text-sm border-border/60"
          >
            {t.procedures.viewAll}
            <Arrow className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
