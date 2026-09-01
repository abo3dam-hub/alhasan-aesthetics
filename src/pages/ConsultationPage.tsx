import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  User,
  Calendar,
  Globe,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import GlassNavbar from "@/components/GlassNavbar";
import { cn } from "@/lib/utils";

// Fallback procedures (used when CMS data isn't loaded yet)
const fallbackProcedures = [
  { slug: "blepharoplasty", titleAr: "شد الأجفان العلوية والسفلية", titleEn: "Upper & Lower Eyelid Lift" },
  { slug: "face-neck-lift", titleAr: "شد الوجه والرقبة", titleEn: "Face & Neck Lift" },
  { slug: "rhinoplasty", titleAr: "تجميل الأنف", titleEn: "Rhinoplasty" },
  { slug: "liposuction-fat-transfer", titleAr: "شفط الشحم وحقن الشحم", titleEn: "Liposuction & Fat Transfer" },
  { slug: "tummy-tuck", titleAr: "شد البطن", titleEn: "Tummy Tuck" },
  { slug: "botox", titleAr: "حقن البوتوكس", titleEn: "Botox Injections" },
  { slug: "fillers", titleAr: "الفيلر", titleEn: "Fillers" },
  { slug: "arm-thigh-lift", titleAr: "شد العضدين والفخذين", titleEn: "Arm & Thigh Lift" },
  { slug: "breast-augmentation-reduction", titleAr: "تكبير/تصغير الثدي", titleEn: "Breast Augmentation / Reduction" },
  { slug: "scar-deformity-correction", titleAr: "إصلاح الندب والتشوهات", titleEn: "Scar & Deformity Correction" },
];

const otherProcedureKey = "other";

const genderOptions = [
  { value: "male", labelAr: "ذكر", labelEn: "Male" },
  { value: "female", labelAr: "أنثى", labelEn: "Female" },
];

const countries = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia",
  "Australia","Austria","Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium",
  "Bhutan","Bolivia","Bosnia and Herzegovina","Brazil","Brunei","Bulgaria",
  "Cambodia","Cameroon","Canada","Chad","Chile","China","Colombia","Comoros",
  "Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark",
  "Djibouti","Dominican Republic","Ecuador","Egypt","El Salvador","Eritrea",
  "Estonia","Ethiopia","Finland","France","Gabon","Gambia","Georgia","Germany",
  "Ghana","Greece","Guatemala","Guinea","Haiti","Honduras","Hungary","Iceland",
  "India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast",
  "Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan",
  "Laos","Latvia","Lebanon","Liberia","Libya","Lithuania","Luxembourg",
  "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania",
  "Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco",
  "Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand",
  "Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
  "Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay",
  "Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia",
  "Rwanda","Saudi Arabia","Senegal","Serbia","Sierra Leone","Singapore",
  "Slovakia","Slovenia","Somalia","South Africa","South Korea","Spain",
  "Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan",
  "Tajikistan","Tanzania","Thailand","Tunisia","Turkey","Turkmenistan",
  "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States",
  "Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
  "Syrian",
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

