import { useEffect } from "react";
import { useLocation } from "react-router";
import { useI18n } from "@/i18n";
import { trackPageView } from "@/lib/track";

const EXCLUDED_PREFIXES = ["/dashboard", "/auth"];

/** Fire-and-forget page-view tracking (no PII: IP stays server-side and is
 *  discarded after country lookup). See `@/lib/track`. */
export function AnalyticsTracker() {
  const { pathname } = useLocation();
  const { locale } = useI18n();

  useEffect(() => {
    if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return;
    trackPageView(pathname, locale);
  }, [pathname, locale]);

  return null;
}