import { Link, useLocation } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CalendarCheck, Phone } from "lucide-react";
import { useI18n } from "@/i18n";
import { trackEvent } from "@/lib/track";

const EXCLUDED_PREFIXES = ["/dashboard", "/auth"];

/** Sticky mobile conversion bar — phone + book consultation. Complements the
 *  floating WhatsApp action by keeping both primary actions always in reach. */
export function MobileCTABar() {
  const { pathname } = useLocation();
  const { dir } = useI18n();
  const isRtl = dir === "rtl";
  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);

  if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const phone = (doctorSettings?.phone || "").replace(/[^0-9+]/g, "");

  return (
    <div
      dir={dir}
      className="sm:hidden fixed inset-x-0 bottom-0 z-[65] border-t border-border/50 glass-elevated pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-2 gap-2 p-2">
        {phone && (
          <a
            href={`tel:${phone}`}
            onClick={() => trackEvent("cta", "mobile-bar-call")}
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border/60 text-sm font-semibold text-foreground active:scale-[0.98] transition-transform"
          >
            <Phone className="h-4 w-4 text-primary" />
            {isRtl ? "اتصل الآن" : "Call Now"}
          </a>
        )}
        <Link
          to="/consultation"
          onClick={() => trackEvent("cta", "mobile-bar-book")}
          className={`flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.98] transition-transform ${
            phone ? "" : "col-span-2"
          }`}
        >
          <CalendarCheck className="h-4 w-4" />
          {isRtl ? "احجز استشارتك" : "Book Consultation"}
        </Link>
      </div>
    </div>
  );
}