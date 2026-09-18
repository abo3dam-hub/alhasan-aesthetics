import { mutation } from "./_generated/server";
import { NEW_PROCEDURES, DEFAULT_INFORMATION_CARD } from "./migration";

/**
 * Seed default procedures idempotently.
 * Uses the canonical NEW_PROCEDURES set from migration.ts (the restructured,
 * non-combined procedure set). Only creates procedures whose slug does not
 * already exist. Safe to run multiple times — never overwrites existing records.
 */
export const seedProcedures = mutation({
  args: {},
  handler: async (ctx) => {
    const defaultProcedures = NEW_PROCEDURES;

    let created = 0;
    let skipped = 0;

    for (const proc of defaultProcedures) {
      // Check if this slug already exists
      const existing = await ctx.db
        .query("procedures")
        .withIndex("by_slug", (q) => q.eq("slug", proc.slug))
        .first();

      if (existing) {
        skipped++;
        continue;
      }

      await ctx.db.insert("procedures", proc);
      created++;
    }

    return `Procedures seed complete: ${created} created, ${skipped} already existed (skipped).`;
  },
});

/**
 * Seed homepage CMS settings, doctor settings, and section headers.
 * Idempotent — only fills in missing/empty fields. Never overwrites.
 */
export const seedHomepageSettings = mutation({
  args: {},
  handler: async (ctx) => {
    let created = 0;
    let updated = 0;
    let skipped = 0;

    // Helper: upsert a siteSettings record, only filling empty fields
    async function upsertSettings(key: string, newValue: Record<string, unknown>) {
      const existing = await ctx.db
        .query("siteSettings")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();

      if (existing) {
        // Merge: only fill in fields that are empty/missing in the existing value
        const current = existing.value as Record<string, unknown>;
        const merged: Record<string, unknown> = { ...current };
        let changed = false;
        for (const [k, v] of Object.entries(newValue)) {
          if (v !== undefined && v !== null) {
            // For nested objects (like socialMedia, stats, trustBadges), merge deeply
            if (
              typeof v === "object" && !Array.isArray(v) && v !== null &&
              typeof current[k] === "object" && !Array.isArray(current[k]) && current[k] !== null
            ) {
              const nestedMerged: Record<string, unknown> = { ...(current[k] as Record<string, unknown>) };
              for (const [nk, nv] of Object.entries(v as Record<string, unknown>)) {
                if (nv !== undefined && nv !== null && (nestedMerged[nk] === undefined || nestedMerged[nk] === null || nestedMerged[nk] === "")) {
                  nestedMerged[nk] = nv;
                  changed = true;
                }
              }
              merged[k] = nestedMerged;
            } else if (
              current[k] === undefined || current[k] === null || current[k] === ""
            ) {
              merged[k] = v;
              changed = true;
            }
          }
        }
        if (changed) {
          await ctx.db.patch(existing._id, { value: merged });
          updated++;
        } else {
          skipped++;
        }
      } else {
        await ctx.db.insert("siteSettings", { key, value: newValue });
        created++;
      }
    }

    // ─── Doctor Settings ───
    await upsertSettings("doctor", {
      doctorNameAr: "د. الحسن الصايم",
      doctorNameEn: "Dr. Al Hasan Al Saiem",
      whatsappNumber: "+966500000000",
      phone: "+966 XX XXX XXXX",
      email: "info@dralhasanalsaiem.com",
      addressAr: "سوريا، دمشق، اللاذقية\nالإمارات العربية المتحدة، دبي",
      addressEn: "Syria, Damascus, Lattakia\nUnited Arab Emirates, Dubai",
      biographyAr: "د. الحسن الصايم طبيب متخصص في الجراحة التجميلية بخبرة تزيد عن ١٥ عاماً في تحويل حياة آلاف المرضى من خلال نتائج طبيعية ومتقنة.",
      biographyEn: "Dr. Al Hasan Al Saiem is a board-certified aesthetic and plastic surgeon with over 15 years of experience transforming the lives of thousands of patients.",
      specializationsAr: "شد الوجه والرقبة، تجميل الأنف، شفط وحقن الشحم، جميع إجراءات التجميل المتقدمة",
      specializationsEn: "Face & Neck Lift, Rhinoplasty, Liposuction & Fat Transfer, All Advanced Aesthetic Procedures",
      educationAr: "دكتوراه في الطب، شهادة البورد في الجراحة التجميلية",
      educationEn: "MD, Board Certified in Plastic Surgery",
      heroTitleAr: "جمالك يستحق",
      heroTitleEn: "Your Beauty Deserves",
      heroSubtitleAr: "أرقى العناية",
      heroSubtitleEn: "The Finest Care",
      socialMedia: {
        instagram: "",
        facebook: "",
        twitter: "",
        snapchat: "",
        tiktok: "",
      },
      workingHoursWeekdays: "9 AM - 6 PM",
      workingHoursFriday: "",
      workingHoursSaturday: "",
    });

    // ─── Hero Section CMS ───
    await upsertSettings("hero", {
      badgeAr: "جراحة تجميلية وتجميلية",
      badgeEn: "Aesthetic & Plastic Surgery",
      titleAr: "جمالك يستحق",
      titleEn: "Your Beauty Deserves",
      subtitleAr: "أرقى العناية",
      subtitleEn: "The Finest Care",
      descriptionAr: "نحول رؤيتك إلى واقع بأحدث التقنيات الجراحية وبمعايير عالمية. ثقتك وجمالك هما أولويتنا المطلقة.",
      descriptionEn: "We bring your vision to life with the latest surgical techniques and world-class standards. Your trust and beauty are our absolute priority.",
      ctaTextAr: "احجز استشارتك ومعرفة الأسعار",
      ctaTextEn: "Book Your Consultation & Get Pricing",
      ctaSecondaryTextAr: "استكشف الإجراءات",
      ctaSecondaryTextEn: "Explore Procedures",
      badgeEnabled: true,
      ctaEnabled: true,
      ctaSecondaryEnabled: true,
      trustBadges: [
        { labelAr: "+١٥ سنة خبرة", labelEn: "15+ Years of Experience", icon: "award", enabled: true },
        { labelAr: "+٥٠٠٠ عملية ناجحة", labelEn: "5,000+ Successful Surgeries", icon: "star", enabled: true },
        { labelAr: "نتائج طبيعية ١٠٠٪", labelEn: "100% Natural Results", icon: "sparkles", enabled: true },
      ],
    });

    // ─── About Section CMS ───
    await upsertSettings("about", {
      badgeAr: "عن الدكتور الحسن الصايم",
      badgeEn: "About Dr. Al Hasan",
      titleAr: "خبرة تجمع بين",
      titleEn: "Expertise That Merges",
      titleHighlightAr: "العلم والجمال",
      titleHighlightEn: "Science & Beauty",
      descriptionAr: "د. الحسن الصايم طبيب متخصص في الجراحة التجميلية بخبرة تزيد عن ١٥ عاماً في تحويل حياة آلاف المرضى من خلال نتائج طبيعية ومتقنة. متخصص في شد الوجه والرقبة، تجميل الأنف، شفط وحقن الشحم، وجميع إجراءات التجميل المتقدمة.",
      descriptionEn: "Dr. Al Hasan Al Saiem is a board-certified aesthetic and plastic surgeon with over 15 years of experience. Specializing in Face & Neck Lift, Rhinoplasty, Liposuction & Fat Transfer, and all advanced aesthetic procedures.",
      stats: [
        { icon: "clock", value: "15+", labelAr: "سنوات خبرة", labelEn: "Years of Experience", enabled: true },
        { icon: "heart", value: "5000+", labelAr: "إجراء ناجح", labelEn: "Successful Procedures", enabled: true },
        { icon: "users", value: "99%", labelAr: "نسبة الرضا", labelEn: "Patient Satisfaction", enabled: true },
        { icon: "award", value: "10+", labelAr: "شهادة دولية", labelEn: "Certifications", enabled: true },
      ],
    });

    // ─── CTA Section CMS ───
    await upsertSettings("cta", {
      enabled: true,
      badgeAr: "لا تنتظر أكثر",
      badgeEn: "Don't Wait Any Longer",
      titleAr: "مستعد لتغيير حياتك؟",
      titleEn: "Ready to Transform Your Life?",
      descriptionAr: "احجز استشارتك المجانية اليوم واكتشف كيف يمكننا تحقيق رؤيتك الجمالية.",
      descriptionEn: "Book your free consultation today and discover how we can bring your aesthetic vision to life.",
      buttonTextAr: "احجز استشارتك",
      buttonTextEn: "Book Your Consultation",
      buttonEnabled: true,
      buttonDestination: "/consultation",
    });

    // ─── Footer CMS ───
    await upsertSettings("footer", {
      descriptionAr: "د. الحسن الصايم — استشاري جراحة تجميلية متخصص في تحقيق نتائج طبيعية ومتقنة بأعلى معايير الجودة العالمية.",
      descriptionEn: "Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery specialist delivering natural, refined results with the highest international quality standards.",
    });

    // ─── Homepage Visibility ───
    await upsertSettings("homepage", {
      hero: true,
      about: true,
      informationCard: true,
      procedures: true,
      beforeAfter: true,
      testimonials: true,
      faq: true,
      cta: true,
      contact: true,
    });

    // ─── Information Card (patient guide shown between About & Procedures) ───
    await upsertSettings("informationCard", {
      ...DEFAULT_INFORMATION_CARD,
    });

    // ─── Section Headers ───
    await upsertSettings("proceduresSection", {
      badgeAr: "إجراءاتنا",
      badgeEn: "Our Procedures",
      titleAr: "خدماتنا",
      titleEn: "Our",
      titleHighlightAr: "التجميلية",
      titleHighlightEn: "Procedures",
      subtitleAr: "نقدم مجموعة شاملة من الإجراءات التجميلية المتقدمة المصممة بعناية لتحقيق نتائج طبيعية ومتقنة.",
      subtitleEn: "We offer a comprehensive range of advanced aesthetic procedures carefully designed to achieve natural, refined results.",
    });

    await upsertSettings("beforeAfterSection", {
      badgeAr: "قبل وبعد",
      badgeEn: "Before & After",
      titleAr: "نتائج",
      titleEn: "Results",
      titleHighlightAr: "تحدث عن نفسها",
      titleHighlightEn: "Speak for Themselves",
      subtitleAr: "نفخر بعرض نتائج حقيقية لمرضانا. كل حالة هي قصة نجاح فريدة.",
      subtitleEn: "We are proud to showcase real results from our patients. Every case is a unique success story.",
    });

    await upsertSettings("testimonialsSection", {
      badgeAr: "تجارب المرضى",
      badgeEn: "Patient Stories",
      titleAr: "ماذا يقول",
      titleEn: "What",
      titleHighlightAr: "مرضانا",
      titleHighlightEn: "Our Patients Say",
      subtitleAr: "قصص حقيقية من مرضى عاشوا تجربة استثنائية معنا.",
      subtitleEn: "Real stories from patients who experienced exceptional care with us.",
    });

    await upsertSettings("faqSection", {
      badgeAr: "الأسئلة الشائعة",
      badgeEn: "FAQ",
      titleAr: "الأسئلة",
      titleEn: "Frequently Asked",
      titleHighlightAr: "الأكثر شيوعاً",
      titleHighlightEn: "Questions",
      subtitleAr: "إجابات على الأسئلة الأكثر تكراراً حول إجراءاتنا وخدماتنا.",
      subtitleEn: "Answers to the most commonly asked questions about our procedures and services.",
    });

    // ─── SEO Settings ───
    await upsertSettings("seo", {
      siteTitleAr: "د. الحسن الصايم — جراحة تجميلية",
      siteTitleEn: "Dr. Al Hasan — Aesthetic & Plastic Surgery",
      metaDescriptionAr: "استشاري جراحة تجميلية بخبرة أكثر من ١٥ عاماً. نتائج طبيعية ومتقنة بأعلى معايير الجودة العالمية.",
      metaDescriptionEn: "Board-certified aesthetic surgeon with 15+ years of experience. Natural, refined results with the highest international quality standards.",
      canonicalBase: "https://dralhasanalsaiem.com",
    });

    return `Homepage CMS seed complete: ${created} settings created, ${updated} settings updated (filled empty fields), ${skipped} settings already complete (skipped).`;
  },
});

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // ─── Check if procedures exist ───
    const existingProcedures = await ctx.db.query("procedures").first();
    if (!existingProcedures) {

    // ─── Seed Doctor Settings ───
    const doctorSettings = {
      doctorNameAr: "د. الحسن الصايم",
      doctorNameEn: "Dr. Al Hasan Al Saiem",
      whatsappNumber: "+966500000000",
      phone: "+966 XX XXX XXXX",
      email: "info@dralhasanalsaiem.com",
      addressAr: "سوريا، دمشق، اللاذقية\nالإمارات العربية المتحدة، دبي",
      addressEn: "Syria, Damascus, Lattakia\nUnited Arab Emirates, Dubai",
      biographyAr: "د. الحسن الصايم طبيب متخصص في الجراحة التجميلية بخبرة تزيد عن ١٥ عاماً في تحويل حياة آلاف المرضى من خلال نتائج طبيعية ومتقنة.",
      biographyEn: "Dr. Al Hasan Al Saiem is a board-certified aesthetic and plastic surgeon with over 15 years of experience transforming the lives of thousands of patients.",
      specializationsAr: "شد الوجه والرقبة، تجميل الأنف، شفط وحقن الشحم، جميع إجراءات التجميل المتقدمة",
      specializationsEn: "Face & Neck Lift, Rhinoplasty, Liposuction & Fat Transfer, All Advanced Aesthetic Procedures",
      educationAr: "دكتوراه في الطب، شهادة البورد في الجراحة التجميلية",
      educationEn: "MD, Board Certified in Plastic Surgery",
      heroTitleAr: "جمالك يستحق",
      heroTitleEn: "Your Beauty Deserves",
      heroSubtitleAr: "أرقى العناية",
      heroSubtitleEn: "The Finest Care",
      socialMedia: {
        instagram: "",
        facebook: "",
        twitter: "",
        snapchat: "",
        tiktok: "",
      },
      workingHoursWeekdays: "9 AM - 6 PM",
      workingHoursFriday: "",
      workingHoursSaturday: "",
    };
    await ctx.db.insert("siteSettings", {
      key: "doctor",
      value: doctorSettings,
    });

    // ─── Seed Procedures ───
    const procedures = NEW_PROCEDURES;

    for (const proc of procedures) {
      await ctx.db.insert("procedures", proc);
      }
    } // end if (!existingProcedures)

    // ─── Seed Testimonials (independent) ───
    const existingTestimonials = await ctx.db.query("testimonials").first();
    if (!existingTestimonials) {
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
    } // end if (!existingTestimonials)

    // ─── Seed FAQ (independent) ───
    const existingFaq = await ctx.db.query("faq").first();
    if (!existingFaq) {
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
    } // end if (!existingFaq)

    return `Seed complete: procedures ${existingProcedures ? "already exist" : "created"}, testimonials ${existingTestimonials ? "already exist" : "created"}, FAQ ${existingFaq ? "already exist" : "created"}`;
  },
});

