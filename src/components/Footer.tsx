import { useI18n } from "@/i18n";
import { Phone, Mail, MapPin, Globe } from "lucide-react";

const doctorLogo = "/assets/4.jpg";

export default function Footer() {
  const { t, dir, toggleLocale } = useI18n();
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: t.nav.about, href: "#about" },
    { label: t.nav.procedures, href: "#procedures" },
    { label: t.nav.beforeAfter, href: "#before-after" },
    { label: t.nav.testimonials, href: "#testimonials" },
    { label: t.nav.faq, href: "#faq" },
    { label: t.nav.contact, href: "#contact" },
  ];

  const services = [
    t.procedures.blepharoplasty,
    t.procedures.faceNeckLift,
    t.procedures.rhinoplasty,
    t.procedures.liposuctionFat,
    t.procedures.tummyTuck,
    t.procedures.botox,
    t.procedures.fillers,
    t.procedures.armThighLift,
    t.procedures.breastSurgery,
    t.procedures.scarRevision,
  ];

  return (
    <footer className="relative overflow-hidden border-t border-border/30" dir={dir}>
      <div className="absolute inset-0 luxury-gradient pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <a href="#home" className="flex items-center gap-3 mb-4">
                <img
                  src={doctorLogo}
                  alt="Dr. Al Hasan Al Saiem"
                  className="h-12 w-12 rounded-xl object-cover border border-border/40 shadow-sm"
                />
                <span className="font-serif-luxury text-lg font-semibold text-foreground leading-tight">
                  {t.nav.logo}
                </span>
              </a>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {t.footer.description}
              </p>
              <button
                onClick={toggleLocale}
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <Globe className="h-4 w-4" />
                {t.common.switchLang}
              </button>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">
                {t.footer.quickLinks}
              </h3>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">
                {t.footer.services}
              </h3>
              <ul className="space-y-2">
                {services.map((service) => (
                  <li key={service}>
                    <a
                      href="#procedures"
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Hours */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">
                {t.footer.workingHours}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span>+966 XX XXX XXXX</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span>info@dr-alhasan.com</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="flex flex-col">
                    <span>Syria, Damascus, Lattakia</span>
                    <span>United Arab Emirates, Dubai</span>
                  </span>
                </div>
                <div className="h-px bg-border/40 my-2" />
                <div className="text-sm space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t.footer.weekdays}</span>
                    <span className="text-foreground/80">9 AM - 6 PM</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t.footer.friday}</span>
                    <span className="text-foreground/80">Closed</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t.footer.saturday}</span>
                    <span className="text-foreground/80">10 AM - 2 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/30 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {year} {t.nav.logo}. {t.footer.rights}.
          </p>
        </div>
      </div>
    </footer>
  );
}
