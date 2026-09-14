import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./admin";
import { resolveIconKey } from "./procedureIconDefaults";

/**
 * ─── Procedure Structure Migration ─────────────────────────────────────────
 *
 * During site restructure, three combined procedures were split into
 * independent ones, the breast procedures gained a hierarchical group with
 * sub-options, and a new (Prominent Ear) procedure was added.
 *
 * This module owns the single source of truth for the *new* procedure set so
 * that seed.ts and the on-demand migration button stay in sync.
 */

export type NewProcedureSeed = {
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  longDescriptionAr: string;
  longDescriptionEn: string;
  icon: string;
  category: string;
  duration: string;
  recovery: string;
  isActive: boolean;
  isFeatured?: boolean;
  order: number;
  parentSlug?: string;
  supersededBy?: string[];
};

export const NEW_PROCEDURES: NewProcedureSeed[] = [
  // ─── Face: Upper & Lower Eyelid Lift (split of upper-lower-eyelid-lift) ───
  {
    slug: "upper-eyelid-lift",
    titleAr: "شد الجفن العلوي",
    titleEn: "Upper Eyelid Lift",
    descriptionAr: "إزالة الترهلات والجلد الزائد في الجفن العلوي لإطلالة أكثر شباباً ونقاءً",
    descriptionEn: "Removing sagging and excess skin from the upper eyelid for a fresher, more youthful look",
    longDescriptionAr:
      "شد الجفن العلوي (Upper Blepharoplasty) هو إجراء دقيق يهدف إلى إزالة الترهلات والجلد الزائد والانتفاخات في الجفن العلوي التي تكسب الوجه مظهراً متعباً.\n\nيمكن لهذا الإجراء أن يحسّن الرؤية عند الأشخاص الذين يعاني جفنهم العلوي المترهل من إعاقة مجال الرؤية.\n\nيُجرى عادة تحت التخدير الموضعي مع تخدير خفيف، ويستغرق من ٤٥ دقيقة إلى ساعة ونصف، وتُخفى الشقوق في الثنية الطبيعية للجفن.\n\nتبدأ الاستشارة بتقييم دقيق لحالة الجفن وحاجة المريض، مع شرح شامل لخطوات الإجراء ومراحل التعافي.",
    longDescriptionEn:
      "Upper Eyelid Lift (Upper Blepharoplasty) is a precise procedure that removes sagging skin, excess tissue and puffiness from the upper eyelid, giving the face a less tired look.\n\nIt can also improve vision when drooping upper eyelid skin obstructs the visual field.\n\nIt is typically performed under local anaesthesia with light sedation and takes 45 minutes to 1.5 hours, with incisions hidden in the natural eyelid crease.\n\nThe journey begins with a detailed assessment of the eyelid and the patient's needs, followed by a full explanation of the procedure and recovery.",
    icon: "Eye",
    category: "face",
    duration: "45 دقيقة - 1.5 ساعة",
    recovery: "1-2 أسابيع",
    isActive: true,
    isFeatured: true,
    order: 11,
  },
  {
    slug: "lower-eyelid-lift",
    titleAr: "شد الجفن السفلي",
    titleEn: "Lower Eyelid Lift",
    descriptionAr: "معالجة الانتفاخات والهالات والترهلات تحت العينين لنظرة أكثر شباباً وإشراقاً",
    descriptionEn: "Treating under-eye bags, hollows and sagging for a brighter, more rested gaze",
    longDescriptionAr:
      "شد الجفن السفلي (Lower Blepharoplasty) هو إجراء دقيق يعالج الانتفاخات والهالات والترهلات تحت العينين.\n\nيتم التدخل عبر شق صغير إما من باطن الجفن (دون أثر ظاهر) أو في خط الرموش لإزالة الدهون الزائدة وإعادة شد الجلد.\n\nيستغرق الإجراء من ساعة إلى ساعتين ويتم غالباً تحت التخدير الموضعي مع تخدير خفيف حسب الحالة.\n\nتبدأ الاستشارة بتقييم دقيق لمنطقة العينين مع شرح شامل للخيارات الأنسب والنتائج المتوقعة.",
    longDescriptionEn:
      "Lower Eyelid Lift (Lower Blepharoplasty) is a precise procedure that addresses under-eye bags, hollows and sagging.\n\nIt is performed through a small incision either inside the eyelid (leaving no visible mark) or along the lash line to remove excess fat and tighten the skin.\n\nIt takes 1-2 hours, usually under local anaesthesia with light sedation.\n\nA detailed consultation assesses the eye area and explains the best options and expected results.",
    icon: "Eye",
    category: "face",
    duration: "1-2 ساعات",
    recovery: "1-2 أسابيع",
    isActive: true,
    isFeatured: true,
    order: 12,
  },

  // ─── Body: Arm & Thigh Lift (split of arm-thigh-lift) ───
  {
    slug: "arm-lift",
    titleAr: "شد العضدين",
    titleEn: "Arm Lift",
    descriptionAr: "شد وإزالة الجلد المترهل من العضدين للحصول على ذراعين مشدودين ومتناسقين",
    descriptionEn: "Lifting and removing excess skin from the upper arms for firmer, more toned arms",
    longDescriptionAr:
      "شد العضدين (Brachioplasty) هو إجراء جراحي يهدف إلى إزالة الجلد الزائد والدهون من منطقة العضد للحصول على ذراعين مشدودين ومتناسقين.\n\nيُناسب هذا الإجراء الأشخاص الذين فقدوا وزناً كبيراً أو يعانون من ترهل الجلد نتيجة التقدم في العمر.\n\nيتم تحت التخدير العام ويستغرق من ساعتين إلى ٣ ساعات، وتوضع الشقوق في الجهة الداخلية للذراع لتكون أقل ظهوراً.\n\nتبدأ الاستشارة بتقييم حالة الجلد وتوقعات المريض، مع شرح شامل لمراحل التعافي.",
    longDescriptionEn:
      "Arm Lift (Brachioplasty) is a surgical procedure that removes excess skin and fat from the upper arm area for firmer, more toned arms.\n\nIt is suitable for people who have lost a significant amount of weight or who have loose skin due to ageing.\n\nIt is performed under general anaesthesia and takes 2-3 hours, with incisions placed on the inner arm to remain as hidden as possible.\n\nThe consultation begins by assessing the skin condition and the patient's expectations, with a full explanation of the recovery.",
    icon: "ArrowUpDown",
    category: "body",
    duration: "2-3 ساعات",
    recovery: "2-3 أسابيع",
    isActive: true,
    isFeatured: false,
    order: 13,
  },
  {
    slug: "thigh-lift",
    titleAr: "شد الفخذين",
    titleEn: "Thigh Lift",
    descriptionAr: "شد وتنحيف الفخذين بإزالة الجلد المترهل والدهون الزائدة",
    descriptionEn: "Lifting and contouring the thighs by removing excess skin and stubborn fat",
    longDescriptionAr:
      "شد الفخذين (Thigh Lift) هو إجراء جراحي يهدف إلى إزالة الجلد المترهل والدهون الزائدة من منطقة الفخذين للحصول على مظهر أنعم وأكثر تناسقاً.\n\nيُناسب هذا الإجراء من فقدوا وزناً كبيراً أو يعانون من ترهل الجلد في هذه المنطقة.\n\nيتم تحت التخدير العام ويستغرق من ساعتين إلى ٤ ساعات حسب الحالة، وتُرسم الشقوق بعناية لتُخفى ضمن الخطوط الطبيعية للجسم.\n\nتبدأ الاستشارة بتقييم دقيق لحالة الجلد مع شرح شامل لمراحل التعافي والنتائج المتوقعة.",
    longDescriptionEn:
      "Thigh Lift is a surgical procedure that removes excess sagging skin and fat from the thighs for a smoother, more proportionate appearance.\n\nIt is suitable for those who have lost significant weight or who have skin laxity in this area.\n\nIt is performed under general anaesthesia and takes 2-4 hours depending on the case, with incisions carefully placed to blend with natural body lines.\n\nThe consultation begins with a careful skin assessment and a full explanation of recovery and expected outcomes.",
    icon: "ArrowUpDown",
    category: "body",
    duration: "2-4 ساعات",
    recovery: "3-4 أسابيع",
    isActive: true,
    isFeatured: false,
    order: 14,
  },

  // ─── Body: Breast Augmentation (split of breast-augmentation-reduction) ───
  {
    slug: "breast-augmentation",
    titleAr: "تكبير الثدي",
    titleEn: "Breast Augmentation",
    descriptionAr: "تعزيز حجم الثدي وتحسين شكله وتناسقه باستخدام الزرعات أو حقن الشحم الذاتي",
    descriptionEn: "Enhancing breast size and shape using implants or autologous fat transfer",
    longDescriptionAr:
      "تكبير الثدي هو إجراء جراحي يهدف إلى تعزيز حجم الثدي وتحسين امتلائه وتناسقه مع بنية الجسم.\n\nيتوفر خياران رئيسيان: الزرعات السيليكونية بمختلف الأحجام والأشكال، أو حقن الشحم الذاتي للحصول على نتائج طبيعية للغاية.\n\nيتم تحت التخدير العام ويستغرق من ساعة إلى ساعتين ونصف، ويُختار نوع وحجم الزرعة بعناية ليتناسب مع بنية جسم المريضة وتوقعاتها.\n\nتبدأ الاستشارة بنقاش مفصّل حول الخيارات المتاحة والنتائج الواقعية، مع شرح كامل لمراحل ما بعد الجراحة.",
    longDescriptionEn:
      "Breast Augmentation is a surgical procedure aimed at enhancing breast size and improving fullness and proportion with the body.\n\nTwo main options are available: silicone implants in various sizes and shapes, or autologous fat transfer for very natural results.\n\nIt is performed under general anaesthesia and takes 1-2.5 hours. The implant type and size are carefully chosen to suit the patient's body and expectations.\n\nThe consultation includes a detailed discussion of the available options and realistic outcomes, with a full explanation of post-operative care.",
    icon: "Stethoscope",
    category: "body",
    duration: "1-2.5 ساعات",
    recovery: "2-3 أسابيع",
    isActive: true,
    isFeatured: true,
    order: 15,
  },

  // ─── Body: Breast Reduction & Lift (parent group with sub-options) ───
  {
    slug: "breast-reduction-and-lift",
    titleAr: "تصغير وشد الثدي",
    titleEn: "Breast Reduction and Lift",
    descriptionAr: "تصغير حجم الثدي وإعادة رفعه وشده ليظهر بشكل متناسق ومريح يتناسب مع بنية الجسم",
    descriptionEn: "Reducing breast size and lifting the breast for a proportionate, comfortable and youthful shape",
    longDescriptionAr:
      "تصغير وشد الثدي هو إجراء متكامل يهدف إلى تصغير حجم الثدي المتضخم وإعادة رفعه وشده ليظهر بشكل متناسق ومريح مع بنية الجسم.\n\nيساعد هذا الإجراء في تخفيف آلام الظهر والرقبة والأكتاف المرافقة لكبر حجم الثدي، وتحسين الوضعية العامة، إضافة إلى المظهر الجمالي.\n\nيتم تحت التخدير العام ويستغرق من ساعتين إلى ٤ ساعات حسب الحالة. توضع الشقوق بعناية للحفاظ على المظهر الطبيعي للثدي.\n\nتُتاح ضمن هذا الإجراء خيارات علاجية متعددة تُستعرض من صفحة الإجراء، وتُحدد الخطة الأنسب خلال استشارة متخصصة مع د. الحسن الصايم.",
    longDescriptionEn:
      "Breast Reduction and Lift is a comprehensive procedure that reduces the size of enlarged breasts and lifts and tightens them to appear proportionate and comfortable with the body.\n\nIt helps relieve the back, neck and shoulder pain associated with heavy breasts, improve posture, and enhance appearance.\n\nIt is performed under general anaesthesia and takes 2-4 hours depending on the case. Incisions are carefully placed to preserve a natural breast appearance.\n\nMultiple treatment options within this procedure are presented on its page, and the most suitable plan is determined during a specialised consultation with Dr. Al Hasan Al Saiem.",
    icon: "Stethoscope",
    category: "body",
    duration: "2-4 ساعات",
    recovery: "3-4 أسابيع",
    isActive: true,
    isFeatured: true,
    order: 16,
  },
  {
    slug: "breast-lift",
    titleAr: "شد الثدي",
    titleEn: "Breast Lift",
    descriptionAr: "شد ورفع الثدي المترهل وإعادة حجمه وموضعه الطبيعي دون تغيير كبير في المقاس",
    descriptionEn: "Lifting and reshaping sagging breasts to restore a natural, youthful position without changing size",
    longDescriptionAr:
      "شد الثدي (Mastopexy) هو إجراء يهدف إلى رفع الثدي المترهل وإعادة شكله وموضعه الطبيعي، مع الحفاظ على حجمه الأصلي قدر الإمكان.\n\nيلجأ إليه عادة بعد الحمل والرضاعة أو بعد خسارة الوزن عندما يفقد الثدي توتّره الطبيعي.\n\nيتم تحت التخدير العام ويستغرق من ساعة ونصف إلى ٣ ساعات، وتُرسم الشقوق بعناية لتبقى مخفية قدر الإمكان.\n\nيتوفر هذا الخيار ضمن إجراء «تصغير وشد الثدي»، وتبدأ الاستشارة بتقييم شامل لتوقعات المريضة.",
    longDescriptionEn:
      "Breast Lift (Mastopexy) is a procedure that lifts sagging breasts and restores their natural shape and position while preserving their original size as much as possible.\n\nIt is commonly sought after pregnancy, breastfeeding or weight loss, when the breast loses its natural firmness.\n\nIt is performed under general anaesthesia and takes 1.5-3 hours, with incisions carefully designed to remain as hidden as possible.\n\nThis option is part of the Breast Reduction and Lift procedure; the journey begins with a full assessment of the patient's expectations.",
    icon: "Stethoscope",
    category: "body",
    duration: "1.5-3 ساعات",
    recovery: "2-3 أسابيع",
    isActive: true,
    isFeatured: false,
    order: 17,
    parentSlug: "breast-reduction-and-lift",
  },
  {
    slug: "breast-lift-with-implants",
    titleAr: "شد الثدي مع بروتيز",
    titleEn: "Breast Lift with Implants",
    descriptionAr: "دمج شد ورفع الثدي مع زرع البروتيز لاستعادة الامتلاء والحجم والرفع معاً",
    descriptionEn: "Combining breast lift with implants to restore firmness, volume and lift together",
    longDescriptionAr:
      "شد الثدي مع البروتيز هو إجراء يجمع بين شد ورفع الثدي وإضافة الزرعات (البروتيز) لاستعادة الامتلاء والحجم في الوقت نفسه.\n\nيُناسب الحالات التي يرغب صاحبها برفع الثدي المترهل مع الحفاظ على الحجم أو زيادته.\n\nيتم تحت التخدير العام ويستغرق من ساعتين إلى ٤ ساعات، ويُختار حجم ونوع الزرعة وفقاً لبنية الجسم وتوقعات المريضة.\n\nيُتاح هذا الخيار ضمن إجراء «تصغير وشد الثدي»، ويتم تقييم كل حالة على حدة خلال الاستشارة المخصصة.",
    longDescriptionEn:
      "Breast Lift with Implants is a procedure that combines lifting and reshaping the breast with placing implants to restore both fullness and volume at the same time.\n\nIt suits those who want a breast lift while maintaining or increasing size.\n\nIt is performed under general anaesthesia and takes 2-4 hours. The size and type of implant are chosen according to body structure and the patient's expectations.\n\nThis option is part of the Breast Reduction and Lift procedure; every case is assessed individually during a dedicated consultation.",
    icon: "Stethoscope",
    category: "body",
    duration: "2-4 ساعات",
    recovery: "3-4 أسابيع",
    isActive: true,
    isFeatured: false,
    order: 18,
    parentSlug: "breast-reduction-and-lift",
  },

  // ─── Face: Prominent Ear Correction (new procedure) ───
  {
    slug: "prominent-ear-correction",
    titleAr: "تبارز الصيوان",
    titleEn: "Prominent Ear Correction",
    descriptionAr: "تصحيح تبارز الأذنين وإعادة تشكيلهما ليتناسقا مع ملامح الوجه",
    descriptionEn: "Correcting prominent ears and reshaping them to harmonise with facial features",
    longDescriptionAr:
      "تصحيح تبارز الصيوان (Otoplasty) هو إجراء جراحي يهدف إلى إعادة تشكيل الأذنين البارزتين وتموضعها بشكل أقرب إلى الرأس ليظهرا بتوازن طبيعي مع ملامح الوجه.\n\nيُناسب الإجراء البالغين والأطفال على حد سواء، وغالباً ما يُجرى لدى الأطفال بعد اكتمال نمو الأذن.\n\nيتم غالباً تحت التخدير الموضعي مع تخدير خفيف لدى البالغين، ويستغرق من ساعة إلى ساعتين، وتظهر النتائج مباشرة بعد العملية.\n\nسيكتمل المحتوى التفصيلي لهذا الإجراء من إدارة العيادة؛ يُرجى التواصل للاستفسار عن التفاصيل الخاصة بكل حالة.",
    longDescriptionEn:
      "Prominent Ear Correction (Otoplasty) is a surgical procedure that reshapes protruding ears and repositions them closer to the head for a natural balance with facial features.\n\nIt suits both adults and children, and is often performed in children once the ear has fully developed.\n\nIn adults it is mostly performed under local anaesthesia with light sedation, takes 1-2 hours, and the improvement is visible immediately.\n\nDetailed content for this procedure will be completed by the clinic administration; please get in touch to enquire about the specifics of each case.",
    icon: "Sparkles",
    category: "face",
    duration: "1-2 ساعات",
    recovery: "1-2 أسابيع",
    isActive: true,
    isFeatured: false,
    order: 19,
  },
];

