import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Link } from "react-router";
import { Globe, Phone, Mail, MapPin } from "lucide-react";
import { ResolvedImage } from "@/components/ResolvedImage";
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

  const footerDescription = isArabic
    ? (footerCMS?.descriptionAr || t.footer.description)
    : (footerCMS?.descriptionEn || t.footer.description);

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
              {doctorSettings?.navbarPhoto ? (
                <ResolvedImage storageId={doctorSettings.navbarPhoto} alt="Dr. Al Hasan Al Saiem" className="h-12 w-12 rounded-xl object-cover border border-border/40" imgClassName="w-full h-full rounded-xl object-cover" lazy={false} />
              ) : (
                <img
                  src={doctorLogo}
                  alt="Dr. Al Hasan Al Saiem"
                  className="h-12 w-12 rounded-xl object-cover border border-border/40"
                />
              )}
              <span className="font-serif-luxury text-lg font-semibold text-foreground">
                {t.nav.logo}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {footerDescription}
            </p>

            {/* Social Media Links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-5">
                {socialLinks.map((link) => (
                  <a
                    key={link.icon}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 hover:bg-primary/25 hover:scale-110 transition-all duration-300 cursor-pointer"
                    aria-label={link.label}
                    title={link.label}
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
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.home}</Link></li>
              <li><a href="/#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.about}</a></li>
              <li><Link to="/procedures" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.procedures}</Link></li>
              <li><Link to="/before-after" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.beforeAfter}</Link></li>
              <li><a href="/#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.testimonials}</a></li>
              <li><a href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.faq}</a></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.contact}</Link></li>
              <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.blog}</Link></li>
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
                  <li><Link to="/procedure/upper-eyelid-lift" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.procedures.blepharoplasty}</Link></li>
                  <li><Link to="/procedure/botox-injections" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.procedures.botox}</Link></li>
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
        <div className="mt-12 pt-6 border-t border-border/30">
          {/* Credit line — always in English */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 text-xs text-muted-foreground/70">
            <span>
              Developed &amp; Designed by{" "}
              <span className="font-semibold text-foreground/80 tracking-wide">Ali Joma</span>
            </span>
            <span className="hidden sm:inline text-muted-foreground/40">•</span>
            <div className="flex items-center gap-2">
              <a
                href="mailto:abo3dam@gmail.com"
                aria-label="Email Ali Joma"
                title="abo3dam@gmail.com"
                className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://wa.me/963933178794"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Ali Joma"
                title="+963 933 178 794"
                className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 hover:bg-primary/20 text-[#25D366] transition-colors"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </div>
    </footer>
  );
}

// Simple inline social icons (SVG)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function SocialIcon({ name }: { name: string }) {
  const iconClass = "h-5 w-5 text-primary group-hover:scale-110 transition-transform";
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
