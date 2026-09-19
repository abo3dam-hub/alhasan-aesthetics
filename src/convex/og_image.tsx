"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import satori from "satori";
import { initWasm, Resvg } from "@resvg/resvg-wasm";

// Branded 1200x630 Open Graph card generated on demand inside Convex.
// Fonts (direct .ttf) and the resvg WASM binary are fetched once per warm
// node and cached at module scope, matching the pattern recommended for
// Convex node actions (satori + @resvg/resvg-wasm).
const GOLD = "#c9a96b";
const CREAM = "#f4ece1";

const RESVG_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm";
const CSS_URL =
  "https://fonts.googleapis.com/css2?family=El+Messiri:wght@600&family=Playfair+Display:wght@700&display=swap";

let wasmReady: Promise<void> | null = null;
let fontsPromise: Promise<Record<string, ArrayBuffer>> | null = null;

// Capped module-scope PNG cache so repeated crawler hits (WhatsApp/Facebook)
// don't re-render. Entries are keyed by title + direction + embedded photo.
// Stored as ArrayBuffer — Convex accepts only ArrayBuffer (bytes) as an
// action return value, not a Uint8Array view.
const pngCache = new Map<string, ArrayBuffer>();
const PNG_CACHE_LIMIT = 128;

function cacheKey(title: string, isRtl: boolean, imageDataUri?: string | null) {
  return `${isRtl ? "rtl" : "ltr"}|${title}|${imageDataUri ?? ""}`;
}

function ensureWasm(): Promise<void> {
  if (!wasmReady) {
    wasmReady = (async () => {
      const res = await fetch(RESVG_WASM_URL);
      if (!res.ok) throw new Error(`resvg wasm fetch failed: ${res.status}`);
      await initWasm(new Uint8Array(await res.arrayBuffer()));
    })().catch((err) => {
      wasmReady = null;
      throw err;
    });
  }
  return wasmReady;
}

// satori uses harfbuzzjs for Arabic/Indic shaping. harfbuzzjs ships its wasm
// as a sibling file that the Convex node sandbox cannot read from disk, so
// node_modules/harfbuzzjs/index.js is patched (patch-package) to pass the
// wasm bytes in-memory via moduleArg.wasmBinary.
async function loadFonts(): Promise<Record<string, ArrayBuffer>> {
  if (!fontsPromise) {
    fontsPromise = (async () => {
      // A "curl" user-agent makes Google Fonts serve plain .ttf files
      // instead of woff2, which satori can parse.
      const res = await fetch(CSS_URL, {
        headers: { "User-Agent": "curl/8.4.0" },
      });
      if (!res.ok) throw new Error(`font css fetch failed: ${res.status}`);
      const css = await res.text();
      const faces = css.match(/@font-face\s*{[\s\S]*?}/g) ?? [];
      const buffers: Record<string, ArrayBuffer> = {};
      for (const face of faces) {
        const family = face.match(/font-family:\s*['"]?\s*([^'";]+)\s*['"]?\s*;/);
        const urlMatch = face.match(/url\(([^)]+\.ttf)\)/);
        if (!family || !urlMatch) continue;
        const key = family[1].trim().toLowerCase();
        if (buffers[key]) continue;
        const fontRes = await fetch(urlMatch[1]);
        if (fontRes.ok) buffers[key] = await fontRes.arrayBuffer();
      }
      if (!buffers["el messiri"] || !buffers["playfair display"]) {
        throw new Error("Could not load required fonts");
      }
      return buffers;
    })().catch((err) => {
      fontsPromise = null;
      throw err;
    });
  }
  return fontsPromise;
}