/**
 * Legacy combined records → the slugs that replace them.
 * During migration the legacy records are marked inactive and keep a pointer
 * to their replacements so old URLs never 404 and redirect gracefully.
 */
export const LEGACY_PROCEDURES: { slug: string; supersededBy: string[] }[] = [
  {
    slug: "upper-lower-eyelid-lift",
    supersededBy: ["upper-eyelid-lift", "lower-eyelid-lift"],
  },
  {
    slug: "arm-thigh-lift",
    supersededBy: ["arm-lift", "thigh-lift"],
  },
  {
    slug: "breast-augmentation-reduction",
    supersededBy: ["breast-augmentation", "breast-reduction-and-lift"],
  },
];

/**
 * Defaults for the homepage "Information Card" CMS content
 * (labeled with the exact Arabic title requested by the clinic).
 */
export const DEFAULT_INFORMATION_CARD = {
  enabled: true,
  badgeAr: "معلومات مهمة",
  badgeEn: "Patient Guide",
  titleAr: "معلومات على كل سيدة تنوي إجراء جراحة تجميلية معرفتها",
  titleEn: "Information Every Woman Considering Cosmetic Surgery Should Know",
  contentAr:
    "في د. الحسن الصايم، نؤمن بأن المعرفة الصحيحة هي أساس الثقة والسلامة. نضع بين يديكِ المعلومات الأساسية التي تحتاجين معرفتها قبل اتخاذ أي قرار يتعلق بإجراء تجميلي.\n\nنبدأ بتقييم شامل لصحتك وتاريخك الطبي وتوقعاتك، ثم نشرح لكِ الإجراء بوضوح وشفافية: طبيعته، ومدته، ومراحل التعافي، والنتائج الواقعية المتوقعة، دون أي وعود مبالغ فيها. قرارك أولاً وبعد اكتمال معرفتك.",
  contentEn:
    "At Dr. Al Hasan Al Saiem, we believe that accurate knowledge is the foundation of confidence and safety. We place in your hands the essential information you need before making any decision about a cosmetic procedure.\n\nWe begin with a thorough evaluation of your health, medical history and expectations, then explain the procedure clearly and transparently: its nature, duration, recovery stages, and the realistic outcomes — without exaggerated promises. Your decision comes first, once your knowledge is complete.",
  image: "",
  ctaTextAr: "احجزي استشارتك",
  ctaTextEn: "Book Your Consultation",
  ctaLink: "/consultation",
  ctaEnabled: true,
};

