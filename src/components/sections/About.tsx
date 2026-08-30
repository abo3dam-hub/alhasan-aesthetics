import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Award, Heart, Users, Clock } from "lucide-react";

const stats = [
  { icon: Clock, value: "15+", key: "experience" },
  { icon: Heart, value: "5000+", key: "procedures" },
  { icon: Users, value: "99%", key: "satisfaction" },
  { icon: Award, value: "10+", key: "certification" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function About() {
  const { t, dir } = useI18n();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="about" className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center" dir={dir}>
          {/* Left: Image / Visual */}
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="relative"
          >
            <div className="relative">
              {/* Glass card as visual placeholder */}
              <div className="glass-elevated rounded-3xl p-8 sm:p-10 glow-champagne aspect-[4/3] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Award className="h-12 w-12 text-primary/60" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground/70">
                    Dr. AlHasan
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    Aesthetic Surgery
                  </p>
                </div>
              </div>

              {/* Floating glass accent */}
              <div className="absolute -bottom-4 -end-4 w-32 h-24 glass-card rounded-2xl hidden sm:flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">15+</p>
                  <p className="text-[10px] text-muted-foreground">{t.about.experience}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={{ ...fadeInUp, visible: { ...fadeInUp.visible, transition: { duration: 0.6, delay: 0.2 } } }}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-medium text-muted-foreground mb-6">
              {t.about.badge}
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="text-foreground">{t.about.title}</span>{" "}
              <span className="font-serif-luxury text-primary">{t.about.titleHighlight}</span>
            </h2>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t.about.description}
            </p>

            {/* Stats Grid */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  className="glass-card rounded-2xl p-4 sm:p-5 text-center hover:bg-white/60 transition-colors"
                >
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 mb-3">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {t.about[stat.key as keyof typeof t.about]}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
