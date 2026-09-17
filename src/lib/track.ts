/**
 * Lightweight, fire-and-forget analytics client.
 *
 * Both page views and interaction events are POSTed to the Convex HTTP action
 * `/trackVisit`. The request body is sent as `text/plain` (a CORS-safelisted
 * content type) so the browser never issues a preflight request. No PII is
 * sent: the IP is resolved to a country server-side and then discarded.
 */

const CONVEX_URL =
  import.meta.env.VITE_CONVEX_URL || "https://kindly-anaconda-422.convex.cloud";

const CONVEX_SITE_URL =
  import.meta.env.VITE_CONVEX_SITE_URL &&
  !import.meta.env.VITE_CONVEX_SITE_URL.includes("127.0.0.1")
    ? import.meta.env.VITE_CONVEX_SITE_URL
    : CONVEX_URL.replace(".convex.cloud", ".convex.site");

export const TRACK_URL = `${CONVEX_SITE_URL}/trackVisit`;

export function getSessionId(): string {
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

function post(payload: Record<string, unknown>) {
  try {
    fetch(TRACK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking must never break the page.
  }
}

export function trackPageView(path: string, locale: string) {
  post({ path, locale, sessionId: getSessionId() });
}

/** Record an interaction such as a WhatsApp or CTA click. */
export function trackEvent(type: string, label: string) {
  post({
    type,
    label,
    path: typeof window !== "undefined" ? window.location.pathname : "/",
    locale: typeof document !== "undefined" ? document.documentElement.lang : undefined,
    sessionId: getSessionId(),
  });
}