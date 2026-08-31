import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import GlassNavbar from "@/components/GlassNavbar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const procedureOptions = [
  { slug: "blepharoplasty", ar: "شد الأجفان العلوية والسفلية", en: "Upper & Lower Eyelid Lift" },
  { slug: "face-neck-lift", ar: "شد الوجه والرقبة", en: "Face & Neck Lift" },
  { slug: "rhinoplasty", ar: "تجميل الأنف", en: "Rhinoplasty" },
  { slug: "liposuction-fat-transfer", ar: "شفط الشحم وحقن الشحم", en: "Liposuction & Fat Transfer" },
  { slug: "tummy-tuck", ar: "شد البطن", en: "Tummy Tuck" },
  { slug: "botox", ar: "حقن البوتوكس", en: "Botox Injections" },
  { slug: "fillers", ar: "الفيلر", en: "Fillers" },
  { slug: "arm-thigh-lift", ar: "شد العضدين والفخذين", en: "Arm & Thigh Lift" },
  { slug: "breast-augmentation-reduction", ar: "تكبير/تصغير الثدي", en: "Breast Augmentation / Reduction" },
  { slug: "scar-deformity-correction", ar: "إصلاح الندب والتشوهات", en: "Scar & Deformity Correction" },
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

export default function BookingPage() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const [searchParams] = useSearchParams();
  const preselectedProcedure = searchParams.get("procedure") || "";

  const createBooking = useMutation(api.bookings.create);
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    procedure: preselectedProcedure,
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) return form.procedure !== "";
    if (step === 2) return form.date !== "" && form.time !== "";
    if (step === 3) return form.name !== "" && form.email !== "" && form.phone !== "";
    return true;
  };

  const handleSubmit = async () => {
    setSending(true);
    try {
      await createBooking({
        patientName: form.name,
        patientEmail: form.email,
        patientPhone: form.phone,
        procedureType: form.procedure,
        preferredDate: form.date,
        preferredTime: form.time,
        message: form.message || undefined,
      });
      setSubmitted(true);
      toast.success(
        isRtl
          ? "تم حجز موعدك بنجاح! سنتواصل معك للتأكيد."
          : "Your appointment has been booked successfully! We'll contact you to confirm."
      );
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(
        isRtl
          ? "حدث خطأ أثناء الحجز. حاول مرة أخرى."
          : "An error occurred while booking. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <GlassNavbar />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-elevated rounded-3xl p-8 sm:p-12 max-w-lg mx-4 text-center glow-champagne"
          >
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-serif-luxury font-bold text-foreground mb-3">
              {isRtl ? "تم الحجز بنجاح!" : "Booking Confirmed!"}
            </h2>
            <p className="text-muted-foreground mb-2">
              {isRtl ? "شكراً لك،" : "Thank you,"} {form.name}
            </p>
            <div className="glass-card rounded-2xl p-5 my-6 text-right" dir={dir}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isRtl ? "الإجراء" : "Procedure"}</span>
                  <span className="font-medium text-foreground">
                    {procedureOptions.find((p) => p.slug === form.procedure)?.[isRtl ? "ar" : "en"]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isRtl ? "التاريخ" : "Date"}</span>
                  <span className="font-medium text-foreground">{form.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isRtl ? "الوقت" : "Time"}</span>
                  <span className="font-medium text-foreground">{form.time}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              {isRtl
                ? "سنتواصل معك خلال 24 ساعة لتأكيد الموعد."
                : "We'll contact you within 24 hours to confirm your appointment."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8">
                  {isRtl ? "العودة للرئيسية" : "Back to Home"}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <GlassNavbar />

      <div className="pt-24 pb-16 hero-gradient">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Back */}
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
                <>العودة للرئيسية<ArrowRight className="h-4 w-4" /></>
              ) : (
                <><ArrowLeft className="h-4 w-4" />Back to Home</>
              )}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm font-medium text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              {isRtl ? "حجز استشارة مجانية" : "Free Consultation Booking"}
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-foreground mb-2">
              {isRtl ? "احجز موعدك" : "Book Your Appointment"}
            </h1>
            <p className="text-muted-foreground">
              {isRtl
                ? "اختر الإجراء والوقت المناسب وسنتأكيد موعدك خلال 24 ساعة."
                : "Choose your procedure and preferred time, and we'll confirm your appointment within 24 hours."}
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-8 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all",
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {s}
                </div>
                <span className={cn(
                  "text-xs font-medium hidden sm:inline",
                  step >= s ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s === 1
                    ? isRtl ? "الإجراء" : "Procedure"
                    : s === 2
                    ? isRtl ? "الموعد" : "Schedule"
                    : isRtl ? "البيانات" : "Details"}
                </span>
                {s < 3 && (
                  <div className={cn(
                    "h-0.5 flex-1 rounded-full",
                    step > s ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-20">
        {/* Step 1: Choose Procedure */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {isRtl ? "اختر الإجراء المطلوب" : "Select Your Procedure"}
            </h2>
            {procedureOptions.map((proc) => (
              <button
                key={proc.slug}
                onClick={() => updateForm("procedure", proc.slug)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border-2 transition-all",
                  form.procedure === proc.slug
                    ? "border-primary bg-primary/5 glass-card"
                    : "border-border/40 hover:border-border/80 hover:bg-white/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {isRtl ? proc.ar : proc.en}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isRtl ? proc.en : proc.ar}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      form.procedure === proc.slug
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {form.procedure === proc.slug && (
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {/* Step 2: Choose Date & Time */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {isRtl ? "اختر التاريخ" : "Select Date"}
              </h2>
              <Input
                type="date"
                min={today}
                value={form.date}
                onChange={(e) => updateForm("date", e.target.value)}
                className="bg-white/40 border-border/50 h-12 text-base"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {isRtl ? "اختر الوقت" : "Select Time"}
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => updateForm("time", slot)}
                    className={cn(
                      "py-3 px-2 rounded-xl text-sm font-medium transition-all border",
                      form.time === slot
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/40 hover:border-primary/40 hover:bg-white/40 text-foreground"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                {isRtl
                  ? "ساعات العمل: الأحد - الخميس، ٩ صباحاً - ٦ مساءً"
                  : "Working hours: Sun - Thu, 9 AM - 6 PM"}
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 3: Personal Info */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {isRtl ? "بياناتك الشخصية" : "Your Information"}
            </h2>

            <div className="space-y-2">
              <Label className="text-sm text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                {isRtl ? "الاسم الكامل" : "Full Name"}
              </Label>
              <Input
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder={isRtl ? "أدخل اسمك الكامل" : "Enter your full name"}
                className="bg-white/40 border-border/50 h-12"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  {isRtl ? "البريد الإلكتروني" : "Email"}
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  placeholder="name@example.com"
                  className="bg-white/40 border-border/50 h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  {isRtl ? "رقم الهاتف" : "Phone Number"}
                </Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  placeholder="+966 XX XXX XXXX"
                  className="bg-white/40 border-border/50 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                {isRtl ? "ملاحظات إضافية (اختياري)" : "Additional Notes (Optional)"}
              </Label>
              <Textarea
                value={form.message}
                onChange={(e) => updateForm("message", e.target.value)}
                placeholder={isRtl ? "أي ملاحظات أو أسئلة..." : "Any notes or questions..."}
                rows={3}
                className="bg-white/40 border-border/50 resize-none"
              />
            </div>

            {/* Summary */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-3">
                {isRtl ? "ملخص الحجز" : "Booking Summary"}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isRtl ? "الإجراء" : "Procedure"}</span>
                  <span className="font-medium text-foreground">
                    {procedureOptions.find((p) => p.slug === form.procedure)?.[isRtl ? "ar" : "en"]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isRtl ? "التاريخ" : "Date"}</span>
                  <span className="font-medium text-foreground">{form.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isRtl ? "الوقت" : "Time"}</span>
                  <span className="font-medium text-foreground">{form.time}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="rounded-full px-6"
            >
              {isRtl ? (
                <><ArrowRight className="h-4 w-4 mr-2" />السابق</>
              ) : (
                <><ArrowLeft className="h-4 w-4 mr-2" />Back</>
              )}
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isRtl ? (
                <>التالي<ArrowLeft className="h-4 w-4 ml-2" /></>
              ) : (
                <>Next<ArrowRight className="h-4 w-4 ml-2" /></>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || sending}
              className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {sending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />{isRtl ? "جاري الحجز..." : "Booking..."}</>
              ) : (
                <>{isRtl ? "تأكيد الحجز" : "Confirm Booking"}</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