/**
 * Polishes the live English copy of home-page CMS settings (hero badges/CTA,
 * about description & stats, information card) that was seeded before the
 * professional English pass. Only rewrites the exact fields listed below and
 * leaves every other field — including all Arabic text — untouched.
 */
export const polishEnglishCopy = mutation({
  args: {},
  handler: async (ctx) => {
    const changed: string[] = [];

    async function patchSetting(
      key: string,
      apply: (value: Record<string, unknown>) => void,
    ) {
      const doc = await ctx.db
        .query("siteSettings")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      if (!doc) return;
      const value = { ...(doc.value as Record<string, unknown>) };
      apply(value);
      await ctx.db.patch(doc._id, { value });
      changed.push(key);
    }

    // ─── Hero ───
    await patchSetting("hero", (v) => {
      if (v.ctaTextEn === "Book Your Consultation") {
        v.ctaTextEn = "Book Your Consultation & Get Pricing";
      }
      const badges = (v.trustBadges as Array<Record<string, unknown>> | undefined) ?? [];
      const badge = (old: string) => badges.find((b) => b.labelEn === old);
      const b1 = badge("+10 Years Experience ");
      if (b1) b1.labelEn = "10+ Years of Experience";
      const b2 = badge("+5000 Successful Surgeries");
      if (b2) b2.labelEn = "5,000+ Successful Surgeries";
      const b3 = badge("Natural results that respect the specific nature of the case.");
      if (b3) b3.labelEn = "Natural, discreet results tailored to each case";
      const b4 = badge(" We are not overstating expectations.");
      if (b4) b4.labelEn = "Honest, realistic expectations from the start";
    });

    // ─── About ───
    await patchSetting("about", (v) => {
      if (typeof v.descriptionEn === "string") {
        v.descriptionEn = v.descriptionEn
          .replace("Dr. Alhasan Alsaiem", "Dr. Al Hasan Al Saiem")
          .trimEnd()
          .concat(".");
      }
      const stats = (v.stats as Array<Record<string, unknown>> | undefined) ?? [];
      const years = stats.find((s) => s.labelEn === "Years Experience");
      if (years) years.labelEn = "Years of Experience";
    });

    // ─── Information Card ───
    await patchSetting("informationCard", (v) => {
      v.titleEn = "What Every Woman Considering Cosmetic Surgery Should Know";
      v.contentEn =
        "At Dr. Al Hasan Al Saiem's practice, we believe that a proper understanding of your aesthetic needs is the foundation of confidence and safety. We provide you with the essential information you need before making any decision about a cosmetic procedure.\n\nWe begin with a comprehensive assessment of your health, medical history and expectations. We then explain the procedure with clarity and full transparency — its nature, duration, recovery stages and realistic expected outcomes — without exaggerated promises. The decision is always yours, made once you are fully informed.";
    });

    return `Polish complete. Updated: ${changed.join(", ") || "none"}.`;
  },
});