function truncate(text: string, max: number): string {
  const clean = text
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

async function renderCard(
  title: string,
  isRtl: boolean,
  imageDataUri?: string | null,
): Promise<ArrayBuffer> {
  const hit = pngCache.get(cacheKey(title, isRtl, imageDataUri));
  if (hit) return hit;

  const [fonts] = await Promise.all([loadFonts(), ensureWasm()]);

  const fontList = [
    {
      name: "ElMessiri",
      data: fonts["el messiri"],
      weight: 600 as const,
      style: "normal" as const,
    },
    {
      name: "Playfair",
      data: fonts["playfair display"],
      weight: 700 as const,
      style: "normal" as const,
    },
  ];

  const brand = isRtl ? "د. الحسن الصايم" : "Dr. Al Hasan Al Saiem";
  const tagline = isRtl ? "جراحة تجميلية وترميمية" : "Aesthetic & Plastic Surgery";
  const blogLabel = isRtl ? "مقالات طبية" : "Health & Beauty Blog";
  const titleFont = isRtl ? "ElMessiri" : "Playfair";
  const short = truncate(title, isRtl ? 120 : 110);

  const node = (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: "linear-gradient(135deg, #120f0b 0%, #201910 46%, #2e2417 100%)",
        color: CREAM,
        fontFamily: "ElMessiri",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -160,
          right: -160,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,169,107,0.32) 0%, rgba(201,169,107,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -180,
          left: -140,
          width: 540,
          height: 540,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,169,107,0.18) 0%, rgba(201,169,107,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 22,
          right: 22,
          bottom: 22,
          left: 22,
          border: "1px solid rgba(201,169,107,0.6)",
          borderRadius: 28,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 31,
          right: 31,
          bottom: 31,
          left: 31,
          border: "1px solid rgba(201,169,107,0.22)",
          borderRadius: 20,
        }}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: isRtl ? "62px 84px 56px" : "62px 74px 56px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: GOLD,
              letterSpacing: isRtl ? 0 : 1,
            }}
          >
            {brand}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "rgba(244,236,225,0.72)",
              fontFamily: isRtl ? "ElMessiri" : "Playfair",
            }}
          >
            {tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 48,
            flex: 1,
            minHeight: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: isRtl ? 52 : 56,
                lineHeight: 1.35,
                textAlign: "center",
                color: "#fbf7ee",
                fontWeight: 700,
                fontFamily: titleFont,
                letterSpacing: isRtl ? 0 : 0.5,
                whiteSpace: "pre-wrap",
                direction: isRtl ? "rtl" : "ltr",
                maxWidth: 980,
              }}
            >
              {short}
            </div>
            <div style={{ marginTop: 30, height: 2, width: 96, background: GOLD }} />
          </div>
          {imageDataUri && (
            <div
              style={{
                width: 410,
                height: 462,
                borderRadius: 22,
                border: "1px solid rgba(201,169,107,0.55)",
                overflow: "hidden",
                flexShrink: 0,
                display: "flex",
              }}
            >
              <img
                src={imageDataUri}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "rgba(244,236,225,0.8)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD }} />
            <span style={{ letterSpacing: isRtl ? 0 : 0.5 }}>{blogLabel}</span>
          </div>
          <div style={{ letterSpacing: 1, fontFamily: "Playfair" }}>
            www.dralhasanalsaiem.com
          </div>
        </div>
      </div>
    </div>
  );

  const svg = await satori(node, {
    width: 1200,
    height: 630,
    fonts: fontList,
  });

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const rendered = resvg.render().asPng();
  const png = rendered.buffer.slice(
    rendered.byteOffset,
    rendered.byteOffset + rendered.byteLength,
  ) as ArrayBuffer;
  if (pngCache.size >= PNG_CACHE_LIMIT) {
    const oldest = pngCache.keys().next().value;
    if (oldest !== undefined) pngCache.delete(oldest);
  }
  pngCache.set(cacheKey(title, isRtl, imageDataUri), png);
  return png;
}

export const generateArticleOg = internalAction({
  args: {
    title: v.string(),
    dir: v.union(v.literal("rtl"), v.literal("ltr")),
    imageDataUri: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    return renderCard(args.title, args.dir === "rtl", args.imageDataUri);
  },
});