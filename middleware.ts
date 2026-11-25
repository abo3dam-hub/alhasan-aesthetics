/**
 * Vercel Edge middleware — serves crawler-friendly HTML for blog article
 * shares.
 *
 * The site is a client-side SPA (Vite): every route serves the same
 * `index.html`, so social crawlers (WhatsApp, Facebook, X, Telegram…) that
 * don't execute JavaScript would always read the homepage preview.
 *
 * When a known bot requests /blog/:slug we return the article's Open Graph
 * tags from the Convex `/og-meta` endpoint. Everyone else gets the SPA,
 * served by fetching the built `index.html` (the same file the SPA rewrite
 * would deliver).
 *
 * Note: no `next/server` import — Vercel's middleware bundler typechecks the
 * file against the project's local deps, and this project doesn't ship Next.
 */

const BOT_REGEX =
  /facebookexternalhit|facebookcatalog|facebot|metaexternalagent|twitterbot|slackbot|discordbot|discord|telegrambot|whatsapp|viber|skypeuri|snapchat|pinterest|linkedinbot|linkedin|bingbot|googlebot|yandex|baiduspider|duckduckbot|ia_archiver|embedly|outbrain|quora|redditbot|sogou|bitlybot|line|micromessenger|vkshare|vkShare|curl|wget|postman|node-fetch/i;

const CONVEX_SITE_URL = (
  process.env.VITE_CONVEX_SITE_URL || "https://kindly-anaconda-422.convex.site"
).replace(/\/$/, "");

export const config = {
  matcher: ["/", "/ar", "/en", "/ar/", "/en/", "/blog/:path*", "/card", "/card/", "/og-image"],
};

async function fetchWithTimeout(
  url: string,
  headers: HeadersInit | undefined,
  ms: number,
): Promise<Response | null> {
  try {
    // AbortSignal.timeout replaces the manual AbortController + setTimeout
    // scaffolding (MWG: js/abort-signal-timeout). The catch-all below treats
    // its TimeoutError exactly like the old AbortError — both return null.
    const res = await fetch(url, { signal: AbortSignal.timeout(ms), cache: "no-store", headers });
    return res;
  } catch {
    return null;
  }
}

// The SPA document never changes per request, so cache it per origin with a
// short TTL to avoid a same-origin fetch on every article visit.
const SPA_CACHE = new Map<string, { html: string; at: number }>();
const SPA_TTL = 10 * 60 * 1000;

const SPA_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "public, max-age=0, must-revalidate",
} as const;

async function getSpaHtml(origin: string): Promise<string> {
  const cached = SPA_CACHE.get(origin);
  if (cached && Date.now() - cached.at < SPA_TTL) return cached.html;
  try {
    const res = await fetch(`${origin}/index.html`, { cache: "no-store" });
    if (res.ok) {
      const html = await res.text();
      SPA_CACHE.set(origin, { html, at: Date.now() });
      return html;
    }
  } catch {
    // Fall through to the minimal fallback below.
  }
  return '<!DOCTYPE html><html><head><title>Dr. Al Hasan Al Saiem</title></head><body><div id="root"></div></body></html>';
}

async function serveSpa(origin: string): Promise<Response> {
  return new Response(await getSpaHtml(origin), { headers: SPA_HEADERS });
}

// ─── Homepage FAQPage structured data (2026-11-25) ───
// The FAQPage JSON-LD used to be injected client-side by FAQ.tsx after the
// Convex FAQ query resolved — Google's renderer consistently snapshotted
// before that, so Rich Results Test never detected a FAQPage (verified
// twice). It is now rendered server-side: this middleware fetches the block
// from the Convex /faq-jsonld endpoint and inlines it into the homepage
// HTML for every GET request (bot or not — crawlers with unlisted UAs get
// it too, and for humans it is invisible metadata). On any failure the
// plain SPA shell is served, exactly as before.
const FAQ_CACHE = new Map<string, { json: string; at: number }>();
const FAQ_TTL = 10 * 60 * 1000;

async function fetchFaqJsonLd(lang: string): Promise<string | null> {
  const cached = FAQ_CACHE.get(lang);
  if (cached && Date.now() - cached.at < FAQ_TTL) return cached.json;
  const res = await fetchWithTimeout(
    `${CONVEX_SITE_URL}/faq-jsonld?lang=${lang}`,
    undefined,
    3000,
  );
  if (!res || !res.ok) return null;
  try {
    const json = await res.text();
    // Validate it parses before caching — a broken block must never be inlined.
    JSON.parse(json);
    FAQ_CACHE.set(lang, { json, at: Date.now() });
    return json;
  } catch {
    return null;
  }
}

function injectFaqJsonLd(html: string, json: string): string {
  // Escape "<" the same way safeJsonLd does so the inlined JSON can never
  // form a tag.
  const safe = json.replace(/</g, "\\u003c");
  const script = `<script type="application/ld+json">${safe}</script>`;
  return html.includes("</head>")
    ? html.replace("</head>", `${script}</head>`)
    : html;
}

async function serveHomepage(origin: string, lang: string): Promise<Response> {
  const html = await getSpaHtml(origin);
  const faqJson = await fetchFaqJsonLd(lang);
  const body = faqJson ? injectFaqJsonLd(html, faqJson) : html;
  return new Response(body, { headers: SPA_HEADERS });
}

