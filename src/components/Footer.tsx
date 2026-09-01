import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Link } from "react-router";
import { Globe, Phone, Mail, MapPin } from "lucide-react";
import doctorLogo from "/assets/3.jpg";

export default function Footer() {
  const { t, dir, toggleLocale } = useI18n();
  const isRtl = dir === "rtl";
  const isArabic = isRtl;
  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);
  const footerCMS = useQuery(api.homepageSettings.getFooterSettings);
  const procedures = useQuery(api.procedures.listActive);

  const phone = doctorSettings?.phone || "+966 XX XXX XXXX";
  const email = doctorSettings?.email || "info@dr-alhasan.com";
  const addressEn = doctorSettings?.addressEn || "Syria, Damascus, Lattakia\nUnited Arab Emirates, Dubai";
  const addressAr = doctorSettings?.addressAr || "سوريا، دمشق، اللاذقية\nالإمارات العربية المتحدة، دبي";
  const address = isRtl ? addressAr : addressEn;

  const footerDescription = footerCMS?.descriptionAr && footerCMS?.descriptionEn
    ? (isArabic ? footerCMS.descriptionAr : footerCMS.descriptionEn)
    : t.footer.description;

  const footerProcedures = procedures?.slice(0, 6) ?? [];

  // Social media links from doctor settings
  const socialMedia = doctorSettings?.socialMedia || {};
  const socialLinks: { url: string; label: string; icon: string }[] = [];
  if (socialMedia.instagram) socialLinks.push({ url: socialMedia.instagram, label: "Instagram", icon: "instagram" });
  if (socialMedia.facebook) socialLinks.push({ url: socialMedia.facebook, label: "Facebook", icon: "facebook" });
  if (socialMedia.twitter) socialLinks.push({ url: socialMedia.twitter, label: "Twitter/X", icon: "twitter" });
  if (socialMedia.snapchat) socialLinks.push({ url: socialMedia.snapchat, label: "Snapchat", icon: "snapchat" });
  if (socialMedia.tiktok) socialLinks.push({ url: socialMedia.tiktok, label: "TikTok", icon: "tiktok" });

  return (
    <footer className="relative border-t border-border/40" dir={dir}>
      <div className="absolute inset-0 luxury-gradient pointer-events-none opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img
                src={doctorLogo}
                alt="Dr. Al Hasan Al Saiem"
                className="h-12 w-12 rounded-xl object-cover border border-border/40"
              />
              <span className="font-serif-luxury text-lg font-semibold text-foreground">
                {t.nav.logo}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {footerDescription}
            </p>

            {/* Social Media Links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.icon}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                    aria-label={link.label}
                  >
                    <SocialIcon name={link.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">{t.footer.quickLinks}</h3>
            <ul className="space-y-2.5">
              <li><a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.home}</a></li>
              <li><a href="/#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.about}</a></li>
              <li><a href="/#procedures" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.procedures}</a></li>
              <li><Link to="/before-after" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.beforeAfter}</Link></li>
              <li><a href="/#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.testimonials}</a></li>
              <li><a href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.faq}</a></li>
              <li><Link to="/consultation" className="text-sm text-primary font-medium hover:text-primary/80 transition-colors">{t.nav.bookConsultation}</Link></li>
            </ul>
          </div>

          {/* Services — CMS-driven */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">{t.footer.services}</h3>
            <ul className="space-y-2.5">
              {footerProcedures.length > 0 ? (
                footerProcedures.map((proc) => (
                  <li key={proc._id}>
                    <Link to={`/procedure/${proc.slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {isRtl ? proc.titleAr : proc.titleEn}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/procedure/rhinoplasty" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.procedures.rhinoplasty}</Link></li>
                  <li><Link to="/procedure/face-neck-lift" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.procedures.faceNeckLift}</Link></li>
                  <li><Link to="/procedure/blepharoplasty" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.procedures.blepharoplasty}</Link></li>
                  <li><Link to="/procedure/botox" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.procedures.botox}</Link></li>
                  <li><Link to="/procedure/fillers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.procedures.fillers}</Link></li>
                  <li><Link to="/procedure/tummy-tuck" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.procedures.tummyTuck}</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">{t.nav.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">{phone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">{email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {address.split('\n').map((line: string, i: number) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}
                </span>
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-xs font-medium text-foreground mb-2">{t.footer.workingHours}</p>
              <p className="text-xs text-muted-foreground">{t.footer.weekdays}: {doctorSettings?.workingHoursWeekdays || "9 AM - 6 PM"}</p>
              <p className="text-xs text-muted-foreground">{t.footer.friday}: {doctorSettings?.workingHoursFriday || (isRtl ? "مغلق" : "Closed")}</p>
              <p className="text-xs text-muted-foreground">{t.footer.saturday}: {doctorSettings?.workingHoursSaturday || (isRtl ? "مغلق" : "Closed")}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Dr. Al Hasan Al Saiem. {t.footer.rights}.
          </p>
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            {t.common.switchLang}
          </button>
        </div>
      </div>
    </footer>
  );
}

// Simple inline social icons (SVG)
function SocialIcon({ name }: { name: string }) {
  const iconClass = "h-4 w-4 text-primary";
  switch (name) {
    case "instagram":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "facebook":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case "twitter":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
      );
    case "snapchat":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      );
    default:
      return <Globe className={iconClass} />;
  }
}
