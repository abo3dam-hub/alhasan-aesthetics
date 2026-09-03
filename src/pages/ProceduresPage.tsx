import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import GlassNavbar from "@/components/GlassNavbar";
import { ResolvedImage } from "@/components/ResolvedImage";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  HeartPulse,
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
  Star,
  Shield,
  Zap,
  Activity,
  Sun,
  Moon,
} from "lucide-react";

const iconMap: Record<string, typeof Eye> = {
  Eye, UserRound, SmilePlus, Droplets, Scissors, Sparkles,
  Heart, ArrowUpDown, Stethoscope, Ban, Star, Shield, Zap, Activity, Sun, Moon,
};

export default function ProceduresPage() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const procedures = useQuery(api.procedures.listActive);

  const displayProcedures = (procedures ?? []).map((p) => ({
    slug: p.slug,
    title: isRtl ? p.titleAr : p.titleEn,
    description: isRtl ? p.descriptionAr : p.descriptionEn,
    icon: iconMap[p.icon] || Sparkles,
    image: p.image,
    price: p.price,
    duration: p.duration,
    recovery: p.recovery,
  }));

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <GlassNavbar />

      {/* Hero Header */}
      <section className="pt-24 pb-16 hero-gradient">
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
                  {t.proceduresPage.backHome}
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  {t.proceduresPage.backHome}
                </>
              )}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm font-medium text-primary mb-6">
              {t.proceduresPage.allProcedures}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-bold text-foreground mb-4">
              {t.proceduresPage.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t.proceduresPage.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Procedures Grid */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {!procedures ? (
            <div className="text-center py-20">
              <div className="animate-pulse text-muted-foreground">
                {isRtl ? "جاري التحميل..." : "Loading..."}
              </div>
            </div>
          ) : displayProcedures.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {t.proceduresPage.noProcedures}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" dir={dir}>
              {displayProcedures.map((proc, i) => (
                <motion.div
                  key={proc.slug}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 * i }}
                >
                  <Link to={`/procedure/${proc.slug}`} className="block h-full group">
                    <div className="glass-card rounded-3xl overflow-hidden h-full hover:bg-white/60 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                      {/* Image or Icon */}
                      {proc.image ? (
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <ResolvedImage
                            ref={proc.image}
                            alt={proc.title}
                            imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          <div className="absolute bottom-4 start-4">
                            <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/80 backdrop-blur-sm">
                              <proc.icon className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 sm:p-8">
                          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
                            <proc.icon className="h-7 w-7 text-primary" />
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-5 sm:p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {proc.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                          {proc.description}
                        </p>

                        {/* Quick Info */}
                        <div className="flex flex-wrap gap-3 mb-4">
                          {proc.duration && (
                            <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              {proc.duration}
                            </div>
                          )}
                          {proc.recovery && (
                            <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <HeartPulse className="h-3.5 w-3.5 text-primary" />
                              {proc.recovery}
                            </div>
                          )}
                        </div>

                        {proc.price && (
                          <p className="text-sm font-semibold text-primary mb-4">{proc.price}</p>
                        )}

                        {/* CTA */}
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                          {t.proceduresPage.viewDetails}
                          <Arrow className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12 sm:mt-16"
          >
            <Link to="/consultation">
              <Button
                size="lg"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-sm gap-2"
              >
                {t.proceduresPage.cta}
                <Arrow className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
