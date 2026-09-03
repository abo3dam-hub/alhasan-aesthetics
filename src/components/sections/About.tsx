import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Award, Heart, Users, Clock } from "lucide-react";
import doctorImg from "/assets/1.jpg";
import { ResolvedImage } from "@/components/ResolvedImage";

const statIconMap: Record<string, typeof Award> = {
  clock: Clock,
  heart: Heart,
  users: Users,
  award: Award,
};

const defaultStats = [
  { icon: "clock", value: "15+", key: "experience" },
  { icon: "heart", value: "5000+", key: "procedures" },
  { icon: "users", value: "99%", key: "satisfaction" },
  { icon: "award", value: "10+", key: "certification" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function About() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const isArabic = isRtl;
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);
  const aboutCMS = useQuery(api.homepageSettings.getAboutSettings);

  // CMS → per-language fallback (each language checked independently)
  const description = isArabic
    ? (aboutCMS?.descriptionAr || doctorSettings?.biographyAr || t.about.description)
    : (aboutCMS?.descriptionEn || doctorSettings?.biographyEn || t.about.description);

  const badge = isArabic
    ? (aboutCMS?.badgeAr || t.about.badge)
    : (aboutCMS?.badgeEn || t.about.badge);

  const title = isArabic
    ? (aboutCMS?.titleAr || t.about.title)
    : (aboutCMS?.titleEn || t.about.title);

  const titleHighlight = isArabic
    ? (aboutCMS?.titleHighlightAr || t.about.titleHighlight)
    : (aboutCMS?.titleHighlightEn || t.about.titleHighlight);

  const doctorImage = aboutCMS?.image || doctorImg;
  const doctorName = doctorSettings?.doctorNameEn || "Dr. Al Hasan Al Saiem";
  const doctorNameAr = doctorSettings?.doctorNameAr || "د. الحسن الصايم";

  // Stats — CMS or default
  const stats = aboutCMS?.stats?.length > 0
    ? aboutCMS.stats.filter((s: any) => s.enabled !== false)
    : defaultStats;

  // Primary stat (shown as floating badge)
  const primaryStat = stats[0];
  const secondaryStat = stats[1];

  return (
    <section id="about" className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
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
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-primary/20 via-secondary/15 to-primary/10 blur-sm" />
              <div className="relative glass-elevated rounded-[2rem] overflow-hidden glow-champagne">
                <div className="aspect-[3/4] overflow-hidden">
                  {aboutCMS?.image ? (
                    <ResolvedImage
                      ref={aboutCMS.image}
                      alt={isArabic ? doctorNameAr : doctorName}
                      imgClassName="w-full h-full object-fill object-center transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <img
                      src={doctorImg}
                      alt={isArabic ? doctorNameAr : doctorName}
                      className="w-full h-full object-fill object-center transition-transform duration-700 hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white font-serif-luxury text-2xl sm:text-3xl font-semibold drop-shadow-lg">
                    {isArabic ? doctorNameAr : doctorName}
                  </p>
                  <p className="text-white/80 text-sm mt-1 drop-shadow">
                    Aesthetic & Plastic Surgery
                  </p>
                </div>
                <div className="absolute top-4 end-4 glass-card rounded-2xl px-3 py-2 backdrop-blur-md">
                  <p className="text-xs font-semibold text-white drop-shadow">Board Certified</p>
                </div>
              </div>

              {/* Floating stat badges */}
              {primaryStat && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="absolute -bottom-5 -end-5 sm:-bottom-6 sm:-end-6 glass-elevated rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-lg"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {(() => { const I = statIconMap[primaryStat.icon || "award"] || Award; return <I className="h-5 w-5 text-primary" />; })()}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground leading-tight">{primaryStat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{isArabic ? primaryStat.labelAr : primaryStat.labelEn}</p>
                  </div>
                </motion.div>
              )}

              {secondaryStat && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute top-1/2 -start-4 sm:-start-6 -translate-y-1/2 glass-card rounded-2xl px-4 py-3 hidden lg:flex items-center gap-2.5 shadow-md"
                >
                  <div className="h-8 w-8 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                    {(() => { const I = statIconMap[secondaryStat.icon || "heart"] || Heart; return <I className="h-4 w-4 text-primary" />; })()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">{secondaryStat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{isArabic ? secondaryStat.labelAr : secondaryStat.labelEn}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={{ ...fadeInUp, visible: { ...fadeInUp.visible, transition: { duration: 0.6, delay: 0.2 } } }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-medium text-muted-foreground mb-6">
              {badge}
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="text-foreground">{title}</span>{" "}
              <span className="font-serif-luxury text-primary">{titleHighlight}</span>
            </h2>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>

            {/* Stats Grid */}
            {stats.length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-4">
                {stats.map((stat: any, i: number) => {
                  const StatIcon = statIconMap[stat.icon || "award"] || Award;
                  return (
                    <div
                      key={i}
                      className="glass-card rounded-2xl p-4 sm:p-5 text-center hover:bg-white/60 transition-colors"
                    >
                      <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 mb-3">
                        <StatIcon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {isArabic ? stat.labelAr : stat.labelEn}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
