import { useEffect } from "react";
import { useLocation } from "react-router";
import { useI18n } from "@/i18n";

const CONVEX_URL =
  import.meta.env.VITE_CONVEX_URL || "https://kindly-anaconda-422.convex.cloud";
const CONVEX_SITE_URL =
  import.meta.env.VITE_CONVEX_SITE_URL &&
  !import.meta.env.VITE_CONVEX_SITE_URL.includes("127.0.0.1")
    ? import.meta.env.VITE_CONVEX_SITE_URL
    : CONVEX_URL.replace(".convex.cloud", ".convex.site");
const TRACK_URL = `${CONVEX_SITE_URL}/trackVisit`;
const EXCLUDED_PREFIXES = ["/dashboard", "/auth"];

function getSessionId(): string {
  try {
    const KEY = "ah_session_id";
    let id: string | null = sessionStorage.getItem(KEY);
    if (!id) {
      id =
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `s${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

/** Fire-and-forget page-view tracking (no PII: IP stays server-side and is
 *  discarded after country lookup). */
export function AnalyticsTracker() {
  const { pathname } = useLocation();
  const { locale } = useI18n();

  useEffect(() => {
    if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return;
    try {
      fetch(TRACK_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({ path: pathname, locale, sessionId: getSessionId() }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Tracking must never break the page.
    }
  }, [pathname, locale]);

  return null;
}