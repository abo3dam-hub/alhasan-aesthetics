import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  HeartPulse,
  BadgeCheck,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassNavbar from "@/components/GlassNavbar";

const procedureData: Record<string, {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  longDescriptionAr: string;
  longDescriptionEn: string;
  duration: string;
  recovery: string;
  category: string;
}> = {
  "rhinoplasty": {
    titleAr: "تجميل الأنف",
    titleEn: "Rhinoplasty",
    descriptionAr: "تصميم وتشكيل الأنف لتحقيق تناغم مثالي مع ملامح الوجه",
    descriptionEn: "Sculpting and reshaping the nose to achieve ideal harmony with facial features",
    longDescriptionAr: "تجميل الأنف (Rhinoplasty) هو إجراء جراحي متقدم يهدف إلى تحسين شكل الأنف وتناسبه مع ملامح الوجه. يستخدم د. الحسن الصايم أحدث التقنيات الجراحية لتحقيق نتائج طبيعية ومتقنة.\n\nيمكن للإجراء تصحيح مشاكل مثل الحجم الكبير، الانحناء، عدم التماثل، أو وجود نتوءات. كما يمكن تحسين وظيفة التنفس في بعض الحالات.\n\nيتم الإجراء عادة تحت التخدير العام ويستغرق من 1 إلى 3 ساعات. فترة التعافي تتطلب أسبوعين من الراحة مع ارتداء جبيرة، والنتيجة النهائية تظهر خلال 6-12 شهراً.",
    longDescriptionEn: "Rhinoplasty is an advanced surgical procedure aimed at improving the shape of the nose and its proportion with facial features. Dr. Al Hasan Al Saiem uses the latest surgical techniques to achieve natural and refined results.\n\nThe procedure can correct issues such as large size, asymmetry, bumps, or breathing difficulties in some cases.\n\nThe procedure is typically performed under general anesthesia and takes 1-3 hours. Recovery requires two weeks of rest with a splint, and the final result appears within 6-12 months.",
    duration: "1-3 ساعات",
    recovery: "2-3 أسابيع",
    category: "face",
  },
  "face-neck-lift": {
    titleAr: "شد الوجه والرقبة",
    titleEn: "Face & Neck Lift",
    descriptionAr: "إعادة الشباب والحيوية للوجه والرقبة بأحدث تقنيات الشد المتقدمة",
    descriptionEn: "Restoring youth and vitality to the face and neck with the latest advanced lifting techniques",
    longDescriptionAr: "شد الوجه والرقبة هو إجراء تجميلي متقدم يهدف إلى استعادة مظهر أكثر شباباً وحيوية للوجه والرقبة. يعالج التجاعيد والترهلات وفقدان التوتة الطبيعية.\n\nيستخدم د. الحسن الصايم تقنيات متقدمة تضمن نتائج طبيعية دون مظهر \"مشدود\" بشكل مفرط.\n\nالاستشارة المجانية تحدد خطة العلاج المخصصة لحالة كل مريض.",
    longDescriptionEn: "Face & Neck Lift is an advanced cosmetic procedure aimed at restoring a more youthful and vibrant appearance to the face and neck. It addresses wrinkles, sagging, and loss of natural volume.\n\nDr. Al Hasan Al Saiem uses advanced techniques that ensure natural results without an overly \"pulled\" appearance.\n\nThe free consultation determines a customized treatment plan for each patient's condition.",
    duration: "3-5 ساعات",
    recovery: "2-3 أسابيع",
    category: "face",
  },
  "blepharoplasty": {
    titleAr: "شد الأجفان العلوية والسفلية",
    titleEn: "Upper & Lower Eyelid Lift",
    descriptionAr: "تجديد مظهر العينين من خلال شد الجفون العلوية والسفلية لإزالة التجاعيد وإطلالة أكثر شباباً",
    descriptionEn: "Rejuvenating the eyes by lifting upper and lower eyelids to remove wrinkles and restore a youthful appearance",
    longDescriptionAr: "شد الأجفان (Blepharoplasty) هو إجراء دقيق يهدف إلى تجديد مظهر منطقة العينين. يعالج الترهلات والتجاعيد في الجفون العلوية والسفلية.\n\nهذا الإجراء يمكن أن يحسن الرؤية في بعض الحالات التي يعيق فيها ترهل الجفن العلوي الرؤية.\n\nيتم تحت التخدير الموضعي أو العام ويستغرق 1-2 ساعة.",
    longDescriptionEn: "Blepharoplasty is a precise procedure aimed at rejuvenating the eye area. It addresses sagging and wrinkles in the upper and lower eyelids.\n\nThis procedure can also improve vision in cases where upper eyelid sagging obstructs sight.\n\nPerformed under local or general anesthesia, taking 1-2 hours.",
    duration: "1-2 ساعات",
    recovery: "1-2 أسبوع",
    category: "face",
  },
  "liposuction-fat-transfer": {
    titleAr: "شفط الشحم وحقن الشحم",
    titleEn: "Liposuction & Fat Transfer",
    descriptionAr: "تشكيل الجسم وإزالة الدهون العنيدة مع إعادة حقن الشحم في المناطق المطلوبة",
    descriptionEn: "Body contouring and removal of stubborn fat with fat reinjection in desired areas",
    longDescriptionAr: "شفط الشحم وحقنه هو إجراء مزدوج يخلصك من الدهون العنيدة في منطقة ويحولها إلى حجم مثالي في منطقة أخرى.\n\nيمكن حقن الشحم في الوجه، اليدين، الصدر، أو أي منطقة تحتاج إلى تكبير طبيعي.\n\nالنتيجة نهائية ودائمة مع الحفاظ على نمط حياة صحي.",
    longDescriptionEn: "Liposuction & Fat Transfer is a dual procedure that removes stubborn fat from one area and transfers it to add volume elsewhere.\n\nFat can be injected into the face, hands, chest, or any area needing natural enhancement.\n\nResults are permanent with a healthy lifestyle.",
    duration: "2-4 ساعات",
    recovery: "2-3 أسابيع",
    category: "body",
  },
  "tummy-tuck": {
    titleAr: "شد البطن",
    titleEn: "Tummy Tuck",
    descriptionAr: "شد وتجميل البطن للحصول على مظهر أنحف وأكثر تنسقاً",
    descriptionEn: "Abdominoplasty for a flatter, more toned and contoured abdomen",
    longDescriptionAr: "شد البطن (Tummy Tuck) هو إجراء جراحي يهدف إلى إزالة الجلد الزائد والدهون من منطقة البطن وشد العضلات.\n\nمناسب للنساء بعد الحمل أو لمن فقد وزناً بشكل كبير.\n\nالنتيجة نهائية مع ندبة خفيفة تختفي مع الوقت.",
    longDescriptionEn: "Tummy Tuck (Abdominoplasty) is a surgical procedure aimed at removing excess skin and fat from the abdomen area while tightening the muscles.\n\nSuitable for women after pregnancy or those who have lost significant weight.\n\nResults are permanent with a scar that fades over time.",
    duration: "2-4 ساعات",
    recovery: "3-4 أسابيع",
    category: "body",
  },
  "botox": {
    titleAr: "حقن البوتوكس",
    titleEn: "Botox Injections",
    descriptionAr: "تجميل تجاعيد الوجه وإطلالة شبابية طبيعية من خلال حقن البوتوكس المتقدم",
    descriptionEn: "Smoothing facial wrinkles and achieving a natural youthful look with advanced Botox",
    longDescriptionAr: "حقن البوتوكس هو أكثر الإجراءات التجميلية شيوعاً في العالم. يُستخدم لعلاج التجاعيد الدقيقة والاعتيادية.\n\nالنتيجة تظهر خلال 3-7 أيام وتدوم 3-6 أشهر.\n\nإجراء غير جراحي بأقل وقت نقاهة.",
    longDescriptionEn: "Botox injections are the most popular cosmetic procedure worldwide. Used to treat fine lines and moderate to severe wrinkles.\n\nResults appear within 3-7 days and last 3-6 months.\n\nNon-surgical procedure with minimal downtime.",
    duration: "15-30 دقيقة",
    recovery: "بدون نقاهة",
    category: "face",
  },
  "fillers": {
    titleAr: "الفيلر",
    titleEn: "Fillers",
    descriptionAr: "حشو وترطيب البشرة وتحسين ملامح الوجه بشكل طبيعي",
    descriptionEn: "Volume restoration, skin hydration, and natural facial feature enhancement",
    longDescriptionAr: "الفيلر (Hyaluronic Acid Fillers) هو حمض الهيالورونيك الطبيعي الذي يُحقن لترطيب البشرة وملء التجاعيد.\n\nيمكن استخدامه لتكبير الشفاه، تحسين خطوط الوجه، وملء الهالات السوداء.\n\nالنتيجة فورية وتستمر 6-12 شهر.",
    longDescriptionEn: "Dermal Fillers (Hyaluronic Acid) is a natural substance injected to hydrate the skin and fill wrinkles.\n\nCan be used for lip enhancement, facial contouring, and under-eye filler.\n\nResults are immediate and last 6-12 months.",
    duration: "30-60 دقيقة",
    recovery: "بدون نقاهة",
    category: "face",
  },
  "arm-thigh-lift": {
    titleAr: "شد العضدين والفخذين",
    titleEn: "Arm & Thigh Lift",
    descriptionAr: "شد وتجميل الذراعين والفخذين للحصول على مظهر متناسق ومشدود",
    descriptionEn: "Lifting and contouring the arms and thighs for a slimmer, more toned appearance",
    longDescriptionAr: "شد العضدين والفخذين هو إجراء يهدف إلى إزالة الجلد الزائد والدهون من الذراعين أو الفخذين.\n\nمناسب لمن فقد وزناً بشكل كبير ويعاني من ترهل الجلد.\n\nالنتيجة نهائية مع ندبة خفيفة.",
    longDescriptionEn: "Arm & Thigh Lift is a procedure aimed at removing excess skin and fat from the arms or thighs.\n\nSuitable for those who have lost significant weight and suffer from skin sagging.\n\nResults are permanent with minimal scarring.",
    duration: "2-4 ساعات",
    recovery: "3-4 أسابيع",
    category: "body",
  },
  "breast-augmentation-reduction": {
    titleAr: "تكبير وتصغير الثدي",
    titleEn: "Breast Augmentation / Reduction",
    descriptionAr: "تحسين شكل وحجم الصدر لتحقيق مظهر طبيعي ومتناسق",
    descriptionEn: "Enhancing the shape and size of the breasts for a natural, proportional look",
    longDescriptionAr: "تكبير أو تصغير الثدي هو إجراء يهدف إلى تحقيق الحجم والشكل المثالي للصدر.\n\nيتوفر خياران: الزرعات ( Silicone implants ) أو نقل الدهون الذاتية.\n\nالاستشارة تحدد الخيار الأنسب لكل حالة.",
    longDescriptionEn: "Breast Augmentation or Reduction is a procedure aimed at achieving the ideal size and shape for the chest.\n\nOptions include implants or autologous fat transfer.\n\nConsultation determines the best option for each case.",
    duration: "1-3 ساعات",
    recovery: "2-3 أسابيع",
    category: "body",
  },
  "scar-deformity-correction": {
    titleAr: "إصلاح الندب والتشوهات",
    titleEn: "Scar & Deformity Correction",
    descriptionAr: "إزالة وتحسين مظهر الندب والتشوهات بأحدث التقنيات الطبية",
    descriptionEn: "Improving and minimizing the appearance of scars and deformities with the latest techniques",
    longDescriptionAr: "إصلاح الندب والتشوهات هو إجراء متعدد التقنيات يهدف إلى تحسين مظهر الندب الناتج عن الجروح أو الحروق أو الجراحات السابقة.\n\nتتوفر تقنيات متعددة تشمل الحقن، الليزر، والجراحة التصحيحية.\n\nالنتيجة تعتمد على نوع الندبة وعمقها.",
    longDescriptionEn: "Scar & Deformity Correction is a multi-technique procedure aimed at improving the appearance of scars from wounds, burns, or previous surgeries.\n\nMultiple techniques are available including injections, laser, and corrective surgery.\n\nResults depend on the scar type and depth.",
    duration: "30 دقيقة - 3 ساعات",
    recovery: "1-4 أسابيع",
    category: "revision",
  },
};