/**
 * Migration — splits combined procedures, adds the new structure, and seeds
 * the homepage Information Card. Idempotent & safe to run repeatedly on any
 * deployment (fresh or existing).
 */
export const migrateProcedureStructure = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let legacyHandled = 0;

    // 1) Insert any missing new procedures (idempotent by slug).
    for (const proc of NEW_PROCEDURES) {
      const existing = await ctx.db
        .query("procedures")
        .withIndex("by_slug", (q) => q.eq("slug", proc.slug))
        .first();
      if (existing) {
        skipped++;
        continue;
      }
      await ctx.db.insert("procedures", {
        ...proc,
        isFeatured: proc.isFeatured ?? false,
      });
      created++;
    }

    // 2) Handle legacy combined records → deactivate + keep supersededBy pointer.
    for (const legacy of LEGACY_PROCEDURES) {
      const existing = await ctx.db
        .query("procedures")
        .withIndex("by_slug", (q) => q.eq("slug", legacy.slug))
        .first();
      if (!existing) {
        skipped++;
        continue;
      }
      const patch: { isActive: boolean; supersededBy: string[] } = {
        isActive: false,
        supersededBy: legacy.supersededBy,
      };
      const needsPatch =
        existing.isActive === true ||
        JSON.stringify(existing.supersededBy ?? []) !== JSON.stringify(legacy.supersededBy);
      if (needsPatch) {
        await ctx.db.patch(existing._id, patch);
        updated++;
      } else {
        skipped++;
      }
      legacyHandled++;
    }

    // 3) Ensure the homepage Information Card setting exists.
    const infoCard = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "informationCard"))
      .first();
    if (!infoCard) {
      await ctx.db.insert("siteSettings", {
        key: "informationCard",
        value: DEFAULT_INFORMATION_CARD,
      });
      created++;
    } else {
      skipped++;
    }

    // 4) Surface the new section in the homepage visibility settings.
    const homepage = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "homepage"))
      .first();
    if (homepage) {
      const value = homepage.value as Record<string, unknown>;
      if (value && value.informationCard === undefined) {
        await ctx.db.patch(homepage._id, {
          value: { ...value, informationCard: true },
        });
        updated++;
      } else {
        skipped++;
      }
    }

    const summary =
      `Procedure structure migration complete: ` +
      `${created} created, ${updated} updated, ${skipped} already current, ` +
      `${legacyHandled} legacy records handled.`;
    return summary;
  },
});

