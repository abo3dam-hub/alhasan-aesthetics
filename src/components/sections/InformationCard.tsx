import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, ShieldCheck, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResolvedImage } from "@/components/ResolvedImage";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

/**
 * Homepage Patient Guide card — placed between the About section and
 * Our Procedures. CMS-managed via siteSettings["informationCard"].
 */
export default function InformationCard() {
  const { t, dir } = useI18n();
  const isArabic = dir === "rtl";
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const infoCMS = useQuery(api.homepageSettings.getInformationCardSettings);

  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  // While CMS is loading keep the card hidden to avoid a layout flash.
  if (infoCMS === undefined) return null;

  const enabled = infoCMS?.enabled !== false;
  if (!infoCMS || !enabled) return null;

  const badge = isArabic ? infoCMS.badgeAr || t.informationCard.badge : infoCMS.badgeEn || t.informationCard.badge;
  const title = isArabic ? infoCMS.titleAr || t.informationCard.title : infoCMS.titleEn || t.informationCard.title;
  const content = isArabic ? infoCMS.contentAr || t.informationCard.content : infoCMS.contentEn || t.informationCard.content;
  const ctaText = isArabic ? infoCMS.ctaTextAr || t.informationCard.ctaText : infoCMS.ctaTextEn || t.informationCard.ctaText;
  const ctaLink = infoCMS.ctaLink || "/consultation";
  const ctaEnabled = infoCMS.ctaEnabled !== false;
  const image = infoCMS.image || "";
  const paragraphs = content.split("\n").filter((p: string) => p.trim() !== "");

  return (
    <section id="information-card" className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref} dir={dir}>
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="glass-elevated rounded-[2rem] overflow-hidden glow-champagne"
        >
          <div className="grid lg:grid-cols-2">
            {/* Image / Visual */}
            <div className="relative min-h-64 lg:min-h-full">
              {image ? (
                <ResolvedImage
                  storageId={image}
                  alt={badge}
                  imgClassName="absolute inset-0 w-full h-full object-cover object-center"
                  lazy={false}
                />
              ) : (
                <div className="absolute inset-0 luxury-gradient flex items-center justify-center">
                  <div className="text-center px-8">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-white/50 backdrop-blur-md border border-white/60 shadow-sm mb-5">
                      <HeartHandshake className="h-10 w-10 text-primary" />
                    </div>
                    <p className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-primary/80">
                      {isArabic ? "جمالك بأمانة" : "Your Beauty, Honestly"}
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Content */}
            <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white/40 backdrop-blur-sm">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-medium text-muted-foreground self-start mb-6">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                {badge}
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-serif-luxury font-bold tracking-tight text-foreground">
                {title}
              </h2>

              <div className="mt-6 space-y-4">
                {paragraphs.map((paragraph: string, i: number) => (
                  <p key={i} className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {ctaEnabled && (
                <div className="mt-9">
                  <Link to={ctaLink}>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-12 text-sm gap-2">
                      {ctaText}
                      <Arrow className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}