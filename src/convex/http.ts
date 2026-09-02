import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";

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
const DOMAIN = "https://dr-alhasan.com";

const staticPages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/ar", changefreq: "weekly", priority: "1.0" },
  { path: "/en", changefreq: "weekly", priority: "1.0" },
  { path: "/consultation", changefreq: "monthly", priority: "0.9" },
  { path: "/before-after", changefreq: "weekly", priority: "0.8" },
];

http.route({
  path: "/sitemap.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    // Fetch active procedures from the CMS database
    let activeProcedures: { slug: string; active?: boolean }[] = [];
    try {
      activeProcedures = await ctx.runQuery(api.procedures.listActive);
    } catch {
      // If query fails, serve static-only sitemap
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
      if (proc.slug && proc.active !== false) {
        xml += `  <url>\n`;
        xml += `    <loc>${DOMAIN}/procedure/${proc.slug}</loc>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
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

export default http;
