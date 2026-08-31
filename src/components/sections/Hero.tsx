import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Star, Award } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function Hero() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section
      id="home"
      className="relative min-h-[auto] md:min-h-screen flex items-center hero-gradient overflow-hidden"
    >
      {/* Decorative orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(197, 168, 130, 0.15)" }} />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(212, 196, 173, 0.12)" }} />
      <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full blur-2xl pointer-events-none" style={{ background: "rgba(139, 115, 85, 0.05)" }} />

      {/* Glass decorative panel */}
      <div className="absolute top-32 end-8 lg:end-20 w-48 h-48 glass-subtle rounded-3xl rotate-12 opacity-60 hidden md:block" />
      <div className="absolute bottom-24 start-8 lg:start-16 w-32 h-32 glass-subtle rounded-2xl -rotate-6 opacity-40 hidden md:block" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-12 sm:pt-32 sm:pb-20 lg:pt-32 lg:pb-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
          dir={dir}
        >
          {/* Badge */}
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs sm:text-sm font-medium text-muted-foreground mb-4 sm:mb-8">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t.hero.badge}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={item} className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            <span className="block text-foreground">{t.hero.title}</span>
            <span className="block mt-1 sm:mt-2 bg-gradient-to-l from-primary via-secondary to-primary bg-clip-text text-transparent font-serif-luxury">
              {t.hero.titleHighlight}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={item}
            className="mt-4 sm:mt-8 text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-xl"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            className="mt-6 sm:mt-10 flex flex-wrap gap-3 sm:gap-4"
          >
            <Button
              size="lg"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base"
            >
              {t.hero.cta}
              <Arrow className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("procedures")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-full glass-card hover:bg-white/60 px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base border-border/60"
            >
              {t.hero.ctaSecondary}
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            variants={item}
            className="mt-8 sm:mt-16 flex flex-wrap gap-3 sm:gap-6"
          >
            {[
              { icon: Award, text: t.hero.trust1 },
              { icon: Star, text: t.hero.trust2 },
              { icon: Sparkles, text: t.hero.trust3 },
            ].map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 glass-card rounded-2xl"
              >
                <div className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 shrink-0">
                  <badge.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground/80 whitespace-nowrap">
                  {badge.text}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
