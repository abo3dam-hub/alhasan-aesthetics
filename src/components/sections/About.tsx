import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Award, Heart, Users, Clock } from "lucide-react";
import doctorImg from "/assets/1.jpg";

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
              {/* Outer glass frame with subtle glow */}
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-primary/20 via-secondary/15 to-primary/10 blur-sm" />

              {/* Main image container */}
              <div className="relative glass-elevated rounded-[2rem] overflow-hidden glow-champagne">
                {/* The doctor image */}
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={doctorImg}
                    alt="Dr. Al Hasan Al Saiem"
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                </div>

                {/* Bottom gradient overlay for text readability */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />

                {/* Name overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white font-serif-luxury text-2xl sm:text-3xl font-semibold drop-shadow-lg">
                    Dr. Al Hasan Al Saiem
                  </p>
                  <p className="text-white/80 text-sm mt-1 drop-shadow">
                    Aesthetic & Plastic Surgery
                  </p>
                </div>

                {/* Top-right glass badge */}
                <div className="absolute top-4 end-4 glass-card rounded-2xl px-3 py-2 backdrop-blur-md">
                  <p className="text-xs font-semibold text-white drop-shadow">
                    Board Certified
                  </p>
                </div>
              </div>

              {/* Floating glass accent — experience badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -bottom-5 -end-5 sm:-bottom-6 sm:-end-6 glass-elevated rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-lg"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground leading-tight">15+</p>
                  <p className="text-[11px] text-muted-foreground">{t.about.experience}</p>
                </div>
              </motion.div>

              {/* Floating glass accent — left side (desktop) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute top-1/2 -start-4 sm:-start-6 -translate-y-1/2 glass-card rounded-2xl px-4 py-3 hidden lg:flex items-center gap-2.5 shadow-md"
              >
                <div className="h-8 w-8 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-tight">5000+</p>
                  <p className="text-[10px] text-muted-foreground">{t.about.procedures}</p>
                </div>
              </motion.div>
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
