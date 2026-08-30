import { useI18n } from "@/i18n";
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
  Send,
  Loader2,
} from "lucide-react";
import { useState } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const infoItems = [
  { icon: Phone, key: "phone", detail: "+966 XX XXX XXXX" },
  { icon: Mail, key: "email", detail: "info@dr-alhasan.com" },
  { icon: MapPin, key: "location", detail: "Riyadh, Saudi Arabia" },
  { icon: Clock, key: "hours", detail: "hoursDetail" },
];

export default function Contact() {
  const { t, dir } = useI18n();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => setSending(false), 1500);
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
            {infoItems.map((item, i) => (
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
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {item.detail === "hoursDetail"
                      ? t.contact.hoursDetail
                      : item.detail}
                  </p>
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
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-foreground">
                      {t.contact.name}
                    </Label>
                    <Input
                      id="name"
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
                    placeholder={t.contact.messagePlaceholder}
                    rows={5}
                    className="bg-white/40 border-border/50 focus:bg-white/60 transition-colors resize-none"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={sending}
                  className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.contact.sending}
                    </>
                  ) : (
                    <>
                      {t.contact.send}
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