/**
 * Starter articles for the patient-education blog. Idempotent — only creates
 * articles whose slug does not exist yet, so clinic edits are never overwritten.
 */
export const seedArticles = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const starterArticles = [
      {
        slug: "how-long-does-a-facelift-last",
        titleAr: "كم تدوم عملية شد الوجه؟ النتائج والعوامل المؤثرة",
        titleEn: "How Long Does a Facelift Last? Results and Key Factors",
        excerptAr:
          "شد الوجه يمنح نتائج تدوم عادة بين 7 و12 عاماً. نستعرض هنا العوامل التي تحدد مدة بقاء النتيجة ومتى قد تحتاج لعملية تجميلية أخرى.",
        excerptEn:
          "A facelift typically delivers results lasting 7–12 years. Here we explain what determines how long the outcome lasts and when a repeat procedure may be needed.",
        bodyAr:
          "## كم تدوم نتيجة عملية شد الوجه؟\n\nشد الوجه (Rhytidectomy) يشدّ الأنسجة العميقة ويعيد تموضع الجلد. عند معظم المرضى تدوم النتيجة ما بين ٧ و١٢ عاماً، وقد تطول أكثر مع نمط حياة صحي وعناية جيدة بالبشرة.\n\n## ما العوامل التي تحدد مدة النتيجة؟\n\nعدة عوامل تؤثر في ثبات النتيجة:\n\n- **العمر عند إجراء العملية.** المرضى في الأربعينات والخمسينات يستفيدون عادة من نتيجة أطول من أولئك الذين يُجرون العملية في سن أكبر.\n- **نوعية الجلد والعوامل الوراثية.** تلعب جودة البشرة ومرونتها والميل الوراثي تجاه علامات التقدم بالسن دوراً مهماً.\n- **نمط الحياة.** التعرض للشمس والتدخين وتغير الوزن الكبير قد تسرّع الشيخوخة الطبيعية للوجه.\n\n## متى قد تحتاج لعملية شد ثانية؟\n\nشد الوجه ليس حاجزاً أمام التقدم بالسن، بل يعيد عقارب الساعة إلى الوراء. بحسب طريقة تقدم الوجه بالسن، قد يُنظر أحياناً إلى لمسة تجميلية أو شد ثانٍ بعد ١٠–١٥ عاماً من العملية الأولى.\n\n## ما النتائج الواقعية المتوقعة؟\n\nيجب أن تتوقع مظهراً أكثر نضارة وراحة — وليس شكلاً مختلفاً تماماً. أفضل النتائج هي تلك الطبيعية التي تحترم توازن الملامح.\n\nالمعلومات الواردة أعلاه تثقيفية ولا تغني عن استشارة طبية. كل حالة مختلفة، والرأي النهائي يحدده د. الحسن الصايم خلال استشارة خاصة.",
        bodyEn:
          "## How long does the result last?\n\nA facelift (rhytidectomy) tightens the deeper facial tissues and repositions the skin. For most patients the results last between 7 and 12 years — and often longer when combined with a healthy lifestyle and good skin care.\n\n## What determines how long a facelift lasts?\n\nSeveral factors influence the durability of your result:\n\n- **Age at surgery.** Patients in their 40s and 50s generally enjoy a longer-lasting result than those operated on at an older age.\n- **Skin quality and genetics.** The quality and elasticity of your skin, together with your genetic tendency to age, play a major role.\n- **Lifestyle.** Sun exposure, smoking and significant weight changes can speed up the natural ageing of the face.\n\n## When might you need a second facelift?\n\nA facelift is not a barrier to ageing — it resets the clock. Depending on how your face ages, a touch-up or a second lift is sometimes considered 10–15 years after the first surgery.\n\n## What results can you realistically expect?\n\nYou should expect a fresher, more rested appearance — not a completely different look. The best results are natural-looking and respect the balance of your features.\n\nThe information above is educational and does not replace a medical consultation. Every case is different, and the final opinion is given by Dr. Al Hasan Al Saiem during a private consultation.",
        categoryAr: "الوجه",
        categoryEn: "Face",
        relatedProcedureSlug: "face-neck-lift",
        seoTitleAr: "كم تدوم عملية شد الوجه؟ | د. الحسن الصايم",
        seoDescriptionAr:
          "يراوح عمر نتيجة شد الوجه بين 7 و12 عاماً عادةً. تعرف على العوامل المؤثرة في مدة النتيجة ومتى قد تحتاج لعملية تجميلية ثانية.",
        seoTitleEn: "How Long Does a Facelift Last? | Dr. Al Hasan Al Saiem",
        seoDescriptionEn:
          "A facelift usually lasts 7–12 years. Learn the factors that affect how long results last and when a second facelift might be needed.",
        readingMinutes: 4,
        publishDate: now - 2 * 86_400_000,
        isPublished: true,
        isFeatured: true,
        order: 1,
      },
      {
        slug: "when-does-rhinoplasty-final-result-show",
        titleAr: "متى يظهر الشكل النهائي لتجميل الأنف؟",
        titleEn: "When Will the Final Result of Rhinoplasty Show?",
        excerptAr:
          "يستغرق الشكل النهائي لتجميل الأنف من 6 إلى 12 شهراً ليظهر بشكل كامل. إليك مراحل التعافي بالتفصيل ومتى يمكنك تقييم النتيجة.",
        excerptEn:
          "The final shape of a rhinoplasty takes 6–12 months to fully appear. Here is the recovery timeline and when you can truly judge your result.",
        bodyAr:
          "## الإجابة المختصرة\n\nيظهر الشكل النهائي لتجميل الأنف بشكل كامل بعد ٦ إلى ١٢ شهراً من العملية. لكن معظم التفاصيل التي ستلاحظها في المرآة تظهر غالباً بعد ثلاثة إلى ستة أشهر.\n\n## أسبوعاً بأسبوع بعد العملية\n\nيسير التعافي بعد تجميل الأنف وفق مسار متوقع إلى حد كبير:\n\n- **الأسبوعان الأولان.** يُثبَّت الأنف بجبيرة وقد يكون هناك حشو داخلي مؤقت؛ تزول معظم الكدمات والتورمات. يعود معظم المرضى إلى عملهم الخفيف خلال أسبوع أو أسبوعين.\n- **من الأسبوع الثاني وحتى السادس.** يستمر الأنف بالاستقرار. قد يستمر تورم طرف الأنف فترة أطول ويبدو الطرف مرتفعاً قليلاً في البداية.\n- **الشهر الثالث إلى السادس.** يظهر قرابة ثلثي النتيجة النهائية. تحدد سماكة الجلد وحجم التعديلات مقدار ما تبقى من التورم.\n- **الشهر السادس إلى الثاني عشر.** يزول التورم الدقيق المتبقي — خاصة في الطرف — وتظهر الملامح النهائية.\n\n## لماذا يستغرق طرف الأنف وقتاً أطول؟\n\nجلد طرف الأنف أسمك وغضروفه أليّن، لذا فهو آخر منطقة تتنقّى. الصبر جزء من نجاح عملية تجميل الأنف.\n\n## نصائح لحماية نتيجتك\n\n- أبقِ رأسك مرتفعاً خلال الليالي الأولى.\n- تجنّب وضع النظارات على جسر الأنف لمدة أربعة أسابيع على الأقل.\n- تجنّب الرياضات التي قد تصدم الأنف لمدة ستة إلى ثمانية أسابيع.\n\nالمعلومات الواردة أعلاه تثقيفية ولا تغني عن استشارة طبية. كل حالة مختلفة، والرأي النهائي يحدده د. الحسن الصايم خلال استشارة خاصة.",
        bodyEn:
          "## The short answer\n\nThe final result of rhinoplasty becomes fully visible 6 to 12 months after surgery. However, most of the definition you will see in the mirror is already noticeable after three to six months.\n\n## Week by week after surgery\n\nRecovery following rhinoplasty follows a fairly predictable timeline:\n\n- **First 1–2 weeks.** A splint (and at times nasal packing) supports the nose; most bruising and swelling subside. Most patients return to light work within a week or two.\n- **Weeks 2–6.** The nose continues to settle. Swelling from the tip can persist longer and may make the tip appear slightly upturned at first.\n- **Months 3–6.** Around two-thirds of the final result is visible. Skin thickness and the amount of work done determine how much remains.\n- **Months 6–12.** The remaining fine swelling — especially at the tip — resolves, revealing the final shape.\n\n## Why the tip takes longest\n\nThe nasal tip has thicker skin and softer cartilage, so it is normally the last area to refine. Patience is part of a successful rhinoplasty.\n\n## Tips for protecting your result\n\n- Keep your head elevated for the first nights.\n- Avoid wearing glasses resting on the bridge for at least four weeks.\n- Avoid any contact sport or pressure on the nose for six to eight weeks.\n\nThe information above is educational and does not replace a medical consultation. Every case is different, and the final opinion is given by Dr. Al Hasan Al Saiem during a private consultation.",
        categoryAr: "الأنف",
        categoryEn: "Nose",
        relatedProcedureSlug: "rhinoplasty",
        seoTitleAr: "متى يظهر الشكل النهائي لتجميل الأنف؟ | د. الحسن الصايم",
        seoDescriptionAr:
          "يوضح المقال مراحل التعافي بعد تجميل الأنف ومتى تختفي التورمات ويظهر الشكل النهائي خلال 6–12 شهراً، مع نصائح للعناية.",
        seoTitleEn: "When Does the Final Rhinoplasty Result Show? | Dr. Al Hasan Al Saiem",
        seoDescriptionEn:
          "A rhinoplasty final result takes 6–12 months. This guide breaks down the recovery timeline and when to judge your new nose shape.",
        readingMinutes: 3,
        publishDate: now - 86_400_000,
        isPublished: true,
        isFeatured: false,
        order: 2,
      },
    ];

    let created = 0;
    let skipped = 0;
    for (const article of starterArticles) {
      const existing = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", article.slug))
        .first();
      if (existing) {
        skipped++;
        continue;
      }
      await ctx.db.insert("articles", { ...article, updatedDate: undefined });
      created++;
    }

    return `Articles seed complete: ${created} created, ${skipped} already existed (skipped).`;
  },
});
