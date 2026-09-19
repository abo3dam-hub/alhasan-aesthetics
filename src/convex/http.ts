import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { auth } from "./auth";
import { hashIp } from "./analytics";

const http = httpRouter();

auth.addHttpRoutes(http);

// ─── Dynamic Sitemap ───
// Generates a sitemap.xml from live CMS data (procedures).
// Static pages are always included. Procedure pages reflect
// the current state of the database.
// This endpoint is served at the Convex deployment URL, e.g.:
//   https://<project>.convex.site/sitemap.xml
// The frontend domain should proxy or redirect /sitemap.xml here,
// or use the static fallback in public/sitemap.xml.
const DOMAIN = "https://dralhasanalsaiem.com";

const staticPages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/ar", changefreq: "weekly", priority: "1.0" },
  { path: "/en", changefreq: "weekly", priority: "1.0" },
  { path: "/consultation", changefreq: "monthly", priority: "0.9" },
  { path: "/before-after", changefreq: "weekly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.6" },
];

http.route({
  path: "/sitemap.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    // Fetch active procedures from the CMS database
    let activeProcedures: { slug: string; isActive?: boolean }[] = [];
    try {
      activeProcedures = await ctx.runQuery(api.procedures.listActive);
    } catch {
      // If query fails, serve static-only sitemap
    }

    // Fetch published blog articles
    let publishedArticles: { slug: string }[] = [];
    try {
      publishedArticles = await ctx.runQuery(api.articles.listPublished);
    } catch {
      // If query fails, serve the sitemap without article URLs
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${DOMAIN}${page.path}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic procedure pages from CMS
    for (const proc of activeProcedures) {
      // Note: real field is `isActive` (listActive already filters inactive).
      if (proc.slug && proc.isActive !== false) {
        xml += `  <url>\n`;
        xml += `    <loc>${DOMAIN}/procedure/${proc.slug}</loc>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    // Dynamic blog article pages from CMS
    for (const article of publishedArticles) {
      if (article.slug) {
        xml += `  <url>\n`;
        xml += `    <loc>${DOMAIN}/blog/${article.slug}</loc>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }),
});

// ─── Article OG Meta (social share previews) ───
// Serves a tiny, crawler-friendly HTML document with dynamic Open Graph /
// Twitter tags for a blog article. Social platforms (WhatsApp, Facebook,
// Telegram, X, LinkedIn…) fetch the raw HTML of a shared URL and do NOT run
// JavaScript, so a client-side SPA can never populate these tags for them.
// The Vercel Edge middleware (middleware.ts) intercepts crawler requests to
// /blog/:slug and returns the response of this endpoint instead of the SPA.
http.route({
  path: "/og-meta",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const slug = (url.searchParams.get("slug") || "").trim().toLowerCase();

    let title = "Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery";
    let description =
      "Board-certified aesthetic surgeon with 15+ years experience. " +
      "Rhinoplasty, facelift, Botox, fillers and all aesthetic procedures. Free consultation.";
    let image = `${DOMAIN}/assets/1.jpg`;
    let type = "website";
    let link = `${DOMAIN}/`;

    if (slug) {
      link = `${DOMAIN}/blog/${encodeURIComponent(slug)}`;
      try {
        const article = await ctx.runQuery(api.articles.getBySlug, { slug });
        if (article && article.isPublished) {
          const wantsArabic = (request.headers.get("accept-language") || "")
            .toLowerCase()
            .startsWith("ar");
          title = wantsArabic
            ? article.seoTitleAr || article.titleAr || title
            : article.seoTitleEn || article.titleEn || title;
          description = wantsArabic
            ? article.seoDescriptionAr || article.excerptAr || description
            : article.seoDescriptionEn || article.excerptEn || description;
          image = `${DOMAIN}/og-image?slug=${encodeURIComponent(slug)}`;
          type = "article";
        }
      } catch {
        // Fall through to site defaults — a valid preview is better than none.
      }
    }

    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${esc(title)}</title>
<link rel="canonical" href="${esc(link)}" />
<meta property="og:type" content="${type}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${esc(link)}" />
<meta property="og:site_name" content="Dr. Al Hasan Al Saiem" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
</head>
<body></body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  }),
});