// ─── Digital business card (/card) share preview ───
// Same crawler problem as articles: CardPage sets its OG tags client-side,
// which WhatsApp/Facebook/Telegram crawlers never execute — so shares of
// /card always rendered the generic site preview. Unlike /blog (per-article
// content from Convex), the card's preview content is static, so the tags
// are served inline here with no backend round-trip. ?lang=ar|en selects
// the language (crawlers don't send a useful Accept-Language); og:url
// carries the language so platforms treat each locale as its own share
// object, exactly like the article cards.
const CARD_DOMAIN = "https://dralhasanalsaiem.com";

const CARD_PREVIEW = {
  en: {
    title: "Digital Card | Dr. Alhasan Alsaiem",
    description:
      "Dr. Alhasan Alsaiem's digital card — Plastic Surgery, Aesthetic Medicine and Body Contouring. Damascus, Latakia, Dubai.",
  },
  ar: {
    title: "البطاقة الرقمية | د. الحسن الصايم",
    description:
      "البطاقة الرقمية للدكتور الحسن الصايم — جراحة التجميل والطب التجميلي ونحت الجسم. دمشق، اللاذقية، دبي.",
  },
} as const;

function cardCrawlerHtml(url: URL): Response {
  const langParam = url.searchParams.get("lang");
  const wantsArabic = langParam === "ar";
  const lang = wantsArabic ? "ar" : "en";
  const { title, description } = CARD_PREVIEW[lang];
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const image = `${CARD_DOMAIN}/card/og-preview.jpg`;
  const link = `${CARD_DOMAIN}/card`;
  const shareLink = `${link}?lang=${lang}`;
  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${wantsArabic ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8" />
<title>${esc(title)}</title>
<link rel="canonical" href="${esc(link)}" />
<meta property="og:type" content="profile" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="1200" />
<meta property="og:image:alt" content="${esc(title)}" />
<meta property="og:url" content="${esc(shareLink)}" />
<meta property="og:site_name" content="Dr. Al Hasan Al Saiem" />
<meta property="og:locale" content="${wantsArabic ? "ar_AR" : "en_US"}" />
<meta property="og:locale:alternate" content="${wantsArabic ? "en_US" : "ar_AR"}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
<meta name="twitter:image:alt" content="${esc(title)}" />
</head>
<body></body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Same short TTL as /og-meta: crawlers cache aggressively, so a
      // changed card preview needs a re-scrape, not a long cache.
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);

  // Branded OG share card (PNG): proxy /og-image to the Convex HTTP action for
  // ANY fetcher (crawlers resolve og:image against the page origin, which is
  // this Vercel domain). Without this route the SPA's index.html would be
  // served as the "image", and social platforms would drop the preview.
  if (url.pathname === "/og-image" && request.method === "GET") {
    const header = new Headers();
    const acceptLanguage = request.headers.get("accept-language");
    if (acceptLanguage) header.set("accept-language", acceptLanguage);
    // Generous timeout: a cold Convex isolate loads satori + resvg-wasm +
    // webfonts before first render, which can exceed a few seconds. A
    // timeout here returns 404 "not found" and the crawler drops the
    // preview image for that share, so waiting out the cold start wins.
    const res = await fetchWithTimeout(
      `${CONVEX_SITE_URL}/og-image${url.search}`,
      header,
      20000,
    );
    if (res && res.ok) {
      const body = await res.arrayBuffer();
      return new Response(body, {
        headers: {
          "content-type": res.headers.get("content-type") ?? "image/png",
          "cache-control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200",
          "access-control-allow-origin": "*",
        },
      });
    }
    // Never serve HTML in place of the image — let the crawler drop the image
    // (text-only card) rather than cache an "invalid image".
    return new Response("not found", {
      status: 404,
      headers: { "cache-control": "no-store" },
    });
  }

  // Homepage (/, /ar, /en): serve the SPA shell with the FAQPage JSON-LD
  // inlined (see the note above fetchFaqJsonLd). Explicit ?lang= wins over
  // the path segment; the root defaults to Arabic (primary language).
  if (request.method === "GET") {
    const home = url.pathname.match(/^\/(ar|en)?\/?$/);
    if (home) {
      const langParam = url.searchParams.get("lang");
      const lang =
        langParam === "en" || langParam === "ar"
          ? langParam
          : home[1] === "en"
            ? "en"
            : "ar";
      return serveHomepage(url.origin, lang);
    }
  }

  if (request.method !== "GET") return serveSpa(new URL(request.url).origin);

  const userAgent = request.headers.get("user-agent") || "";
  if (!BOT_REGEX.test(userAgent)) {
    return serveSpa(new URL(request.url).origin);
  }

  if (url.pathname === "/card" || url.pathname === "/card/") {
    return cardCrawlerHtml(url);
  }

  const match = url.pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (!match) return serveSpa(url.origin);
  const slug = decodeURIComponent(match[1]);

  // Forward the crawler's Accept-Language so Arabic previews keep Arabic
  // titles/images (Convex decides the language from this header).
  const header = new Headers();
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) header.set("accept-language", acceptLanguage);

  // Forward an explicit ?lang= from the shared URL so Arabic shares render
  // Arabic preview cards (scrapers don't send a useful Accept-Language).
  const langParam = url.searchParams.get("lang");
  const langSuffix =
    langParam === "ar" || langParam === "en" ? `&lang=${langParam}` : "";
  const endpoint = `${CONVEX_SITE_URL}/og-meta?slug=${encodeURIComponent(slug)}${langSuffix}`;
  const res = await fetchWithTimeout(endpoint, header, 5000);
  if (res && res.ok) {
    const html = await res.text();
    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=300",
      },
    });
  }

  return serveSpa(url.origin);
}