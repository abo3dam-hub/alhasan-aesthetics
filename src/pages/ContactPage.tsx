import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import GlassNavbar from "@/components/GlassNavbar";
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  MessageSquare,
  Calendar,
  Globe,
} from "lucide-react";

export default function ContactPage() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const isArabic = dir === "rtl";

  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);

  const phone = doctorSettings?.phone || "+966 XX XXX XXXX";
  const email = doctorSettings?.email || "info@dr-alhasan.com";
  const addressEn = doctorSettings?.addressEn || "Syria, Damascus, Lattakia\nUnited Arab Emirates, Dubai";
  const addressAr = doctorSettings?.addressAr || "سوريا، دمشق، اللاذقية\nالإمارات العربية المتحدة، دبي";

  const whatsappNumber = useMemo(() => {
    const raw = doctorSettings?.whatsappNumber || "";
    return raw.replace(/[^0-9]/g, "");
  }, [doctorSettings]);

  const socialMedia = doctorSettings?.socialMedia || {};
  const socialLinks: { url: string; label: string; icon: string }[] = [];
  if (socialMedia.instagram) socialLinks.push({ url: socialMedia.instagram, label: "Instagram", icon: "instagram" });
  if (socialMedia.facebook) socialLinks.push({ url: socialMedia.facebook, label: "Facebook", icon: "facebook" });
  if (socialMedia.twitter) socialLinks.push({ url: socialMedia.twitter, label: "Twitter/X", icon: "twitter" });
  if (socialMedia.snapchat) socialLinks.push({ url: socialMedia.snapchat, label: "Snapchat", icon: "snapchat" });
  if (socialMedia.tiktok) socialLinks.push({ url: socialMedia.tiktok, label: "TikTok", icon: "tiktok" });

  const [sent, setSent] = useState(false);

  const handleWhatsAppSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const formEmail = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const text = isArabic
      ? ["مرحباً دكتور الحسن،", "", `الاسم: ${name}`, `البريد: ${formEmail}`, `الموضوع: ${subject}`, "", message].join("\n")
      : ["Hello Dr. Al Hasan.", "", `Name: ${name}`, `Email: ${formEmail}`, `Subject: ${subject}`, "", message].join("\n");

    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <GlassNavbar />

      {/* Hero Header */}
      <section className="pt-24 pb-16 hero-gradient">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {isRtl ? (
                <>
                  {t.contactPage.backHome}
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  {t.contactPage.backHome}
                </>
              )}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm font-medium text-primary mb-6">
              <MessageSquare className="h-4 w-4" />
              {t.contact.badge}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-bold text-foreground mb-4">
              {t.contactPage.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t.contactPage.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
            {/* Contact Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2 space-y-4"
            >
              {/* Phone */}
              <div className="glass-card rounded-2xl p-5 flex items-start gap-4 hover:bg-white/60 transition-colors">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.contact.phone}</p>
                  <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="glass-card rounded-2xl p-5 flex items-start gap-4 hover:bg-white/60 transition-colors">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.contact.email}</p>
                  <a href={`mailto:${email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {email}
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="glass-card rounded-2xl p-5 flex items-start gap-4 hover:bg-white/60 transition-colors">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.contact.location}</p>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {(isArabic ? addressAr : addressEn).split("\n").map((line: string, i: number) => (
                      <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="glass-card rounded-2xl p-5 flex items-start gap-4 hover:bg-white/60 transition-colors">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.contact.hours}</p>
                  <p className="text-sm text-muted-foreground">{t.contact.hoursDetail}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.footer.friday}: {doctorSettings?.workingHoursFriday || (isRtl ? "مغلق" : "Closed")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.footer.saturday}: {doctorSettings?.workingHoursSaturday || (isRtl ? "مغلق" : "Closed")}
                  </p>
                </div>
              </div>

              {/* Social Media */}
              {socialLinks.length > 0 && (
                <div className="glass-card rounded-2xl p-5">
                  <p className="text-sm font-semibold text-foreground mb-4">
                    {isArabic ? "تابعنا على" : "Follow Us"}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((link) => (
                      <a
                        key={link.icon}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-300 group"
                        aria-label={link.label}
                      >
                        <SocialIcon name={link.icon} />
                        <span className="text-sm font-medium text-foreground">{link.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="glass-elevated rounded-3xl p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  {t.contact.sendMessage}
                </h3>

                {sent ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {isRtl ? "تم فتح واتساب!" : "WhatsApp Opened!"}
                    </h4>
                    <p className="text-muted-foreground max-w-sm">
                      {isRtl
                        ? "تم فتح واتساب مع رسالتك. أرسلها الآن للتواصل معنا."
                        : "WhatsApp has been opened with your message. Send it now to reach us."}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6 rounded-full"
                      onClick={() => {
                        setSent(false);
                        const form = document.getElementById("contact-page-form") as HTMLFormElement;
                        form?.reset();
                      }}
                    >
                      {isRtl ? "إرسال رسالة جديدة" : "Send Another Message"}
                    </Button>
                  </div>
                ) : (
                  <form id="contact-page-form" onSubmit={handleWhatsAppSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name" className="text-sm text-foreground">
                          {t.contact.name}
                        </Label>
                        <Input
                          id="contact-name"
                          name="name"
                          placeholder={t.contact.namePlaceholder}
                          className="bg-white/40 border-border/50 focus:bg-white/60 transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email" className="text-sm text-foreground">
                          {t.contact.email}
                        </Label>
                        <Input
                          id="contact-email"
                          name="email"
                          type="email"
                          placeholder={t.contact.emailPlaceholder}
                          className="bg-white/40 border-border/50 focus:bg-white/60 transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-subject" className="text-sm text-foreground">
                        {t.contact.subject}
                      </Label>
                      <Input
                        id="contact-subject"
                        name="subject"
                        placeholder={t.contact.subjectPlaceholder}
                        className="bg-white/40 border-border/50 focus:bg-white/60 transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-message" className="text-sm text-foreground">
                        {t.contact.message}
                      </Label>
                      <Textarea
                        id="contact-message"
                        name="message"
                        placeholder={t.contact.messagePlaceholder}
                        rows={5}
                        className="bg-white/40 border-border/50 focus:bg-white/60 transition-colors resize-none"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {t.contact.send}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Consultation CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-elevated rounded-3xl p-8 sm:p-12 glow-champagne"
          >
            <Calendar className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-serif-luxury font-bold text-foreground mb-4">
              {isRtl ? "هل تريد استشارة مجانية؟" : "Want a Free Consultation?"}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {isRtl
                ? "احجز استشارتك المجانية مع د. الحسن الصايم واكتشف أفضل إجراء لحالتك."
                : "Book your free consultation with Dr. Al Hasan Al Saiem and discover the best procedure for your case."}
            </p>
            <Link to="/consultation">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base">
                {t.contactPage.consultationCta}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Simple inline social icons (SVG) - improved version
function SocialIcon({ name }: { name: string }) {
  const iconClass = "h-4 w-4 text-primary group-hover:scale-110 transition-transform";
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