export default function ProcedureDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";

  const convexProcedure = useQuery(
    api.procedures.getBySlug,
    slug ? { slug } : "skip"
  );

  // Use Convex data if available, otherwise fall back to translations
  const fallback = slug ? procedureData[slug] : undefined;
  const procedure = convexProcedure !== undefined
    ? (convexProcedure ?? (fallback ? null : undefined))
    : undefined;

  // Determine which data to display
  const displayData = convexProcedure || (fallback ? {
    titleAr: fallback.titleAr,
    titleEn: fallback.titleEn,
    descriptionAr: fallback.descriptionAr,
    descriptionEn: fallback.descriptionEn,
    longDescriptionAr: fallback.longDescriptionAr,
    longDescriptionEn: fallback.longDescriptionEn,
    duration: fallback.duration,
    recovery: fallback.recovery,
  } : null);

  if (convexProcedure === undefined && !fallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground" dir={dir}>
        <GlassNavbar />
        <h1 className="text-2xl font-bold mb-4">
          {isRtl ? "الإجراء غير موجود" : "Procedure not found"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isRtl
            ? "الإجراء الذي تبحث عنه غير متاح حالياً."
            : "The procedure you're looking for is not available."}
        </p>
        <Link to="/">
          <Button variant="outline">
            {isRtl ? "العودة للرئيسية" : "Back to Home"}
          </Button>
        </Link>
      </div>
    );
  }

  const title = isRtl ? displayData.titleAr : displayData.titleEn;
  const description = isRtl ? displayData.descriptionAr : displayData.descriptionEn;
  const longDescription = isRtl
    ? displayData.longDescriptionAr
    : displayData.longDescriptionEn;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <GlassNavbar />

      {/* Hero Banner */}
      <section className="pt-24 pb-16 hero-gradient">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {isRtl ? (
                <>
                  العودة للرئيسية
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </>
              )}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm font-medium text-primary mb-6">
              <BadgeCheck className="h-4 w-4" />
              {isRtl ? "إجراء طبي متخصص" : "Specialized Procedure"}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-bold text-foreground mb-4">
              {title}
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl">
              {description}
            </p>
          </motion.div>

          {/* Quick Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10"
          >
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "مدة الإجراء" : "Duration"}
                </p>
                <p className="font-semibold text-foreground">
                  {displayData.duration}
                </p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "فترة التعافي" : "Recovery"}
                </p>
                <p className="font-semibold text-foreground">
                  {displayData.recovery}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full Description */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-elevated rounded-3xl p-8 sm:p-12"
          >
            <h2 className="text-2xl font-serif-luxury font-bold text-foreground mb-6">
              {isRtl ? "تفاصيل الإجراء" : "Procedure Details"}
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
              {longDescription.split("\n").map((paragraph, i) => (
                <p key={i} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-elevated rounded-3xl p-8 sm:p-12 text-center glow-champagne"
          >
            <h3 className="text-xl sm:text-2xl font-serif-luxury font-bold text-foreground mb-4">
              {isRtl
                ? "هل تفكر في هذا الإجراء؟"
                : "Thinking about this procedure?"}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {isRtl
                ? "احجز استشارتك المجانية مع د. الحسن الصايم لتعرف إذا كان هذا الإجراء مناسب لك."
                : "Book your free consultation with Dr. Al Hasan Al Saiem to find out if this procedure is right for you."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/consultation?procedure=${slug}`}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base gap-2">
                  <Calendar className="h-4 w-4" />
                  {isRtl ? "احجز استشارتك المجانية" : "Book Free Consultation"}
                </Button>
              </Link>
              <a href="tel:+966500000000">
                <Button
                  variant="outline"
                  className="rounded-full px-8 py-6 text-base gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {isRtl ? "اتصل بنا" : "Call Us"}
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