type FormData = {
  selectedProcedures: string[];
  otherProcedure: string;
  fullName: string;
  age: string;
  gender: string;
  nationality: string;
  nationalitySearch: string;
  currentResidence: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function ConsultationPage() {
  const { t, dir, locale } = useI18n();
  const isRtl = dir === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const isArabic = locale === "ar";

  const procedures = useQuery(api.procedures.listActive);
  const doctorSettings = useQuery(api.siteSettings.getDoctorSettings);

  const procedureList = useMemo(() => {
    if (procedures && procedures.length > 0) {
      return procedures.map((p) => ({
        slug: p.slug,
        titleAr: p.titleAr,
        titleEn: p.titleEn,
      }));
    }
    return fallbackProcedures;
  }, [procedures]);

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [form, setForm] = useState<FormData>({
    selectedProcedures: [],
    otherProcedure: "",
    fullName: "",
    age: "",
    gender: "",
    nationality: "",
    nationalitySearch: "",
    currentResidence: "",
  });

  const updateForm = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleProcedure = (slug: string) => {
    setForm((prev) => {
      const selected = prev.selectedProcedures.includes(slug)
        ? prev.selectedProcedures.filter((s) => s !== slug)
        : [...prev.selectedProcedures, slug];
      return { ...prev, selectedProcedures: selected };
    });
    setErrors((prev) => ({ ...prev, selectedProcedures: undefined }));
  };

  const filteredCountries = useMemo(() => {
    if (!form.nationalitySearch) return countries;
    const search = form.nationalitySearch.toLowerCase();
    return countries.filter((c) => c.toLowerCase().includes(search));
  }, [form.nationalitySearch]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (form.selectedProcedures.length === 0) {
        newErrors.selectedProcedures = isArabic ? "يرجى اختيار إجراء واحد على الأقل" : "Please select at least one procedure";
      }
      if (form.selectedProcedures.includes(otherProcedureKey) && !form.otherProcedure.trim()) {
        newErrors.otherProcedure = isArabic ? "يرجى ذكر الإجراء" : "Please specify the procedure";
      }
    }

    if (step === 2) {
      if (!form.fullName.trim()) {
        newErrors.fullName = isArabic ? "الاسم الثلاثي مطلوب" : "Full name is required";
      }
      if (!form.age.trim() || isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120) {
        newErrors.age = isArabic ? "يرجى إدخال عمر صحيح" : "Please enter a valid age";
      }
      if (!form.gender) {
        newErrors.gender = isArabic ? "الجنس مطلوب" : "Gender is required";
      }
      if (!form.nationality.trim()) {
        newErrors.nationality = isArabic ? "الجنسية مطلوبة" : "Nationality is required";
      }
      if (!form.currentResidence.trim()) {
        newErrors.currentResidence = isArabic ? "مكان الإقامة مطلوب" : "Current residence is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setStep(step + 1);
    }
  };

  const generateWhatsAppMessage = () => {
    const selectedNames = procedureList
      .filter((p) => form.selectedProcedures.includes(p.slug))
      .map((p) => `• ${isArabic ? p.titleAr : p.titleEn}`);

    if (form.selectedProcedures.includes(otherProcedureKey)) {
      selectedNames.push(`• ${form.otherProcedure}`);
    }

    const genderLabel = genderOptions.find((g) => g.value === form.gender)?.[isArabic ? "labelAr" : "labelEn"] || form.gender;

    if (isArabic) {
      return [
        "مرحباً دكتور الحسن،",
        "",
        "أرغب بالاستفسار عن الاستشارة والأسعار.",
        "",
        `الاسم: ${form.fullName}`,
        `العمر: ${form.age}`,
        `الجنس: ${genderLabel}`,
        `الجنسية: ${form.nationality}`,
        `مكان الإقامة الحالي: ${form.currentResidence}`,
        "",
        "الإجراءات التي أرغب بالاستفسار عنها:",
        ...selectedNames,
        "",
        "شكراً لكم.",
      ].join("\n");
    }

    return [
      "Hello Dr. Al Hasan,",
      "",
      "I would like to inquire about a consultation and pricing.",
      "",
      `Full Name: ${form.fullName}`,
      `Age: ${form.age}`,
      `Gender: ${genderLabel}`,
      `Nationality: ${form.nationality}`,
      `Current Residence: ${form.currentResidence}`,
      "",
      "Procedures I am interested in:",
      ...selectedNames,
      "",
      "Thank you.",
    ].join("\n");
  };

  const handleWhatsAppSubmit = () => {
    if (!validate()) return;

    const message = generateWhatsAppMessage();
    const whatsappNumber = doctorSettings?.whatsappNumber || "";
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(url, "_blank");
  };

  const canProceedStep1 = () => {
    if (form.selectedProcedures.length === 0) return false;
    if (form.selectedProcedures.includes(otherProcedureKey) && !form.otherProcedure.trim()) return false;
    return true;
  };

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
              {isArabic ? "استشارة مجانية" : "Free Consultation"}
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-foreground mb-2">
              {isArabic ? "احجز استشارتك ومعرفة الأسعار" : "Book Your Consultation & Get Pricing"}
            </h1>
            <p className="text-muted-foreground">
              {isArabic
                ? "اختر الإجراءات التي تهتم بها وسنتواصل معك عبر واتساب لتقديم العرض."
                : "Select the procedures you're interested in and we'll reach out via WhatsApp with pricing."}
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-8 mb-10">
            {[1, 2].map((s) => (
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
                    ? isArabic ? "الإجراءات" : "Procedures"
                    : isArabic ? "بياناتك" : "Your Info"}
                </span>
                {s < 2 && (
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
        {/* Step 1: Choose Procedures */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {isArabic ? "اختر الإجراءات المطلوبة" : "Select Procedures of Interest"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {isArabic ? "يمكنك اختيار أكثر من إجراء" : "You can select multiple procedures"}
            </p>

            {errors.selectedProcedures && (
              <p className="text-sm text-red-500 mb-2">{errors.selectedProcedures}</p>
            )}

            {procedureList.map((proc) => {
              const selected = form.selectedProcedures.includes(proc.slug);
              return (
                <button
                  key={proc.slug}
                  type="button"
                  onClick={() => toggleProcedure(proc.slug)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border-2 transition-all",
                    selected
                      ? "border-primary bg-primary/5 glass-card"
                      : "border-border/40 hover:border-border/80 hover:bg-white/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {isArabic ? proc.titleAr : proc.titleEn}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? proc.titleEn : proc.titleAr}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                        selected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {selected && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Other Procedure */}
            <button
              type="button"
              onClick={() => toggleProcedure(otherProcedureKey)}
              className={cn(
                "w-full text-left p-4 rounded-2xl border-2 transition-all",
                form.selectedProcedures.includes(otherProcedureKey)
                  ? "border-primary bg-primary/5 glass-card"
                  : "border-border/40 hover:border-border/80 hover:bg-white/40"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {isArabic ? "إجراء آخر" : "Other Procedure"}
                  </p>
                </div>
                <div
                  className={cn(
                    "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                    form.selectedProcedures.includes(otherProcedureKey)
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {form.selectedProcedures.includes(otherProcedureKey) && <CheckCircle2 className="h-3 w-3 text-white" />}
                </div>
              </div>
            </button>

            {form.selectedProcedures.includes(otherProcedureKey) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2 pl-4"
              >
                <Label className="text-sm text-foreground">
                  {isArabic ? "يرجى ذكر الإجراء" : "Please specify the procedure"}
                </Label>
                <Input
                  value={form.otherProcedure}
                  onChange={(e) => updateForm("otherProcedure", e.target.value)}
                  placeholder={isArabic ? "اكتب اسم الإجراء..." : "Type the procedure name..."}
                  className="bg-white/40 border-border/50"
                />
                {errors.otherProcedure && (
                  <p className="text-sm text-red-500">{errors.otherProcedure}</p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2: Patient Information */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {isArabic ? "بياناتك الشخصية" : "Your Information"}
            </h2>

            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-sm text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                {isArabic ? "الاسم الثلاثي" : "Full Name"} *
              </Label>
              <Input
                value={form.fullName}
                onChange={(e) => updateForm("fullName", e.target.value)}
                placeholder={isArabic ? "أدخل اسمك الكامل" : "Enter your full name"}
                className={cn("bg-white/40 border-border/50 h-12", errors.fullName && "border-red-400")}
                dir={dir}
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
            </div>

            {/* Age & Gender */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {isArabic ? "العمر" : "Age"} *
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={(e) => updateForm("age", e.target.value)}
                  placeholder={isArabic ? "العمر" : "Age"}
                  className={cn("bg-white/40 border-border/50 h-12", errors.age && "border-red-400")}
                />
                {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  {isArabic ? "الجنس" : "Gender"} *
                </Label>
                <div className="flex gap-2 h-12">
                  {genderOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateForm("gender", opt.value)}
                      className={cn(
                        "flex-1 rounded-xl text-sm font-medium transition-all border-2",
                        form.gender === opt.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border/40 text-muted-foreground hover:border-border/80"
                      )}
                    >
                      {isArabic ? opt.labelAr : opt.labelEn}
                    </button>
                  ))}
                </div>
                {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
              </div>
            </div>

            {/* Nationality */}
            <div className="space-y-2 relative">
              <Label className="text-sm text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                {isArabic ? "الجنسية" : "Nationality"} *
              </Label>
              <Input
                value={form.nationality || form.nationalitySearch}
                onChange={(e) => {
                  updateForm("nationality", "");
                  updateForm("nationalitySearch", e.target.value);
                  setShowCountryDropdown(true);
                }}
                onFocus={() => setShowCountryDropdown(true)}
                placeholder={isArabic ? "ابحث عن جنسيتك..." : "Search your nationality..."}
                className={cn("bg-white/40 border-border/50 h-12", errors.nationality && "border-red-400")}
                dir="ltr"
              />
              {showCountryDropdown && (
                <div className="absolute z-50 top-full mt-1 w-full max-h-60 overflow-y-auto bg-white rounded-xl shadow-lg border border-border/40">
                  {filteredCountries.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      {isArabic ? "لا توجد نتائج" : "No results found"}
                    </div>
                  ) : (
                    filteredCountries.map((country) => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => {
                          updateForm("nationality", country);
                          updateForm("nationalitySearch", "");
                          setShowCountryDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors",
                          form.nationality === country && "bg-primary/10 text-primary font-medium"
                        )}
                      >
                        {country}
                      </button>
                    ))
                  )}
                </div>
              )}
              {errors.nationality && <p className="text-sm text-red-500">{errors.nationality}</p>}
            </div>

            {/* Current Residence */}
            <div className="space-y-2">
              <Label className="text-sm text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {isArabic ? "مكان الإقامة الحالي" : "Current Residence"} *
              </Label>
              <Input
                value={form.currentResidence}
                onChange={(e) => updateForm("currentResidence", e.target.value)}
                placeholder={isArabic ? "مثال: بيروت، لبنان" : "e.g., Beirut, Lebanon"}
                className={cn("bg-white/40 border-border/50 h-12", errors.currentResidence && "border-red-400")}
                dir={dir}
              />
              {errors.currentResidence && <p className="text-sm text-red-500">{errors.currentResidence}</p>}
            </div>

            {/* Summary */}
            <div className="glass-card rounded-2xl p-5 mt-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                {isArabic ? "ملخص طلبك" : "Your Request Summary"}
              </h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArabic ? "الإجراءات" : "Procedures"}</span>
                  <span className="font-medium text-foreground text-end">
                    {procedureList
                      .filter((p) => form.selectedProcedures.includes(p.slug))
                      .map((p) => (isArabic ? p.titleAr : p.titleEn))
                      .join(", ")}
                    {form.selectedProcedures.includes(otherProcedureKey) && `, ${form.otherProcedure}`}
                  </span>
                </div>
                {form.fullName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isArabic ? "الاسم" : "Name"}</span>
                    <span className="font-medium text-foreground">{form.fullName}</span>
                  </div>
                )}
                {form.age && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isArabic ? "العمر" : "Age"}</span>
                    <span className="font-medium text-foreground">{form.age}</span>
                  </div>
                )}
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

          {step < 2 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceedStep1()}
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
              onClick={handleWhatsAppSubmit}
              className="rounded-full px-6 sm:px-8 bg-[#25D366] hover:bg-[#20BD5B] text-white shadow-lg shadow-[#25D366]/20 gap-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {isArabic ? "إرسال الطلب عبر WhatsApp" : "Send Request via WhatsApp"}
            </Button>
          )}
        </div>
      </div>

      {/* Click outside to close country dropdown */}
      {showCountryDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCountryDropdown(false)}
        />
      )}
    </div>
  );
}