// ─── Branded OG card (PNG) ───
// Generates the 1200x630 share preview the crawlers request. Rendered on
// demand in a Node action (satori → @resvg/resvg-wasm). If the article has a
// cover image it is embedded into the card; cache headers keep repeat hits cheap.
http.route({
  path: "/og-image",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const slug = (url.searchParams.get("slug") || "").trim().toLowerCase();
    if (!slug) {
      return new Response("missing slug", { status: 400 });
    }
    try {
      const article = await ctx.runQuery(api.articles.getBySlug, { slug });
      if (!article || !article.isPublished) {
        return new Response("not found", { status: 404 });
      }
      const wantsArabic = (request.headers.get("accept-language") || "")
        .toLowerCase()
        .startsWith("ar");
      const title = (wantsArabic ? article.titleAr : article.titleEn) || "";
      if (!title) {
        return new Response("no title", { status: 404 });
      }

      let imageDataUri: string | undefined;
      const imageRef = article.ogImage || article.coverImage;
      if (imageRef) {
        try {
          let abs: string | null = null;
          if (imageRef.startsWith("http")) {
            abs = imageRef;
          } else {
            const resolved = await ctx.runQuery(api.media.resolveUrl, {
              ref: imageRef,
            });
            if (resolved) abs = resolved;
          }
          if (abs) {
            const res = await withTimeout(fetch(abs), 8000);
            if (res.ok) {
              const contentType = res.headers.get("content-type") || "image/jpeg";
              if (contentType.startsWith("image/")) {
                const bytes = await res.arrayBuffer();
                if (bytes.byteLength <= 1.5 * 1024 * 1024) {
                  imageDataUri = `data:${contentType};base64,${toBase64(bytes)}`;
                }
              }
            }
          }
        } catch {
          // Embedding failed — fall back to a branded-only card.
        }
      }

      const png = (await ctx.runAction(internal.og_image.generateArticleOg, {
        title,
        dir: wantsArabic ? "rtl" : "ltr",
        imageDataUri,
      })) as ArrayBuffer;

      return new Response(png, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
        },
      });
    } catch {
      return new Response("error generating image", { status: 500 });
    }
  }),
});

// ─── Analytics Tracker ───
// Public, fire-and-forget endpoint that records a page visit. The visitor's
// IP is geolocated server-side (IP is hashed for the cache then discarded —
// no raw IP is ever persisted). Dashboard aggregates come from analytics.getStats.
http.route({
  path: "/trackVisit",
  method: "OPTIONS",
  handler: httpAction(async (_ctx, request) => {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }),
});

http.route({
  path: "/trackVisit",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const cors = corsHeaders(request);

    let path = "/";
    let locale: string | null = null;
    let sessionId: string | null = null;
    let eventType: string | null = null;
    let eventLabel: string | null = null;
    try {
      const body = await request.json();
      if (typeof body.path === "string" && body.path) path = body.path;
      if (typeof body.locale === "string" && body.locale) locale = body.locale;
      if (typeof body.sessionId === "string" && body.sessionId) sessionId = body.sessionId;
      if (typeof body.type === "string" && body.type) eventType = body.type;
      if (typeof body.label === "string" && body.label) eventLabel = body.label;
    } catch {
      // Malformed body — still record the visit with defaults.
    }

    const ip =
      request.headers.get("true-client-ip") ||
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "";

    let country: string | null = null;
    if (ip) {
      const ipHash = hashIp(ip);
      const cached = await ctx
        .runQuery(api.analytics.getIpCache, { ipHash })
        .catch(() => null);
      if (cached) {
        country = cached;
      } else {
        country = await geocodeCountry(ip);
        await ctx
          .runMutation(api.analytics.saveIpCache, { ipHash, country: country ?? undefined })
          .catch(() => {});
      }
    }

    if (eventType && eventLabel) {
      await ctx
        .runMutation(api.analytics.insertEvent, {
          type: eventType,
          label: eventLabel,
          path,
          locale: locale ?? undefined,
          country: country ?? undefined,
          sessionId: sessionId ?? undefined,
        })
        .catch(() => {});
    } else {
      await ctx
        .runMutation(api.analytics.insertVisit, {
          path,
          locale: locale ?? undefined,
          country: country ?? undefined,
          sessionId: sessionId ?? undefined,
        })
        .catch(() => {});
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }),
});

function corsHeaders(request: Request) {
  return {
    "Access-Control-Allow-Origin": request.headers.get("Origin") ?? "*",
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

/** Best-effort IP → ISO 3166-1 alpha-2 country code via free geolocation
 *  services. Returns null when unavailable. */
async function geocodeCountry(ip: string): Promise<string | null> {
  const endpoints = [
    `https://ipwho.is/${ip}`,
    `http://ip-api.com/json/${ip}?fields=status,countryCode`,
  ];
  for (const url of endpoints) {
    try {
      const res = await withTimeout(fetch(url), 3000);
      if (!res.ok) continue;
      const data = await res.json();
      const code: unknown =
        data?.countryCode ?? data?.country_code ?? data?.country;
      if (typeof code === "string" && code.length > 0) {
        return code.slice(0, 2).toUpperCase();
      }
    } catch {
      // Try the next endpoint.
    }
  }
  return null;
}

function withTimeout(promise: Promise<Response>, ms: number): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function toBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

export default http;
