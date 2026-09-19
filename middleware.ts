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
  matcher: ["/blog/:path*", "/og-image"],
};

async function fetchWithTimeout(
  url: string,
  headers: HeadersInit | undefined,
  ms: number,
): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store", headers });
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// The SPA document never changes per request, so cache it per origin with a
// short TTL to avoid a same-origin fetch on every article visit.
const SPA_CACHE = new Map<string, { html: string; at: number }>();
const SPA_TTL = 10 * 60 * 1000;

async function serveSpa(origin: string): Promise<Response> {
  const cached = SPA_CACHE.get(origin);
  if (cached && Date.now() - cached.at < SPA_TTL) {
    return new Response(cached.html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, must-revalidate",
      },
    });
  }
  try {
    const res = await fetch(`${origin}/index.html`, { cache: "no-store" });
    if (res.ok) {
      const html = await res.text();
      SPA_CACHE.set(origin, { html, at: Date.now() });
      return new Response(html, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=0, must-revalidate",
        },
      });
    }
  } catch {
    // Fall through to the minimal fallback below.
  }
  return new Response(
    '<!DOCTYPE html><html><head><title>Dr. Al Hasan Al Saiem</title></head><body><div id="root"></div></body></html>',
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
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
    const res = await fetchWithTimeout(
      `${CONVEX_SITE_URL}/og-image${url.search}`,
      header,
      8000,
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

  if (request.method !== "GET") return serveSpa(new URL(request.url).origin);

  const userAgent = request.headers.get("user-agent") || "";
  if (!BOT_REGEX.test(userAgent)) {
    return serveSpa(new URL(request.url).origin);
  }

  const match = url.pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (!match) return serveSpa(url.origin);
  const slug = decodeURIComponent(match[1]);

  // Forward the crawler's Accept-Language so Arabic previews keep Arabic
  // titles/images (Convex decides the language from this header).
  const header = new Headers();
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) header.set("accept-language", acceptLanguage);

  const endpoint = `${CONVEX_SITE_URL}/og-meta?slug=${encodeURIComponent(slug)}`;
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