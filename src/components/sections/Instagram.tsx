import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { m as motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Instagram } from "lucide-react";
import { ResolvedImage } from "@/components/ResolvedImage";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/**
 * Instagram gallery strip before the footer.
 * Images are curated by the admin in the dashboard (Homepage CMS → Instagram);
 * the profile link is reused from the doctor's social settings.
 * Renders nothing until at least one image is configured.
 */
export default function InstagramSection() {
  const { t, dir } = useI18n();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const sectionCMS = useQuery(api.homepageSettings.getSectionContent, {
    key: "instagramSection",
  });
  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);

  const images: string[] = Array.isArray(sectionCMS?.images)
    ? sectionCMS.images.filter(Boolean).slice(0, 6)
    : [];
  const profileUrl: string =
    sectionCMS?.profileUrl?.trim() ||
    doctorSettings?.socialMedia?.instagram?.trim() ||
    "https://instagram.com";

  // While the query is still loading: show a shimmer. Once it resolves,
  // hide the whole section when unconfigured (null), disabled, or image-less.
  if (sectionCMS !== undefined && (!sectionCMS || sectionCMS.enabled === false || images.length === 0)) {
    return null;
  }

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
          dir={dir}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-medium tracking-[0.06em] text-muted-foreground mb-6">
            <Instagram className="h-3.5 w-3.5 text-primary" />
            {t.instagram.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-foreground">{t.instagram.title}</span>{" "}
            <span className="font-serif-luxury text-primary">{t.instagram.titleHighlight}</span>
          </h2>
          <span className="title-line mt-5" aria-hidden="true" />
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty">
            {t.instagram.subtitle}
          </p>
        </motion.div>

        {/* Gallery grid — loading shimmer until the CMS query resolves */}
        {sectionCMS === undefined ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4" dir={dir}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-muted/20">
                <div className="shimmer absolute inset-0" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
            dir={dir}
          >
            {images.map((img, i) => (
              <motion.a
                key={`${img}-${i}`}
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeInUp}
                className="group relative aspect-square rounded-2xl overflow-hidden glass-card block"
                aria-label={t.instagram.follow}
              >
                <ResolvedImage
                  storageId={img}
                  alt={`${t.instagram.badge} ${i + 1}`}
                  imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute inset-0 z-10 flex items-center justify-center bg-primary/0 group-hover:bg-primary/30 transition-colors duration-300">
                  <Instagram className="h-7 w-7 text-white opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 drop-shadow-lg" />
                </span>
              </motion.a>
            ))}
          </motion.div>
        )}

        {/* Follow button */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mt-10"
        >
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full btn-sheen glass-card hover:bg-white/60 px-8 h-12 text-sm font-medium border-border/60 transition-colors"
          >
            <Instagram className="h-4 w-4 text-primary" />
            {t.instagram.follow}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
