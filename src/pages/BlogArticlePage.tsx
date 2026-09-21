import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams, Link } from "react-router";
import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { ArrowRight, ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import GlassNavbar from "@/components/GlassNavbar";
import { ResolvedImage } from "@/components/ResolvedImage";
import { trackEvent } from "@/lib/track";
import { safeJsonLd } from "@/lib/jsonLd";

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

function renderInline(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  );
}

function renderBody(body: string): ReactNode {
  return body.split(/\n{2,}/).map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="text-2xl font-serif-luxury font-bold text-foreground mt-10 mb-4"
        >
          {renderInline(trimmed.slice(3))}
        </h2>
      );
    }
    const lines = block.split("\n");
    const isList =
      lines.length > 1 && lines.every((l) => l.trim().startsWith("- "));
    if (isList) {
      return (
        <ul key={i} className="list-disc list-inside space-y-2 my-4 text-muted-foreground leading-relaxed">
          {lines.map((l, j) => (
            <li key={j}>{renderInline(l.trim().slice(2))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p
        key={i}
        className="text-lg text-muted-foreground leading-relaxed my-4 whitespace-pre-line"
      >
        {renderInline(block)}
      </p>
    );
  });
}

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, dir, locale } = useI18n();
  const isRtl = dir === "rtl";
  const isAr = locale === "ar";

  const article = useQuery(api.articles.getBySlug, slug ? { slug } : "skip");
  const allArticles = useQuery(api.articles.listPublished);
  const relatedArticle = article
    ? allArticles?.find((a) => a._id !== article._id)
    : undefined;

  const display = article ?? null;

  const title = display ? (isRtl ? display.titleAr : display.titleEn) : "";
  const body = display ? (isRtl ? display.bodyAr : display.bodyEn) : "";
  const image = display?.ogImage || display?.coverImage;
  const resolvedImage = useQuery(api.media.resolveUrl, image ? { ref: image } : "skip");
  const absoluteImage =
    (resolvedImage && resolvedImage !== "" ? resolvedImage : null) ||
    (image && image.startsWith("http") ? image : null);

  const seoTitle = isRtl
    ? (display?.seoTitleAr || title)
    : (display?.seoTitleEn || title);
  const seoDesc = isRtl
    ? (display?.seoDescriptionAr || display?.excerptAr || "")
    : (display?.seoDescriptionEn || display?.excerptEn || "");

  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);
  const phoneNumber = useMemo(() => {
    const raw = doctorSettings?.phone || "";
    return raw.replace(/[^0-9+]/g, "");
  }, [doctorSettings]);

  const handleShare = async () => {
    const slug = display?.slug ?? "";
    trackEvent("share", `article/${slug}`);
    const url = `https://dralhasanalsaiem.com/blog/${slug}`;
    const text = seoDesc || title || t.blogPage.title;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User cancelled the native share sheet — no-op.
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

  useEffect(() => {
    if (!display) return;
    document.title = `${seoTitle} — Dr. Al Hasan`;

    const setOrCreateMeta = (
      attr: string,
      val: string,
      isProperty = attr.startsWith("og:") || attr.startsWith("twitter:"),
    ) => {
      const selector = isProperty
        ? `meta[property="${attr}"]`
        : `meta[name="${attr}"]`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(isProperty ? "property" : "name", attr);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", val);
    };

    if (seoDesc) setOrCreateMeta("description", seoDesc);
    if (absoluteImage) setOrCreateMeta("og:image", absoluteImage);
    setOrCreateMeta("og:title", seoTitle, true);
    setOrCreateMeta("og:type", "article", true);
    setOrCreateMeta("og:url", `https://dralhasanalsaiem.com/blog/${display.slug}`, true);
    if (seoDesc) setOrCreateMeta("og:description", seoDesc, true);
    setOrCreateMeta("twitter:card", "summary_large_image");
    setOrCreateMeta("twitter:title", seoTitle);
    if (seoDesc) setOrCreateMeta("twitter:description", seoDesc);
    if (absoluteImage) setOrCreateMeta("twitter:image", absoluteImage);

    let robots = document.querySelector('meta[name="robots"]');
    if (!display.isPublished) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.setAttribute("name", "robots");
        document.head.appendChild(robots);
      }
      robots.setAttribute("content", "noindex, nofollow");
    } else if (robots) {
      robots.remove();
    }
  }, [display, seoTitle, seoDesc, image, absoluteImage]);

  const jsonLd = useMemo(() => {
    if (!display) return null;
    const byName = "Dr. Al Hasan Al Saiem";
    const publisher = {
      "@type": "Organization",
      name: byName,
      logo: {
        "@type": "ImageObject",
        url: "https://dralhasanalsaiem.com/assets/3.jpg",
      },
    };
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: seoDesc || undefined,
      image: absoluteImage ?? undefined,
      author: { "@type": "Person", name: byName },
      publisher,
      datePublished: display.publishDate
        ? new Date(display.publishDate).toISOString()
        : undefined,
      dateModified: display.updatedDate
        ? new Date(display.updatedDate).toISOString()
        : undefined,
      mainEntityOfPage: `https://dralhasanalsaiem.com/blog/${display.slug}`,
      inLanguage: isAr ? "ar" : "en",
    };
  }, [display, title, seoDesc, isAr, absoluteImage]);

  if (article === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">{t.blogPage.loading}</div>
      </div>
    );
  }

  if (!display) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <GlassNavbar />
        <div className="pt-32 pb-24 text-center px-4">
          <p className="text-xl text-muted-foreground mb-6">{t.blogPage.notFound}</p>
          <Button asChild className="bg-primary text-primary-foreground">
            <Link to="/blog">{t.blogPage.backToBlog}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <GlassNavbar />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      )}

      <section className="pt-24 pb-12 hero-gradient">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            {isRtl ? (
              <>
                {t.blogPage.backToBlog}
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <ArrowLeft className="h-4 w-4" />
                {t.blogPage.backToBlog}
              </>
            )}
          </Link>

          <div className="flex items-center gap-3 mb-4">
            {(display.categoryAr || display.categoryEn) && (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full glass-card text-sm font-medium text-primary">
                {isRtl ? display.categoryAr : display.categoryEn}
              </span>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {display.publishDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(display.publishDate, isAr ? "ar" : "en")}
                </span>
              )}
              {display.readingMinutes && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {display.readingMinutes} {t.blogPage.minutes}
                </span>
              )}
              <button
                type="button"
                onClick={handleShare}
                className="ms-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-sm font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                {t.blogPage.share}
              </button>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-bold text-foreground leading-tight">
            {title}
          </h1>
        </div>
      </section>

      {image && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-2">
          <div className="rounded-3xl overflow-hidden glass-card shadow-lg aspect-[16/8]">
            <ResolvedImage
              storageId={image}
              alt={title}
              imgClassName="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <section className="py-12 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <article>{renderBody(body)}</article>

          {relatedArticle && (
            <div className="mt-12 pt-8 border-t border-border/40">
              <h2 className="text-xl font-serif-luxury font-bold text-foreground mb-4">
                {t.blogPage.relatedTopic}
              </h2>
              <Link
                to={`/blog/${relatedArticle.slug}`}
                className="group block glass-card card-glow rounded-2xl p-5 hover:bg-white/60 transition-all duration-300"
              >
                <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {isRtl
                    ? relatedArticle.titleAr
                    : relatedArticle.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {isRtl
                    ? relatedArticle.excerptAr
                    : relatedArticle.excerptEn}
                </p>
              </Link>
            </div>
          )}

          <div className="mt-12 rounded-3xl glass-card card-glow p-8 text-center">
            <h2 className="text-2xl font-serif-luxury font-bold text-foreground mb-2">
              {t.blogPage.bookTitle}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t.blogPage.bookSubtitle}
            </p>
            <Button
              asChild
              className="bg-primary text-primary-foreground gap-2"
            >
              <a
                href={
                  phoneNumber
                    ? `https://wa.me/${phoneNumber}`
                    : "/consultation"
                }
              >
                {t.blogPage.bookCta}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}