import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { useState, useMemo } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Contact() {
  const { t, dir } = useI18n();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);

  const phone = doctorSettings?.phone || "+966 XX XXX XXXX";
  const email = doctorSettings?.email || "info@dr-alhasan.com";
  const addressEn = doctorSettings?.addressEn || "Syria, Damascus, Lattakia\nUnited Arab Emirates, Dubai";
  const addressAr = doctorSettings?.addressAr || "سوريا، دمشق، اللاذقية\nالإمارات العربية المتحدة، دبي";

  const infoItems = [
    { icon: Phone, key: "phone", detail: phone },
    { icon: Mail, key: "email", detail: email },
    { icon: MapPin, key: "location", detail: "lines" },
    { icon: Clock, key: "hours", detail: "hoursDetail" },
  ];
  const [sent, setSent] = useState(false);

  const whatsappNumber = useMemo(() => {
    const raw = doctorSettings?.whatsappNumber || "";
    return raw.replace(/[^0-9]/g, "");
  }, [doctorSettings]);

  const isArabic = dir === "rtl";

  const handleWhatsAppSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const formEmail = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const text = isArabic
      ? ["مرحباً دكتور الحسن،", "", `الاسم: ${name}`, `البريد: ${formEmail}`, `الموضوع: ${subject}`, "", message].join("\n")
      : ["Hello Dr. Al Hasan,", "", `Name: ${name}`, `Email: ${formEmail}`, `Subject: ${subject}`, "", message].join("\n");

    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
      setSent(true);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 luxury-gradient pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
          dir={dir}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-medium text-muted-foreground mb-6">
            {t.contact.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-foreground">{t.contact.title}</span>{" "}
            <span className="font-serif-luxury text-primary">{t.contact.titleHighlight}</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t.contact.subtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8" dir={dir}>
          {/* Info Cards */}
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={{
              ...fadeInUp,
              visible: { ...fadeInUp.visible, transition: { duration: 0.6, delay: 0.1 } },
            }}
            className="lg:col-span-2 space-y-4"
          >
            {infoItems.map((item) => (
              <div
                key={item.key}
                className="glass-card rounded-2xl p-5 flex items-start gap-4 hover:bg-white/60 transition-colors"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.contact[item.key as keyof typeof t.contact]}
                  </p>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {item.detail === "hoursDetail" ? (
                      t.contact.hoursDetail
                    ) : item.detail === "lines" ? (
                      <span className="flex flex-col">
                        {(isArabic ? addressAr : addressEn).split('\n').map((line: string, i: number) => (
                          <span key={i}>{line}</span>
                        ))}
                      </span>
                    ) : (
                      item.detail
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={{
              ...fadeInUp,
              visible: { ...fadeInUp.visible, transition: { duration: 0.6, delay: 0.2 } },
            }}
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
                    {dir === "rtl" ? "تم فتح واتساب!" : "WhatsApp Opened!"}
                  </h4>
                  <p className="text-muted-foreground max-w-sm">
                    {dir === "rtl"
                      ? "تم فتح واتساب مع رسالتك. أرسلها الآن للتواصل معنا."
                      : "WhatsApp has been opened with your message. Send it now to reach us."}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 rounded-full"
                    onClick={() => {
                      setSent(false);
                      const form = document.getElementById("contact-form") as HTMLFormElement;
                      form?.reset();
                    }}
                  >
                    {dir === "rtl" ? "إرسال رسالة جديدة" : "Send Another Message"}
                  </Button>
                </div>
              ) : (
                <form id="contact-form" onSubmit={handleWhatsAppSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm text-foreground">
                        {t.contact.name}
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder={t.contact.namePlaceholder}
                        className="bg-white/40 border-border/50 focus:bg-white/60 transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm text-foreground">
                        {t.contact.email}
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t.contact.emailPlaceholder}
                        className="bg-white/40 border-border/50 focus:bg-white/60 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm text-foreground">
                      {t.contact.subject}
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder={t.contact.subjectPlaceholder}
                      className="bg-white/40 border-border/50 focus:bg-white/60 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm text-foreground">
                      {t.contact.message}
                    </Label>
                    <Textarea
                      id="message"
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
                      {t.contact.send}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
