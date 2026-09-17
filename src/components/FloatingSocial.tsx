import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowUp, Facebook, Instagram } from "lucide-react";
import { useI18n } from "@/i18n";
import { trackEvent } from "@/lib/track";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Floating action stack — WhatsApp (→ consultation page where the form
 * forwards to WhatsApp), Instagram/Facebook from site settings, and a
 * back-to-top button.
 */
export function FloatingSocial() {
  const { pathname } = useLocation();
  const { dir } = useI18n();
  const isRtl = dir === "rtl";
  const [showTop, setShowTop] = useState(false);
  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/auth")) return null;

  const insta = doctorSettings?.socialMedia?.instagram?.trim();
  const fb = doctorSettings?.socialMedia?.facebook?.trim();
  const whatsappLabel = isRtl ? "احجز استشارتك على واتساب" : "Book consultation on WhatsApp";

  return (
    <div
      className={cnPosition(isRtl) + " fixed bottom-20 sm:bottom-6 z-[70] flex flex-col items-end gap-3"}
    >
      <div className="flex flex-col items-center gap-2.5">
        {showTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={isRtl ? "العودة للأعلى" : "Back to top"}
            title={isRtl ? "العودة للأعلى" : "Back to top"}
            className="h-11 w-11 rounded-full glass-elevated text-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
        {insta && (
          <a
            href={insta}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            title="Instagram"
            className="h-11 w-11 rounded-full glass-elevated text-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Instagram className="h-5 w-5" />
          </a>
        )}
        {fb && (
          <a
            href={fb}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            title="Facebook"
            className="h-11 w-11 rounded-full glass-elevated text-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Facebook className="h-5 w-5" />
          </a>
        )}
      </div>

      <Link to="/consultation" aria-label={whatsappLabel} onClick={() => trackEvent("whatsapp", "floating-button")} className="group flex items-center">
        {whatsappLabel && (
          <span className="hidden sm:block me-3 bg-foreground/90 text-background text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            {whatsappLabel}
          </span>
        )}
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 hover:scale-110 transition-transform">
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" aria-hidden="true" />
          <WhatsAppIcon className="relative h-7 w-7" />
        </span>
      </Link>
    </div>
  );
}

function cnPosition(isRtl: boolean) {
  return isRtl ? "left-4 sm:left-6" : "right-4 sm:right-6";
}