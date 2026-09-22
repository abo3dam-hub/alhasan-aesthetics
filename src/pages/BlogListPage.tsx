import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { m as motion } from "framer-motion";
import { Link } from "react-router";
import GlassNavbar from "@/components/GlassNavbar";
import { ResolvedImage } from "@/components/ResolvedImage";
import { Calendar, Clock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/track";

function CardShareButton({
  slug,
  titleAr,
  titleEn,
  excerptAr,
  excerptEn,
}: {
  slug: string;
  titleAr?: string | null;
  titleEn?: string | null;
  excerptAr?: string | null;
  excerptEn?: string | null;
}) {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const title = isRtl ? titleAr || "" : titleEn || "";
  const excerpt = isRtl ? excerptAr || "" : excerptEn || "";

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    trackEvent("share", `card/${slug}`);
    const url = `https://dralhasanalsaiem.com/blog/${slug}`;
    const text = excerpt || title || t.blogPage.title;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User closed the native share sheet — no-op.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t.blogPage.shareCopied);
    } catch {
      toast.error(t.blogPage.shareFailed);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={t.blogPage.share}
      title={t.blogPage.share}
      className="absolute top-3 end-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur text-primary shadow-md hover:bg-white hover:scale-105 transition-all cursor-pointer"
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}

function formatDate(ts: number, locale: string): string {
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

export default function BlogListPage() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const articles = useQuery(api.articles.listPublished);

  const featured = articles?.find((a) => a.isFeatured);
  const rest = articles?.filter((a) => !a.isFeatured) ?? [];

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <GlassNavbar />

      <section className="pt-24 pb-16 hero-gradient">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm font-medium text-primary mb-6">
              {t.blogPage.badge}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-bold text-foreground mb-4">
              {t.blogPage.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t.blogPage.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {!articles ? (
            <div className="text-center py-20">
              <div className="animate-pulse text-muted-foreground">
                {t.blogPage.loading}
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {t.blogPage.noArticles}
              </p>
            </div>
          ) : (
            <>
              {featured && (
                <Link to={`/blog/${featured.slug}`} className="block group mb-10">
                  <div className="glass-card card-glow rounded-3xl overflow-hidden hover:bg-white/60 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                    <div className="grid md:grid-cols-2">
                      <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
                        <ResolvedImage
                          storageId={featured.coverImage || undefined}
                          alt={isRtl ? featured.titleAr : featured.titleEn}
                          imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        <CardShareButton
                          slug={featured.slug}
                          titleAr={featured.titleAr}
                          titleEn={featured.titleEn}
                          excerptAr={featured.excerptAr}
                          excerptEn={featured.excerptEn}
                        />
                      </div>
                      <div className="p-6 sm:p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {t.blogPage.featured}
                          </span>
                          {(featured.categoryAr || featured.categoryEn) && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full glass-card text-sm font-medium text-muted-foreground">
                              {isRtl
                                ? featured.categoryAr
                                : featured.categoryEn}
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-foreground mb-3">
                          {isRtl ? featured.titleAr : featured.titleEn}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                          {isRtl ? featured.excerptAr : featured.excerptEn}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {featured.publishDate && (
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              {formatDate(
                                featured.publishDate,
                                isRtl ? "ar" : "en",
                              )}
                            </span>
                          )}
                          {featured.readingMinutes && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {featured.readingMinutes} {t.blogPage.minutes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6" dir={dir}>
                {(rest ?? []).map((article, i) => (
                  <motion.div
                    key={article._id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 * i }}
                  >
                    <Link
                      to={`/blog/${article.slug}`}
                      className="block h-full group"
                    >
                      <div className="glass-card card-glow rounded-3xl overflow-hidden h-full hover:bg-white/60 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <ResolvedImage
                            storageId={article.coverImage || undefined}
                            alt={isRtl ? article.titleAr : article.titleEn}
                            imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                          <CardShareButton
                            slug={article.slug}
                            titleAr={article.titleAr}
                            titleEn={article.titleEn}
                            excerptAr={article.excerptAr}
                            excerptEn={article.excerptEn}
                          />
                        </div>
                        <div className="p-5">
                          {(article.categoryAr || article.categoryEn) && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full glass-card text-sm font-medium text-primary mb-3">
                              {isRtl ? article.categoryAr : article.categoryEn}
                            </span>
                          )}
                          <h3 className="text-lg font-bold text-foreground mb-2 leading-snug">
                            {isRtl ? article.titleAr : article.titleEn}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {isRtl ? article.excerptAr : article.excerptEn}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {article.publishDate && (
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(
                                  article.publishDate,
                                  isRtl ? "ar" : "en",
                                )}
                              </span>
                            )}
                            {article.readingMinutes && (
                              <span className="inline-flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {article.readingMinutes} {t.blogPage.minutes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}