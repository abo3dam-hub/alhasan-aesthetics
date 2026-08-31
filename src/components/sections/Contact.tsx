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
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const infoItems = [
  { icon: Phone, key: "phone", detail: "+966 XX XXX XXXX" },
  { icon: Mail, key: "email", detail: "info@dr-alhasan.com" },
  { icon: MapPin, key: "location", detail: "lines" },
  { icon: Clock, key: "hours", detail: "hoursDetail" },
];

export default function Contact() {
  const { t, dir } = useI18n();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const createConsultation = useMutation(api.consultations.create);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    try {
      await createConsultation({ name, email, subject, message });
      setSent(true);
      toast.success(
        dir === "rtl"
          ? "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً."
          : "Your message has been sent successfully! We'll get back to you soon."
      );
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(
        dir === "rtl"
          ? "حدث خطأ أثناء الإرسال. حاول مرة أخرى."
          : "An error occurred while sending. Please try again."
      );
    } finally {
      setSending(false);
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
                        <span>Syria, Damascus, Lattakia</span>
                        <span>United Arab Emirates, Dubai</span>
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
                    {dir === "rtl" ? "تم الإرسال بنجاح!" : "Message Sent!"}
                  </h4>
                  <p className="text-muted-foreground max-w-sm">
                    {dir === "rtl"
                      ? "شكراً لتواصلك معنا. سنتواصل معك في أقرب وقت ممكن."
                      : "Thank you for reaching out. We'll get back to you as soon as possible."}
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
                <form id="contact-form" onSubmit={handleSubmit} className="space-y-5">
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
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
