/**
 * SEO defaults for every active procedure — single source of truth used by
 * the `migrateProcedureSeo` migration. Titles/descriptions are geo-targeted
 * to the cities where Dr. Al Hasan Al Saiem practices: Damascus, Latakia and
 * Tartus (Syria), Dubai (UAE), Beirut (Lebanon) and Iraq.
 *
 * English target: title ≤ ~63 chars, description ≤ ~160 chars.
 * Arabic target: title ≤ ~55 chars, description ≤ ~160 chars.
 */
export type ProcedureSeoDefaults = {
  seoTitleEn: string;
  seoDescriptionEn: string;
  seoTitleAr: string;
  seoDescriptionAr: string;
};

export const PROCEDURE_SEO: Record<string, ProcedureSeoDefaults> = {
  rhinoplasty: {
    seoTitleEn: "Rhinoplasty in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Sculpt and reshape the nose for ideal facial harmony. Rhinoplasty with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "تجميل الأنف في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "تصميم وإعادة تشكيل الأنف لتناغم مثالي مع ملامح الوجه. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "face-neck-lift": {
    seoTitleEn: "Face & Neck Lift in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Restore a youthful, vital face and neck with advanced lifting. Face & neck lift with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "شد الوجه والرقبة في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "إعادة الشباب والحيوية للوجه والرقبة بأحدث تقنيات الشد. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "liposuction-fat-transfer": {
    seoTitleEn: "Liposuction in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Remove stubborn fat and shape the body with fat reinjection. Liposuction with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "شفط الشحم وحقنه في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "تشكيل الجسم وإزالة الدهون العنيدة مع إعادة حقن الشحم في المناطق المطلوبة. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "tummy-tuck": {
    seoTitleEn: "Tummy Tuck in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Flatten and contour the abdomen for a toned silhouette. Tummy tuck with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "شد البطن في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "شد وتجميل البطن للحصول على مظهر أنحف وأكثر تناسقاً. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "upper-eyelid-lift": {
    seoTitleEn: "Upper Eyelid Lift in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Lift drooping upper eyelids for a fresher, more youthful gaze. Eyelid lift with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "شد الجفن العلوي في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "إزالة الترهلات والجلد الزائد من الجفن العلوي لإطلالة أكثر شباباً ونقاءً. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "lower-eyelid-lift": {
    seoTitleEn: "Lower Eyelid Lift in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Treat under-eye bags, hollows and sagging for a brighter gaze. Lower eyelid lift with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "شد الجفن السفلي في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "معالجة الانتفاخات والهالات والترهلات تحت العينين لنظرة أكثر شباباً وإشراقاً. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "arm-lift": {
    seoTitleEn: "Arm Lift in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Remove excess skin and tone your upper arms. Arm lift with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "شد العضدين في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "إزالة الجلد المترهل من العضدين للحصول على ذراعين مشدودين ومتناسقين. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "thigh-lift": {
    seoTitleEn: "Thigh Lift in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Lift and contour the thighs by removing excess skin and fat. Thigh lift with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "شد الفخذين في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "شد الفخذين وإزالة الجلد المترهل والدهون الزائدة لمظهر أنعم وأكثر تناسقاً. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "breast-augmentation": {
    seoTitleEn: "Breast Augmentation in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Enhance breast size and shape with implants or fat transfer. Available with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book a consultation.",
    seoTitleAr: "تكبير الثدي في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "تعزيز حجم الثدي وتحسين شكله وتناسقه باستخدام الزرعات أو حقن الشحم الذاتي. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "breast-lift-with-implants": {
    seoTitleEn: "Breast Lift with Implants in Damascus & Dubai | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Restore lift, fullness and volume together. Breast lift with implants by Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "شد الثدي مع البروتيز في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "شد ورفع الثدي مع زرع البروتيز لاستعادة الامتلاء والحجم معاً. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "breast-lift": {
    seoTitleEn: "Breast Lift in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Reshape and lift sagging breasts while keeping your size. Breast lift with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "شد الثدي في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "شد ورفع الثدي المترهل وإعادة حجمه وموضعه الطبيعي دون تغيير المقاس. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "breast-reduction-and-lift": {
    seoTitleEn: "Breast Reduction & Lift in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Reduce and lift large breasts for a proportionate, comfortable shape. Available with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book a consultation.",
    seoTitleAr: "تصغير وشد الثدي في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "تصغير حجم الثدي وإعادة رفعه وشده ليظهر متناسقاً ومريحاً مع بنية الجسم. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "botox-injections": {
    seoTitleEn: "Botox Injections in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Smooth facial wrinkles for a natural, youthful look. Botox with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "حقن البوتوكس في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "تجميل تجاعيد الوجه وإطلالة شبابية طبيعية من خلال حقن البوتوكس. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  fillers: {
    seoTitleEn: "Facial Fillers in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Restore volume, hydrate the skin and enhance facial features naturally. Fillers with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "حقن الفيلر في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "حشو وترطيب البشرة وتحسين ملامح الوجه بشكل طبيعي. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "scar-deformity-correction": {
    seoTitleEn: "Scar Correction in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Improve and minimise the appearance of scars and deformities. Scar correction with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "إصلاح الندب والتشوهات في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "إزالة وتحسين مظهر الندب والتشوهات بأحدث التقنيات الطبية. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
  "prominent-ear-correction": {
    seoTitleEn: "Ear Correction in Damascus, Dubai & Beirut | Dr. Al Hasan Al Saiem",
    seoDescriptionEn:
      "Reshape prominent ears to harmonise with your facial features. Ear correction with Dr. Al Hasan Al Saiem in Damascus, Dubai, Beirut & Iraq — book your consultation.",
    seoTitleAr: "تصحيح تبارز الأذنين في دمشق ودبي وبيروت والعراق | د. الحسن الصايم",
    seoDescriptionAr:
      "تصحيح تبارز الأذنين وإعادة تشكيلهما ليتناسقا مع ملامح الوجه. متوفر لدى د. الحسن الصايم في دمشق واللاذقية وطرطوس ودبي وبيروت والعراق — احجز استشارتك.",
  },
};

export function getProcedureSeo(slug: string): ProcedureSeoDefaults | undefined {
  return PROCEDURE_SEO[slug];
}