/** Query — full migration status report (admin only). */
export const getMigrationStatus = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("procedures").withIndex("by_order").collect();
    const legacy = all.filter((p) => p.supersededBy && p.supersededBy.length > 0);
    const children = all.filter((p) => p.parentSlug);
    const newOnes = all.filter((p) =>
      NEW_PROCEDURES.some((n) => n.slug === p.slug)
    );
    const combined = all.find((p) => p.slug === "upper-lower-eyelid-lift");
    return {
      legacyRecords: legacy.map((p) => ({ slug: p.slug, isActive: p.isActive, supersededBy: p.supersededBy })),
      subProcedures: children.map((p) => ({ slug: p.slug, parentSlug: p.parentSlug, isActive: p.isActive })),
      newProceduresCount: newOnes.length,
      oldCombinedStillActive: combined ? combined.isActive : false,
    };
  },
});

/**
 * Normalize the `icon` field of every procedure to its semantic key.
 * Legacy names (e.g. "Eye", "Stethoscope", "SmilePlus") are replaced with the
 * expressive canonical keys. If an admin has already picked a semantic key it
 * is left untouched.
 */
export const migrateProcedureIcons = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const procedures = await ctx.db.query("procedures").collect();
    let updated = 0;
    for (const proc of procedures) {
      const target = resolveIconKey(proc.slug, proc.icon);
      if (target !== proc.icon) {
        await ctx.db.patch(proc._id, { icon: target });
        updated += 1;
      }
    }
    return { updated, total: procedures.length };
  },
});