import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  HeartPulse,
  BadgeCheck,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassNavbar from "@/components/GlassNavbar";

export default function ProcedureDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";

  const procedure = useQuery(
    api.procedures.getBySlug,
    slug ? { slug } : "skip"
  );

  if (procedure === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!procedure) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-4">
          {isRtl ? "الإجراء غير موجود" : "Procedure not found"}
        </h1>
        <Link to="/">
          <Button variant="outline">
            {isRtl ? "العودة للرئيسية" : "Back to Home"}
          </Button>
        </Link>
      </div>
    );
  }

  const title = isRtl ? procedure.titleAr : procedure.titleEn;
  const description = isRtl ? procedure.descriptionAr : procedure.descriptionEn;
  const longDescription = isRtl
    ? procedure.longDescriptionAr
    : procedure.longDescriptionEn;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <GlassNavbar />

      {/* Hero Banner */}
      <section className="pt-24 pb-16 hero-gradient">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm font-medium text-primary mb-6">
              <BadgeCheck className="h-4 w-4" />
              {isRtl ? "إجراء طبي متخصص" : "Specialized Procedure"}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-bold text-foreground mb-4">
              {title}
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl">
              {description}
            </p>
          </motion.div>

          {/* Quick Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10"
          >
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "مدة الإجراء" : "Duration"}
                </p>
                <p className="font-semibold text-foreground">
                  {procedure.duration}
                </p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "فترة التعافي" : "Recovery"}
                </p>
                <p className="font-semibold text-foreground">
                  {procedure.recovery}
                </p>
              </div>
            </div>

            {procedure.price && (
              <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? "السعر التقريبي" : "Estimated Price"}
                  </p>
                  <p className="font-semibold text-foreground">
                    {procedure.price}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Full Description */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-elevated rounded-3xl p-8 sm:p-12"
          >
            <h2 className="text-2xl font-serif-luxury font-bold text-foreground mb-6">
              {isRtl ? "تفاصيل الإجراء" : "Procedure Details"}
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
              {longDescription.split("\n").map((paragraph, i) => (
                <p key={i} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-elevated rounded-3xl p-8 sm:p-12 text-center glow-champagne"
          >
            <h3 className="text-xl sm:text-2xl font-serif-luxury font-bold text-foreground mb-4">
              {isRtl
                ? "هل تفكر في هذا الإجراء؟"
                : "Thinking about this procedure?"}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {isRtl
                ? "احجز استشارتك المجانية مع د. الحسن الصايم لتعرف إذا كان هذا الإجراء مناسب لك."
                : "Book your free consultation with Dr. Al Hasan Al Saiem to find out if this procedure is right for you."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/#contact">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base">
                  {isRtl ? "احجز استشارتك المجانية" : "Book Free Consultation"}
                </Button>
              </a>
              <a href="tel:+966500000000">
                <Button
                  variant="outline"
                  className="rounded-full px-8 py-6 text-base gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {isRtl ? "اتصل بنا" : "Call Us"}
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
