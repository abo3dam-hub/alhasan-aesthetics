import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingProcedures = await ctx.db.query("procedures").first();
    if (existingProcedures) {
      return "Data already seeded";
    }

    // ─── Seed Doctor Settings ───
    const doctorSettings = {
      doctorNameAr: "د. الحسن الصايم",
      doctorNameEn: "Dr. Al Hasan Al Saiem",
      whatsappNumber: "+966500000000",
      phone: "+966 XX XXX XXXX",
      email: "info@dr-alhasan.com",
      addressAr: "سوريا، دمشق، اللاذقية\nالإمارات العربية المتحدة، دبي",
      addressEn: "Syria, Damascus, Lattakia\nUnited Arab Emirates, Dubai",
      socialMedia: {
        instagram: "",
        facebook: "",
        twitter: "",
        snapchat: "",
      },
    };
    await ctx.db.insert("siteSettings", {
      key: "doctor",
      value: doctorSettings,
    });

    // ─── Seed Procedures ───
    const procedures = [
      {
        slug: "blepharoplasty",
        titleAr: "شد الأجفان العلوية والسفلية",
        titleEn: "Upper & Lower Eyelid Lift",
        descriptionAr: "تجديد مظهر العينين من خلال شد الجفون العلوية والسفلية لإزالة التجاعيد وإطلالة أكثر شباباً",
        descriptionEn: "Rejuvenating the eyes by lifting upper and lower eyelids to remove wrinkles and restore a youthful appearance",
        longDescriptionAr: "شد الأجفان (Blepharoplasty) هو إجراء دقيق يهدف إلى تجديد مظهر منطقة العينين. يعالج الترهلات والتجاعيد في الجفون العلوية والسفلية.\n\nهذا الإجراء يمكن أن يحسن الرؤية في بعض الحالات التي يعيق فيها ترهل الجفن العلوي الرؤية.\n\nيتم تحت التخدير الموضعي أو العام ويستغرق 1-2 ساعة.",
        longDescriptionEn: "Blepharoplasty is a precise procedure aimed at rejuvenating the eye area. It addresses sagging and wrinkles in the upper and lower eyelids.\n\nThis procedure can also improve vision in cases where upper eyelid sagging obstructs sight.\n\nPerformed under local or general anesthesia, taking 1-2 hours.",
        icon: "Eye",
        category: "face",
        duration: "1-2 ساعات / 1-2 hours",
        recovery: "1-2 أسبوع / 1-2 weeks",
        isActive: true,
        order: 1,
      },
      {
        slug: "face-neck-lift",
        titleAr: "شد الوجه والرقبة",
        titleEn: "Face & Neck Lift",
        descriptionAr: "إعادة الشباب والحيوية للوجه والرقبة بأحدث تقنيات الشد المتقدمة",
        descriptionEn: "Restoring youth and vitality to the face and neck with the latest advanced lifting techniques",
        longDescriptionAr: "شد الوجه والرقبة هو إجراء تجميلي متقدم يهدف إلى استعادة مظهر أكثر شباباً وحيوية للوجه والرقبة. يعالج التجاعيد والترهلات وفقدان التوتة الطبيعية.\n\nيستخدم د. الحسن الصايم تقنيات متقدمة تضمن نتائج طبيعية دون مظهر \"مشدود\" بشكل مفرط.",
        longDescriptionEn: "Face & Neck Lift is an advanced cosmetic procedure aimed at restoring a more youthful and vibrant appearance to the face and neck.\n\nDr. Al Hasan Al Saiem uses advanced techniques that ensure natural results without an overly pulled appearance.",
        icon: "UserRound",
        category: "face",
        duration: "3-5 ساعات / 3-5 hours",
        recovery: "2-3 أسابيع / 2-3 weeks",
        isActive: true,
        order: 2,
      },
      {
        slug: "rhinoplasty",
        titleAr: "تجميل الأنف",
        titleEn: "Rhinoplasty",
        descriptionAr: "تصميم وتشكيل الأنف لتحقيق تناغم مثالي مع ملامح الوجه",
        descriptionEn: "Sculpting and reshaping the nose to achieve ideal harmony with facial features",
        longDescriptionAr: "تجميل الأنف (Rhinoplasty) هو إجراء جراحي متقدم يهدف إلى تحسين شكل الأنف وتناسبه مع ملامح الوجه.\n\nيتم الإجراء عادة تحت التخدير العام ويستغرق من 1 إلى 3 ساعات. فترة التعافي تتطلب أسبوعين من الراحة.",
        longDescriptionEn: "Rhinoplasty is an advanced surgical procedure aimed at improving the shape of the nose and its proportion with facial features.\n\nThe procedure is typically performed under general anesthesia and takes 1-3 hours.",
        icon: "SmilePlus",
        category: "face",
        duration: "1-3 ساعات / 1-3 hours",
        recovery: "2-3 أسابيع / 2-3 weeks",
        isActive: true,
        order: 3,
      },
      {
        slug: "liposuction-fat-transfer",
        titleAr: "شفط الشحم وحقن الشحم",
        titleEn: "Liposuction & Fat Transfer",
        descriptionAr: "تشكيل الجسم وإزالة الدهون العنيدة مع إعادة حقن الشحم في المناطق المطلوبة",
        descriptionEn: "Body contouring and removal of stubborn fat with fat reinjection in desired areas",
        longDescriptionAr: "شفط الشحم وحقنه هو إجراء مزدوج يخلصك من الدهون العنيدة ويحولها إلى حجم مثالي في منطقة أخرى.\n\nالنتيجة نهائية ودائمة مع الحفاظ على نمط حياة صحي.",
        longDescriptionEn: "Liposuction & Fat Transfer is a dual procedure that removes stubborn fat and transfers it to add volume elsewhere.\n\nResults are permanent with a healthy lifestyle.",
        icon: "Droplets",
        category: "body",
        duration: "2-4 ساعات / 2-4 hours",
        recovery: "2-3 أسابيع / 2-3 weeks",
        isActive: true,
        order: 4,
      },
      {
        slug: "tummy-tuck",
        titleAr: "شد البطن",
        titleEn: "Tummy Tuck",
        descriptionAr: "شد وتجميل البطن للحصول على مظهر أنحف وأكثر تنسقاً",
        descriptionEn: "Abdominoplasty for a flatter, more toned and contoured abdomen",
        longDescriptionAr: "شد البطن (Tummy Tuck) هو إجراء جراحي يهدف إلى إزالة الجلد الزائد والدهون من منطقة البطن وشد العضلات.\n\nمناسب للنساء بعد الحمل أو لمن فقد وزناً بشكل كبير.",
        longDescriptionEn: "Tummy Tuck is a surgical procedure aimed at removing excess skin and fat from the abdomen while tightening the muscles.\n\nSuitable for women after pregnancy or those who have lost significant weight.",
        icon: "Scissors",
        category: "body",
        duration: "2-4 ساعات / 2-4 hours",
        recovery: "3-4 أسابيع / 3-4 weeks",
        isActive: true,
        order: 5,
      },
      {
        slug: "botox",
        titleAr: "حقن البوتوكس",
        titleEn: "Botox Injections",
        descriptionAr: "تجميل تجاعيد الوجه وإطلالة شبابية طبيعية من خلال حقن البوتوكس المتقدم",
        descriptionEn: "Smoothing facial wrinkles and achieving a natural youthful look with advanced Botox",
        longDescriptionAr: "حقن البوتوكس هو أكثر الإجراءات التجميلية شيوعاً في العالم. يُستخدم لعلاج التجاعيد الدقيقة والاعتيادية.\n\nالنتيجة تظهر خلال 3-7 أيام وتدوم 3-6 أشهر.\n\nإجراء غير جراحي بأقل وقت نقاهة.",
        longDescriptionEn: "Botox injections are the most popular cosmetic procedure worldwide. Used to treat fine lines and moderate to severe wrinkles.\n\nResults appear within 3-7 days and last 3-6 months.\n\nNon-surgical procedure with minimal downtime.",
        icon: "Sparkles",
        category: "face",
        duration: "15-30 دقيقة / 15-30 minutes",
        recovery: "بدون نقاهة / No downtime",
        isActive: true,
        order: 6,
      },
      {
        slug: "fillers",
        titleAr: "الفيلر",
        titleEn: "Fillers",
        descriptionAr: "حشو وترطيب البشرة وتحسين ملامح الوجه بشكل طبيعي",
        descriptionEn: "Volume restoration, skin hydration, and natural facial feature enhancement",
        longDescriptionAr: "الفيلر (Hyaluronic Acid Fillers) هو حمض الهيالورونيك الطبيعي الذي يُحقن لترطيب البشرة وملء التجاعيد.\n\nالنتيجة فورية وتستمر 6-12 شهر.",
        longDescriptionEn: "Dermal Fillers is a natural substance injected to hydrate the skin and fill wrinkles.\n\nResults are immediate and last 6-12 months.",
        icon: "Heart",
        category: "face",
        duration: "30-60 دقيقة / 30-60 minutes",
        recovery: "بدون نقاهة / No downtime",
        isActive: true,
        order: 7,
      },
      {
        slug: "arm-thigh-lift",
        titleAr: "شد العضدين والفخذين",
        titleEn: "Arm & Thigh Lift",
        descriptionAr: "شد وتجميل الذراعين والفخذين للحصول على مظهر متناسق ومشدود",
        descriptionEn: "Lifting and contouring the arms and thighs for a slimmer, more toned appearance",
        longDescriptionAr: "شد العضدين والفخذين هو إجراء يهدف إلى إزالة الجلد الزائد والدهون من الذراعين أو الفخذين.\n\nمناسب لمن فقد وزناً بشكل كبير ويعاني من ترهل الجلد.",
        longDescriptionEn: "Arm & Thigh Lift is a procedure aimed at removing excess skin and fat from the arms or thighs.\n\nSuitable for those who have lost significant weight.",
        icon: "ArrowUpDown",
        category: "body",
        duration: "2-4 ساعات / 2-4 hours",
        recovery: "3-4 أسابيع / 3-4 weeks",
        isActive: true,
        order: 8,
      },
      {
        slug: "breast-augmentation-reduction",
        titleAr: "تكبير وتصغير الثدي",
        titleEn: "Breast Augmentation / Reduction",
        descriptionAr: "تحسين شكل وحجم الصدر لتحقيق مظهر طبيعي ومتناسق",
        descriptionEn: "Enhancing the shape and size of the breasts for a natural, proportional look",
        longDescriptionAr: "تكبير أو تصغير الثدي هو إجراء يهدف إلى تحقيق الحجم والشكل المثالي للصدر.\n\nيتوفر خياران: الزرعات أو نقل الدهون الذاتية.",
        longDescriptionEn: "Breast Augmentation or Reduction is a procedure aimed at achieving the ideal size and shape for the chest.\n\nOptions include implants or autologous fat transfer.",
        icon: "Stethoscope",
        category: "body",
        duration: "1-3 ساعات / 1-3 hours",
        recovery: "2-3 أسابيع / 2-3 weeks",
        isActive: true,
        order: 9,
      },
      {
        slug: "scar-deformity-correction",
        titleAr: "إصلاح الندب والتشوهات",
        titleEn: "Scar & Deformity Correction",
        descriptionAr: "إزالة وتحسين مظهر الندب والتشوهات بأحدث التقنيات الطبية",
        descriptionEn: "Improving and minimizing the appearance of scars and deformities with the latest techniques",
        longDescriptionAr: "إصلاح الندب والتشوهات هو إجراء متعدد التقنيات يهدف إلى تحسين مظهر الندب.\n\nتتوفر تقنيات متعددة تشمل الحقن، الليزر، والجراحة التصحيحية.",
        longDescriptionEn: "Scar & Deformity Correction is a multi-technique procedure aimed at improving the appearance of scars.\n\nMultiple techniques available including injections, laser, and corrective surgery.",
        icon: "Ban",
        category: "revision",
        duration: "30 دقيقة - 3 ساعات / 30min - 3 hours",
        recovery: "1-4 أسابيع / 1-4 weeks",
        isActive: true,
        order: 10,
      },
    ];

    for (const proc of procedures) {
      await ctx.db.insert("procedures", proc);
    }

    // ─── Seed Testimonials ───
    const testimonials = [
      {
        nameAr: "سارة أ.",
        nameEn: "Sarah A.",
        textAr: "تجربتي مع د. الحسن الصايم كانت استثنائية. النتائج فاقت توقعاتي بكثير والرعاية كانت رائعة. أنصح به بشدة لأي شخص يفكر في إجراء تجميلي.",
        textEn: "My experience with Dr. Al Hasan Al Saiem was exceptional. The results exceeded my expectations by far, and the care from the entire team was outstanding. I highly recommend him.",
        rating: 5,
        isActive: true,
        order: 1,
      },
      {
        nameAr: "محمد ر.",
        nameEn: "Mohammed R.",
        textAr: "بعد سنوات من التفكير، قررت أخيراً إجراء تجميل الأنف. د. الحسن الصايم جعل التجربة سهلة ومريحة والنتائج طبيعية تماماً.",
        textEn: "After years of consideration, I finally decided on a rhinoplasty procedure. Dr. Al Hasan Al Saiem made the entire experience comfortable and easy, and the results look completely natural.",
        rating: 5,
        isActive: true,
        order: 2,
      },
      {
        nameAr: "ليلى ك.",
        nameEn: "Layla K.",
        textAr: "الاحترافية والعناية بالتفاصيل عند د. الحسن الصايم لا مثيل لها. أشعر بالشباب مرة أخرى والثقة بملامحي عادت بالكامل.",
        textEn: "The professionalism and attention to detail at Dr. Al Hasan Al Saiem's practice is unmatched. I feel youthful again and my confidence has been fully restored.",
        rating: 5,
        isActive: true,
        order: 3,
      },
    ];

    for (const t of testimonials) {
      await ctx.db.insert("testimonials", t);
    }

    // ─── Seed FAQ ───
    const faqs = [
      {
        questionAr: "كيف أعرف الإجراء المناسب لي؟",
        questionEn: "How do I know which procedure is right for me?",
        answerAr: "نقدم استشارة مجانية شاملة حيث يقيّم د. الحسن الصايم احتياجاتك ويشرح جميع الخيارات المتاحة. كل خطة علاج مخصصة لكل مريض.",
        answerEn: "We offer a comprehensive free consultation where Dr. Al Hasan Al Saiem evaluates your needs and explains all available options. Every treatment plan is personalized.",
        isActive: true,
        order: 1,
      },
      {
        questionAr: "كم تستمر فترة التعافي؟",
        questionEn: "How long is the recovery period?",
        answerAr: "تختلف مدة التعافي حسب الإجراء. بشكل عام، معظم المرضى يعودون لأنشطتهم الطبيعية خلال ١-٢ أسبوعاً.",
        answerEn: "Recovery duration varies by procedure. Generally, most patients return to normal activities within 1-2 weeks.",
        isActive: true,
        order: 2,
      },
      {
        questionAr: "هل النتائج طبيعية؟",
        questionEn: "Are the results natural-looking?",
        answerAr: "نعم، نحن متخصصون في تحقيق نتائج طبيعية تبرز ملامحك دون تغيير مظهرك. هدفنا هو إبراز أفضل نسخة منك.",
        answerEn: "Absolutely. We specialize in achieving natural results that enhance your features without altering your appearance.",
        isActive: true,
        order: 3,
      },
      {
        questionAr: "هل الجراحة آمنة؟",
        questionEn: "Is the surgery safe?",
        answerAr: "السلامة أولويتنا القصوى. نستخدم أحدث المعدات والتقنيات المعتمدة دولياً. د. الحسن الصايم حاصل على شهادات من أعرق الجمعيات الطبية العالمية.",
        answerEn: "Safety is our top priority. We use the latest internationally certified equipment and techniques. Dr. Al Hasan Al Saiem holds certifications from prestigious medical societies.",
        isActive: true,
        order: 4,
      },
      {
        questionAr: "ما هي طرق الدفع المتاحة؟",
        questionEn: "What payment options are available?",
        answerAr: "نقبل وسائل الدفع المتعددة ونقدم خطط دفع مرنة. يمكن مناقشة جميع التفاصيل المالية خلال الاستشارة الأولى.",
        answerEn: "We accept various payment methods and offer flexible payment plans. All financial details can be discussed during your initial consultation.",
        isActive: true,
        order: 5,
      },
      {
        questionAr: "هل يمكنني رؤية نتائج مشابهة لحالتي؟",
        questionEn: "Can I see results similar to my case?",
        answerAr: "بالتأكيد! لدينا معرض شامل من صور قبل وبعد لمجموعة متنوعة من الإجراءات.",
        answerEn: "Absolutely! We have a comprehensive gallery of before-and-after photos for a wide range of procedures.",
        isActive: true,
        order: 6,
      },
    ];

    for (const f of faqs) {
      await ctx.db.insert("faq", f);
    }

    return "Seeded successfully: 10 procedures, 3 testimonials, 6 FAQ items, doctor settings";
  },
});
