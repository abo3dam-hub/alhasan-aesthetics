import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { m as motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Clock, Sparkles } from "lucide-react";
import { ResolvedImage } from "@/components/ResolvedImage";
import { safeJsonLd } from "@/lib/jsonLd";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

function formatDate(ts: number | undefined, locale: string): string {
  if (!ts) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleDateString();
  }
}

export default function LatestArticles() {
  const { t, dir, locale } = useI18n();
  const isRtl = dir === "rtl";
  const isArabic = locale === "ar";
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const articles = useQuery(api.articles.listPublished);
  const sectionCMS = useQuery(api.homepageSettings.getSectionContent, { key: "latestArticlesSection" });
  const config = useQuery(api.homepageSettings.getSectionContent, { key: "latestArticlesConfig" });

  // Auto-hide: the section never renders empty — no published articles, no section.
  if (!articles || articles.length === 0) return null;

  const count = Math.max(2, Math.min(Number(config?.count) || 4, 6));
  const featured = articles.find((a) => a.isFeatured) ?? articles[0];
  const rest = articles.filter((a) => a._id !== featured._id).slice(0, count - 1);

  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const badge = isArabic ? sectionCMS?.badgeAr || t.latestArticles.badge : sectionCMS?.badgeEn || t.latestArticles.badge;
  const title = isArabic ? sectionCMS?.titleAr || t.latestArticles.title : sectionCMS?.titleEn || t.latestArticles.title;
  const titleHighlight = isArabic
    ? sectionCMS?.titleHighlightAr || t.latestArticles.titleHighlight
    : sectionCMS?.titleHighlightEn || t.latestArticles.titleHighlight;
  const subtitle = isArabic ? sectionCMS?.subtitleAr || t.latestArticles.subtitle : sectionCMS?.subtitleEn || t.latestArticles.subtitle;

  const fTitle = isRtl ? featured.titleAr : featured.titleEn;
  const fExcerpt = isRtl ? featured.excerptAr : featured.excerptEn;
  const fCategory = isRtl ? featured.categoryAr : featured.categoryEn;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [featured, ...rest].map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "BlogPosting",
        headline: isRtl ? a.titleAr : a.titleEn,
        description: isRtl ? a.excerptAr : a.excerptEn,
        url: `/blog/${a.slug}`,
        ...(a.publishDate ? { datePublished: new Date(a.publishDate).toISOString() } : {}),
      },
    })),
  };

  return (
    <section id="latest-articles" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 luxury-gradient pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref} dir={dir}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-medium tracking-[0.06em] text-muted-foreground mb-6">
            {badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-foreground">{title}</span>{" "}
            <span className="text-primary">{titleHighlight}</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">{subtitle}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Featured article — the magazine cover story */}
          <motion.article
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <Link to={`/blog/${featured.slug}`} className="group block">
              <div className="img-frame-gold rounded-2xl overflow-hidden mb-6 relative">
                <ResolvedImage
                  storageId={featured.coverImage || undefined}
                  alt={fTitle}
                  imgClassName="aspect-[16/10] w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {featured.isFeatured && (
                  <span className="absolute top-4 start-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t.latestArticles.featured}
                  </span>
                )}
              </div>
              {fCategory && (
                <span className="text-xs font-medium tracking-wide text-primary uppercase">{fCategory}</span>
              )}
              <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                {fTitle}
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed line-clamp-3">{fExcerpt}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{formatDate(featured.publishDate, locale)}</span>
                {featured.readingMinutes ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {featured.readingMinutes} {t.latestArticles.minutes}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 font-medium text-primary ms-auto">
                  {t.latestArticles.readMore}
                  <Arrow className="h-4 w-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </motion.article>

          {/* Compact list — the remaining latest articles */}
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="flex flex-col divide-y divide-border/60"
          >
            {rest.map((a) => {
              const aTitle = isRtl ? a.titleAr : a.titleEn;
              const aCategory = isRtl ? a.categoryAr : a.categoryEn;
              return (
                <Link
                  key={a._id}
                  to={`/blog/${a.slug}`}
                  className="group flex items-center gap-5 py-5 first:pt-0 last:pb-0"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden">
                    <ResolvedImage
                      storageId={a.coverImage || undefined}
                      alt={aTitle}
                      imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    {aCategory && (
                      <span className="text-xs font-medium tracking-wide text-primary uppercase">{aCategory}</span>
                    )}
                    <h3 className="mt-1 font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {aTitle}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDate(a.publishDate, locale)}</span>
                      {a.readingMinutes ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {a.readingMinutes} {t.latestArticles.minutes}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <Arrow className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:text-primary group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                </Link>
              );
            })}
          </motion.div>
        </div>

        {/* All articles */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mt-12 sm:mt-16"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-primary/40 text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {t.latestArticles.allArticles}
            <Arrow className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>

      {/* BlogPosting structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
    </section>
  );
}
