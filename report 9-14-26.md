# تقرير وضع المشروع — 14-9-2026

**المستودع:** `abo3dam-hub/alhasan-aesthetics`
**الفرع:** `main` — HEAD: `e9d5c9c` (شجرة نظيفة، مرفوع لـ GitHub)

---

## ١. ملخص الحالة الحالية

| الجهة | الحالة |
|---|---|
| GitHub `main` | `e9d5c9c` — متطابق مع فروع العمل، نظيف |
| Convex **Production** | `kindly-anaconda-422` — Auth مفعّل، البيانات مستعادة، الكود الحكومي حالي |
| Convex **Dev** | `gregarious-perch-128` |
| Vercel `dralhasan` | نشط — الاسم المستعار `https://dralhasan-three.vercel.app` يخدم آخر build |
| المصادقة | حساب Admin واحد `abo3dam@gmail.com` (سجّل الدخول بنجاح) |
| بيانات CMS | كاملة (جداول CMS + ملفات الـ Storage) |
| النطاق | `alhasanalsaiem.com` مُضاف في إعدادات المشروع (ليس في Vercel بعد) |

---

## ٢. ما تم إنجازه في هذا السيشن

### ٢.١ إصلاح Auth على Production (السبب الجذري)
- كان الخطأ: `Missing environment variable JWT_PRIVATE_KEY`.
- شُخّص أن `@convex-dev/auth@0.0.90` يتطلب `JWT_PRIVATE_KEY` و`JWKS`، بينما `CONVEX_SITE_URL` تُحقن تلقائيًا.
- عُولج بالـ CLI الرسمي:
  `auth --deployment-name kindly-anaconda-422 --web-server-url https://dralhasan-three.vercel.app`
- النتيجة: تعيين `SITE_URL` و`JWT_PRIVATE_KEY` و`JWKS` على Production (دون كشف القيم).
- تحقق: `https://kindly-anaconda-422.convex.site/.well-known/jwks.json` يعيد مفتاح RSA سليم.
- اختبار تسجيل الدخول: كلمة مرور خاطئة → `Uncaught Error: InvalidSecret` (المسار يعمل حتى مرحلة فحص التشفير).

### ٢.٢ استعادة بيانات CMS إلى Production
- صدّرنا snapshot كامل من Dev: `/tmp/opencode/convexdump/dev-snapshot.zip` (البيانات + ملفات الـ Storage).
- مشكلة: الاستيراد عبر ZIP يحتفظ بـ`_id` الأصلي، واصطدم مع جدول `users` الحالي في Production (تعارض نطاق معرّفات).
- الحل الآمن دون المساس بحساب الـ Admin:
  1. استيراد جداول CMS بدون `_id` (مع الحفاظ على `_creationTime`) → معرّفات جديدة داخلية.
  2. استيراد `_storage` عبر ZIP منفصل يحافظ على معرّفات الملفات الأصلية `kg...`.

**البيانات المستعادة إلى Production:**

| الجدول | العدد |
|---|---|
| `procedures` | 19 |
| `siteSettings` | 12 |
| `media` | 15 |
| `testimonials` | 3 |
| `faq` | 6 |
| `beforeAfter` | 3 |
| `_storage` | 15 ملفًا |

- `media.resolveUrls` يعيد روابط صالحة للملفات (مثلًا `https://kindly-anaconda-422.convex.cloud/api/storage/...`).

### ٢.٣ إصلاح الرابط الاحتياطي في الواجهة
- `src/main.tsx:89` كان يشير إلى الـ deployment الميت `impartial-ladybug-881` (freebuff).
- صُحّح إلى `https://kindly-anaconda-422.convex.cloud` وتم الالتزام والدفع:
  - `984fc0f` — fix: point Convex fallback URL at active production deployment
  - `5f8533f` — chore: ignore vercel local link files

### ٢.٤ النشر على Vercel
- أُعيد ربط `.vercel/project.json` بالمشروع الصحيح `dralhasan` (كان مرتبطًا بالمشروع الخطأ `alhasan-aesthetics` أنشأه CLI بالخطأ ضمن هذا السيشن — حُذف نهائيًا).
- نشر إنتاجي جديد من `984fc0f` → يُخدم الآن على `dralhasan-three.vercel.app`.
- تحقق من الـ bundle المنشور: يحتوي `https://kindly-anaconda-422.convex.cloud` (الظهور الثانوي `happy-otter-123.convex.cloud` مجرد نص مثال داخل رسالة خطأ مكتبة Convex نفسها، لا يوجد أي مرجع فعلي له).

### ٢.٥ تصفير أخطاء ESLint
- `npm run build` (tsc + Vite) ينجح.
- `convex codegen` أعاد توليد `_generated` **بدون أي diff** — أي أن الكود الحكومي الحالي مطابق لكود HEAD.
- الـ سايت ماب: `https://kindly-anaconda-422.convex.site/sitemap.xml` يشمل الرئيسية + /ar + /en + consultation + before-after + **كل الإجراءات** مع `canonicalBase: https://dr-alhasan.com`.
- كل الصفحات العامة على `dralhasan-three.vercel.app` تعيد 200.
- `migration:getMigrationStatus`: `newProceduresCount: 9`، `oldCombinedStillActive: false`، 3 سجلات قديمة غير فعالة مع `supersededBy`، إجراءان فرعيان نشطان.
- eslint: تم تصفير أخطاء الـ lint بالكامل — من **166 خطأ** إلى **0 أخطاء** (يبقى 12 تحذيرًا حميدًا من `react-refresh/only-export-components` في مكونات shadcn/ui و`main.tsx` وملف vly مولّد). السبب الجذري لأغلب الأخطاء: مكوّن `ResolvedImage` استخدم اسم `ref` المحجوز كـ prop (أخطاء `react-hooks/refs` كاذبة).

### ٢.٦ إصلاح شريط السحب (Before/After Slider)
- كان الخطأ: clip-path و pointer-events غير مُهيأة بشكل صحيح على crack文化传媒年 February — قبل وبعد يُظهر قطعين بدل شريط سحب واحد.
- الحل: `clip-path` + `pointer-events: all` على العنصر السالك مع `cursor-col-resize` على الحاوية.
- `0dd463a` — fix: before/after slider shows single divider while dragging.

### ٢.٧ صندوق عرض الصور (Gallery Lightbox) لصفحات الإجراءات
- عند الضغط على أي صورة في صفحة إجراء، تُفتح نافذة عرض (lightbox) بكامل الشاشة.
- أزرار سهم يمين/يسار للتنقل بين الصور، Esc للإغلاق، click on backdrop للإغلاق.
- عداد صور (1/5 مثلاً) في الأسفل.
- thumbnail strip في الأسفل مع zoom-in على hover.
- `AnimatePresence` من framer-motion للتحريك السلس.
- `dd6ed9b` — feat: gallery lightbox on procedure pages (click to enlarge & browse).

### ٢.٨ تلميحات نسب العرض/الارتفاع في لوحة التحكم
- أُضيف prop `hint?: ReactNode` إلى `MediaSelector` component مع Info icon.
- تلميحات عربية لكل حقل صورة في لوحة التحكم:
  - Procedure image: 4:3 أو 16:10
  - Before/After: 1:1 + 4:3
  - OG image: 1200×630
  - Gallery: 1:1
  - Doctor image: 3:4
  - Info card: 4:3
- `6439ceb` — feat: aspect-ratio hints on all admin image fields.

### ٢.٩ أيقونة Tab ديناميكية (Dynamic Favicon)
- أُنشئ `favicon.svg` جديد بتصميم medical-cross على خلفية `#8B7355` (بديل المربع الأسود).
- `DynamicFavicon` component في `main.tsx` يقرأ `navbarPhoto` من doctor settings في Convex ويعمل `resolveUrl` ويُحدّث `<link rel="icon">` ديناميكيًا.
- إذا لم يكن هناك صورة doctor → يبقى favicon الثابت `favicon.svg`.
- `d0c62e7` — fix: replace black-square favicon with doctor medical-cross icon.
- `3d29def` — feat: use navbar doctor photo as dynamic tab favicon.

### ٢.١٠ أزرار التواصل الاجتماعي العائمة (Floating Social Buttons)
- مكون `FloatingSocial.tsx` — يظهر في الزاوية السفلى اليمنى على كل الصفحات (عدا `/dashboard` و`/auth`).
- الأزرار: WhatsApp (يُحوّل إلى صفحة الاستشارة `/consultation`)، Facebook، Instagram (يظهر فقط إذا كان الرابط مُعرّفًا في doctor settings)، زر العودة للأعلى.
- z-index 70 (فوق المحتوى)، مع glow effect.
- `856296a` — feat: floating social buttons (WhatsApp→/consultation, FB, IG, back-to-top).

### ٢.١١ انتقالات سلسة بين الصفحات (Route Transitions)
- `AnimatedRoutes` في `main.tsx` يُلفّ كل صفحة بـ `<div className="page-enter">` مع CSS animation (opacity fade).
- يُ跪ّع `useLocation().pathname` عند كل تغيير للمسار.
- `856296a` — feat: smooth route transitions via CSS animation (no framer-motion in entry).

### ٢.١٢ أرقام متحركة (CountUp) في قسم About
- مكون `CountUp.tsx` — يحصّل الرقم تدريجيًا من 0 إلى القيمة المطلوبة مع `useInView` من framer-motion.
- يستخدم في: الإجراءات، سنوات الخبرة، نسبة الرضا، المرضى ( Somali مع withSuffix لـ +).
- floating badges في الخلفية، grid cards في المقدمة.
- `856296a` — feat: count-up stats in About section.

### ٢.١٣ تأثير Parallax خفيف في Hero
- `useScroll` + `useTransform` من framer-motion على الكريات الزخرفية (primary/secondary) أو articles decorative elements في Hero.
- `856296a` — feat: light parallax on Hero decorative elements.

### ٢.١٤ شريط عرض التقييمات (Testimonials Carousel)
- عرض تلقائي كل 4.5 ثانية مع `useEffect` + `setInterval`.
- عداد صور ديناميكي حسب عرض الشاشة: 1 (موبايل) / 2 (تابلت) / 3 (ديسكتوب).
- dots indicator في الأسفل.
- يُوقّف مؤقتًا عند hover.
- `856296a` — feat: testimonials auto-play carousel with dots and pause on hover.

### ٢.١٥ تحسينات PWA
- `apple-touch-icon` و `theme-color: #8B7355` في `index.html`.
- `preconnect` إلى `https://kindly-anaconda-422.convex.cloud` لتسريع الاتصال الأولي.
- `856296a` — feat: PWA meta tags and preconnect.

### ٢.١٦ سطر الت developed في Footer
- يظهر دائمًا (عربي وإنجليزي): **"Developed & Designed by Ali Joma"**
- أيقونة بريد إلكتروني (`mailto:abo3dam@gmail.com`) + أيقونة واتساب (`https://wa.me/963933178794`).
- `3deeba9` — feat: footer credit line with email + WhatsApp icons.

### ٢.١٧ الخطوط العربية — Cairo + El Messiri
- استبدالت Noto Kufi Arabic بـ:
  - **Cairo** — خط جسم عربي احترافي (-body).
  - **El Messiri** — خط عناوين فاخر (headings).
- تحميل عبر `<link>` في `index.html` مع `preconnect` و`display=swap` (بدلاً من CSS `@import` المُعيق للتحمّل).
- تعريف `font-family` في `index.css`:
  - Body: `Inter, Cairo, system-ui, sans-serif`.
  - RTL: `Cairo, Inter, system-ui, sans-serif`.
  - `.font-serif-luxury`: `Playfair Display, El Messiri, Georgia, serif`.
- `cb8466d` — perf: Arabic fonts (Cairo + El Messiri).

### ٢.١٨ إعادة تصميم صفحة 404
- تصميم أنيق بـ glass-elevated card مع خلفية hero gradient.
- أزرار: الرئيسية، الإجراءات، وحجز الاستشارة.
- تلميح: "إن كتبت الرابط يدويًا، تأكد من كتابته بشكل صحيح".
- أنيميشن CSS فقط (بدون framer-motion).
- `cb8466d` — feat: 404 redesign.

### ٢.١٩ content-visibility لتحسين التمرير
- `.cvv` class في `index.css` — `content-visibility: auto; contain-intrinsic-size: auto 800px`.
- مُضاف إلى الأقسام تحت الشاشة في `Landing.tsx`: About, InformationCard, Procedures, BeforeAfter, Testimonials, FAQ, CTA, Contact.
- يمنع المتصفح من إجراء حسابات الرسم/التخطيط على المحتوى غير المرئي حتى يقترب من الشاشة.
- `cb8466d` — perf: content-visibility for below-fold sections.

### ٢.٢٠ تحسين الأداء — إخراج framer-motion من الحزمة الأولى
- `VlyToolbar` حوّل إلى `lazy(() => import(...))` — يُحمّل كسول فقط.
- `AnimatedRoutes` تحوّل من framer-motion إلى CSS fade.
- **النتيجة:**
  - الحزمة الأولى: **469KB → 338KB** (وزن gzip: 147KB → 105KB).
  - **انخفاض 28%** في حجم JS المنفّذ فورًا → يحسّن Time to Interactive.
  - framer-motion يُحمّل كسول فقط حين يحتاجه أي صفحة.
- `cb8466d` — perf: entry chunk -28%.

### ٢.٢١ أيقونات إجرائية معبّرة (قائمة على نوع الإجراء)
- **المشكلة:** الأيقونات السابقة (Lucide عامة مثل `Stethoscope`/`SmilePlus`) لم تكن مرتبطة بنوع العملية (طلب المستخدم: "أريد أيقونات معبّرة تمامًا").
- **المنهج:** سجلّ دلالي مركزي بأسماء معنى + أيقونات SVG مخصصة للفجوات التشريحية (لا وجود لأيقونتي `Nose`/`Face` في lucide-react).
  - `src/convex/procedureIconDefaults.ts` — مصدر حقيقة نقي (بيانات فقط): `PROCEDURE_ICON_KEYS`, `ICON_KEY_BY_SLUG`, `LEGACY_ICON_TO_KEY`, `resolveIconKey()`.
  - `src/lib/procedureIcons.tsx` — `NoseIcon`, `FaceLiftIcon`, `EyelidLiftIcon`, `WaistIcon`, `BreastBase` + تعديلات `plus|minus|lift|liftPlus`، مع Lucide للبقية (`Syringe`=بوتوكس، `Droplet`=فيلر، `Droplets`=شفط دهون، `BicepsFlexed`=شدّ الذراع، `PersonStanding`=شدّ الفخذ، `Bandage`=تعديل الندوب، `Ear`=الأذن البارزة، `Sparkles`=عام).
- **ترتيب الأولوية في العرض:** (1) القيمة المخزنة إن كانت مفتاحًا دلاليًا → (2) المفتاح الافتراضي حسب الـ slug → (3) الاسم القديم legacy → (4) عام. يعمل دون أي تعديل على قاعدة البيانات (حتى بدون زر التطبيع).
- **16 مفتاحًا:** EyelidLift, FaceLift, Rhinoplasty, Liposuction, TummyTuck, Botox, Fillers, ArmLift, ThighLift, BreastAugmentation, BreastReduction, BreastLift, BreastLiftImplants, ScarCorrection, EarCorrection, General.
- **الواجهة:** `Procedures.tsx` + `ProceduresPage.tsx` ترسم الأيقونة حسب `getProcedureIcon(slug, icon)`؛ `ProcedureDetail.tsx` يظهر شارة الأيقونة في الهيرو؛ `Dashboard.tsx`: قائمة الإجراءات تُظهر الأشكال، منتقي الأيقونات بالـ 16 مفتاحًا (شكل + تسمية EN) وقابل للبحث، مع زر **"Normalize Icons"** يستدعي `migrateProcedureIcons` (محمي بـ requireAdmin).
- **نشر:** `npx convex deploy` → `kindly-anaconda-422`. زر التطبيع جاهز للاستخدام من لوحة التحكم (لا يستجيب لـ CLI identity؛ يحتاج جلسة متصفح موثّقة).
- **تحقق:** eslint 0 أخطاء، `tsc -b` و`vite build` ناجحان؛ اختبار render لجميع الأيقونات الـ16 + دقة كل slug عبر `renderToStaticMarkup` (ALL OK).
- `2a4b583` — feat: expressive procedure icons - semantic registry + custom anatomical SVGs.

### ٢.٢٢ صور تجارب المرضى (مصغّرات + متصفّحة Lightbox)
- **المطلوب:** رفع صور لكل تجربة، تظهر كمصغّرات في الشاشة الرئيسية، وعند النقر تُتصفّح + رفع من لوحة التحكم مع تلميح نسبة الأبعاد.
- **البيانات:** حقل جديد `images: v.optional(v.array(v.string()))` في جدول `testimonials` (storageIds) + تمريره في `create`/`update` (`src/convex/testimonials.ts`).
- **لوحة التحكم:** مكوّن `ImageGalleryInput` جديد (`src/components/ImageGalleryInput.tsx`) لرفع عدة صور عبر Convex Storage مع مصغّرات وحذف فردي، وتلميح النسبة: *"تُعرض كمصغّرات في قسم تجارب المرضى ويمكن تصفّحها — يُنصح 4:3 (أفقي) أو 3:4 عمودي؛ تُقصّ تلقائيًا من المنتصف"*. شارة صغيرة في قائمة التجارب تعرض عدد الصور.
- **الواجهة:** `Testimonials.tsx` يعرض شريط مصغّرات (حتى 3 + "+N") داخل بطاقة التجربة، والنقر يفتح `Lightbox` جديدًا (`src/components/Lightbox.tsx`) قابلاً لإعادة الاستخدام — سهمان + عدّاد + Escape/الأسهم + قفل تمرير الصفحة — بنمط Lightbox الموجود في `ProcedureDetail`.
- **نشر:** `npx convex deploy` → `kindly-anaconda-422` (حقل اختياري — بدون حذف فروق).
- **تحقق:** eslint 0 أخطاء، `tsc -b` و`vite build` ناجحان (entry ثابت 338KB).
- **تحديث:** إمكانية **اختيار صور موجودة فعلاً في المكتبة** (Media Library) إضافة إلى رفع صور خاصة — استُخرج `MediaLibraryModal` كمكوّن مشترك (شبكة + بحث + رفع) وأُعيد استخدامه في `MediaSelector` و`ImageGalleryInput`؛ الأخير يضيف زرّ **"From Library"** باختيار متعدد (تبديل) والرفع يُلحق تلقائيًا بالاختيار.
  - `e9d5c9c` — feat: pick patient review photos from existing media library (multi-select) + keep upload option.
- **إصلاح تجميد الموقع عند فتح الصور:** كان `Lightbox` يُركَّب دائمًا و`useState(index)` يلتقط `null` عند أول تركيب، فكان قفل التمرير يعمل بينما الـ modal لا يظهر أبدًا. الحل: `key` بعدّاد يفتح — إعادة تركيب عند كل فتح لمزامنة الفهرس الداخلي.
  - `0c51288` — fix: freeze when opening testimonial photo lightbox.

### ٢.٢٣ SEO موجه جغرافيًا لكل الإجراءات
- **المطلوب:** تعبئة SEO Title/Description (AR + EN) لكل الإجراءات كلّما يراه مناسبًا، مع تسليط الضوء على مواقع العمل: سوريا (دمشق، اللاذقية، طرطوس)، دبي (الإمارات)، بيروت، العراق.
- **المصدر:** `src/convex/procedureSeoDefaults.ts` — عبوءات عنوان ≤ ~63 حرفًا EN و≤ ~55 AR، ووصف ≤ ~160 حرفًا؛ النمط: المنفعة المحددة للإجراء + المدن (دمشق، اللاذقية، طرطوس، دبي، بيروت، العراق) + عبارة حجز الاستشارة.
- **التنفيذ:** دالة migration `migrateProcedureSeo` (محمية بـ requireAdmin) — تملأ الحقول الأربعة لكل إجراء بطريقة idempotent وتحترم أي تعديل يدوي؛ وزر **"Fill SEO (AR/EN)"** في تبويب الإجراءات بلوحة التحكم.
- **نشر:** `npx convex deploy` → `kindly-anaconda-422`. على الأدمن الضغط على الزر لتعبئة الحقول (حماية auth تمنع التشغيل عبر CLI).
- `fc8e906` — feat: geo-targeted SEO titles/descriptions for all procedures.

### ٢.٢٤ الـ Local Business Schema الجغرافي
- **شرح:** JSON-LD من `schema.org` يجعل محركات البحث تقرأ الموقع كـ«كيان طبي محلي» له مواقع فعلية؛ يحدّد الظهور بالبحث المحلي للأسواق المستهدفة ويغذّي Google Business Profile ببيانات متسقة (الاسم/العنوان/الهاتف).
- **التنفيذ:** تحديث schema في `index.html`: `@type: Physician` مع `location` لستّ عيادات (دمشق، اللاذقية، طرطوس، دبي، بيروت، العراق) وأكواد الدول SY/AE/LB/IQ، و`availableService` للإجراءات الستة عشر، وصورة مطلقة.
- **إصلاح مهم:** إزالة `aggregateRating` (5.0/100) المختلق — مخالف لسياسة جوجل ويستوجب عقوبة؛ شُطب ومن ثَمّ جُدّد بدون تقييم. تحقق locale: JSON صالح (6 مواقع، 16 خدمات) والبناء سليم.
- **ملاحظة:** العنوان `addressLocality: Iraq` عام — نصّل مباشرة كلما زوّدتني بالعناوين الدقيقة أو أرقام الهاتف ليطرأ على schema.
- `92856d1` — seo: geo-targeted Physician schema for all 6 practice locations.

### ٢.٢٥ تحديث README
- أُعيدت كتابة `README.md` كليًا ليعكس الحالة الفعلية: نظام الأيقونات الدلالي + Normalize Icons، الـ SEO الجغرافي (fill التلقائي)، معارض صور الشهادات مع Lightbox ومنتقي المكتبة، Physician schema لستّ عيادات، الصفحات/الموديولات الجديدة (ProceduresPage, ContactPage, migration, notifications, http)، أوامر npm مع `CONVEX_DEPLOYMENT` لمفاتيح النشر.
- `5467873` — docs: refresh README to reflect current project state.

### ٢.٢٦ بطاقتان كحد أدنى في الصف بكل الأجهزة
- المطلوب: تقليص حجم الكونتينر/البطاقات بحيث يحتوي صفّان على الأقل في كل الأجهزة (موبايل/تابلت/ويندوز) دون المساس بالسلاسر وتجربة الاستخدام الحالية.
- التنفيذ: أساس شبكات الثلاثة أقسام الرئيسية أصبح `grid-cols-2` بدل عمود واحد على الموبايل (الباقي دون تغيير: ٢/٣/٥ على التابلت والويندوز)؛ كاروسيل الشهادات = `≥1024 ? 3 : 2` مع إبقاء التشغيل التلقائي والنقاط؛ حواشي البطاقات مضغوطة على الموبايل فقط «p-4/gap-3» وعنوان طرز أصغر للاستخدام بلغة ٢-عمودية؛ نفس المعالجة لصفحتَي الإجراءات وقبل/بعد المستقلتين للاتساق.
- التحقق: tsc سليم، eslint 0 أخطاء (٢٦ تحذيرًا كما هي)، البناء نظيف. مرفوع.
- `990393e` — feat: at least 2 cards per row on all devices for procedures/before-after/testimonials.

### ٢.٢٧ لمسات جمالية غير تفاعلية (لا تمس الكاروسيل)
- اختيار الأدمن: لمعة Hover للبطاقات، عمق في الهيرو، شريط تمرير + تحديد مخصص، أنيميشن FAQ أنعم.
- **لمعة البطاقات:** `card-glow` = ظل شمبانيا ناعم + خط ذهبي يشتعل أعلى البطاقة عند التحويم؛ طُبّق على بطاقات الإجراءات/قبل-بعد/الشهادات وصفحتيهما المستقلتين، دون أي تغيير في `scale` أو الظل الأصلي.
- **الهيرو:** توهّجان شعاعيان بدرجات الشمبانيا (يمين علوي/يسار سفلي) بنفس الباراللكس + مؤشر تمرير (فأرة + نقطة نابضة) يظهر على الشاشات المتوسطة فما فوق فقط.
- **الشريط والتحديد:** `::selection` بصبغة ذهبية شفافة؛ شريط التمرير مسارات `#F0E8DE` ومقبض `#C5A882` بحواف دائرية (WebKit).
- **FAQ:** السهم في كبسولة ذهبية تدور 180° بسلاسة وتغمق عند الفتح + تلوين الصف خفيفًا عند التحويم/الفتح؛ `prefers-reduced-motion` ما زال يوقف الحركة عند طلب المستخدم.
- التحقق: tsc، eslint (0 خطأ/26 تحذيرًا)، البناء نظيف.
- `9fef0d4` — style: non-interactive polish — card hover glow, hero depth, theming, FAQ.

### ٢.٢٨ دفعة الجماليات الثانية (لا تمس الكاروسيل)
- اختيار الأدمن: شريط تقدم التمرير، تأثير تحميل الصور، ملمس Grain، تحسين الطباعة، لمعة أزرار CTA.
- **شريط التقدم:** `ScrollProgress` بار ذهبي 3px يمتلئ مع التمرير (rAF بلا framer، pointer-events none، z-70).
- **تحميل الصور:** `ResolvedImage` يُظهر وميضًا متلألئًا (shimmer) أثناء جلب الـ URL بدل الدوار.
- **Grain:** طبقة حبيبات ثابتة شفافية 0.05 وضع soft-light فوق الخلفيات.
- **الطباعة:** تباعد أحرف الأيلبامات، سطر ذهبي متدرج تحت عناوين الأقسام (متمركز/محاذٍ للبداية في FAQ)، `text-pretty` للفقرات.
- **الـ CTA:** ششفرة شفافة تمسح عند التحويم على زر الهيرو وCTA والواتساب وزرّي View All.
- التحقق: tsc سليم، eslint 0 أخطاء، البناء نظيف (حجم الحزمة 339KB). مرفوع.
- `e1a2984` — style: batch-2 polish — scroll progress, image shimmer, grain, type, CTA sheen.

### ٢.٢٩ تقليب قبل/بعد في قسم الرئيسية
- المطلوب: تقليب صورتي قبل وبعد في نفس الإطار بطريقة جمالية سلسة دون أثر على الأداء.
- التنفيذ: `CaseCard` — تُعرض «بعد» افتراضيًا؛ hover يقلب إلى «قبل» على الأجهزة ذات hover، والنقر يبّدل على اللمس؛ تلاشٍ متبادل 700ms مع تكبير بسيط، وشارة العلبة تتبدل + تلميح «قبل/بعد ⇆».
- الأداء: الصورتان lazy، والحركة `opacity/transform` على GPU فقط؛ حجم الحزمة دون تغيير (339KB). صفحة قبل/بعد المستقلة بسلايدرها لم تُمس.
- `8e4046c` — feat: homepage before/after cards crossfade-flip between the two frames.

---

## ٣. قرارات مهمة في هذا السيشن

1. **لا تشغيل أي seed** (`seedAll`/`seedProcedures`/`seedHomepageSettings`) — لأنها تنقضي الإجراءات الأصلية ولا تستعيد الصور/المحتوى الحقيقي؛ المسار الصحيح كان نسخ بيانات Dev.
2. **لا تشغيل `migrateProcedureStructure`** — Production مطابق تمامًا للحالة ما بعد الهجرة، وتشغيلها يرجح no-op آمن (`0 created, 0 updated, already current`)؛ يمكن تشغيلها من لوحة التحكم عند الرغبة في التحقق البصري فقط.
3. **الحفاظ على حساب Admin الحالي** — لم نلمس `users`/`authAccounts` أثناء الاستيراد.
4. **Cairo + El Messiri** بدل Noto Kufi Arabic — خطوط أكثر احترافية و مقروءية.
5. **CSS transitions بدل framer-motion في المسار الأولي** — لتقليل حجم الحزمة المنفّذة فورًا.
6. **VlyToolbar lazy** — أداة Vly تُحمّل كسول لإبقاء framer-motion خارج الحزمة الأولى.
7. **Dynamic Favicon** — يقرأ صورة الـ navbar من doctor settings في Convex تلقائيًا.
8. **Floating social buttons** — تظهر فقط على الصفحات العامة (مخفية على Dashboard/Auth).

---

## ٤. القضايا المفتوحة / الخطوات التالية

- [ ] إنشاء حساب الـ Admin **الثاني** من صفحة التسجيل (مسموح — أول حسابين مديرين).
- [ ] التحقق من أن حسابًا **ثالثًا** يُرفض عند التسجيل.
- [ ] (لاحقًا) ربط النطاق `dr-alhasan.com` في Vercel — حاليًا `000` (غير متاح).
- [ ] النطاق `alhasanalsaiem.com` مُضاف في إعدادات المشروع — يحتاج ربط في Vercel إذا أردنا استخدامه.
- [ ] (تقني) `VLY_CONVEX_AUTH_ISSUER=https://freebuff.com` موجود فقط في `.env.local` المحلي (غير متتبع، dead) — تُنظّف عند الحاجة.

---

## ٥. تفاصيل فنية سريعة (مرجعية)

| عنصر | القيمة |
|---|---|
| Convex Prod (site) | `https://kindly-anaconda-422.convex.cloud` |
| Convex Prod (auth issuer / sitemap) | `https://kindly-anaconda-422.convex.site` |
| Vercel production alias | `https://dralhasan-three.vercel.app` |
| Vercel project | `dralhasan` (`prj_pDSuw5RotHuEwMrdCMWfkILjS9Vu`) |
| Admin الأول | `abo3dam@gmail.com` (role admin — سجّل الدخول بنجاح) |
| Env مضافة على Production | `SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS` (القيم سرّية لا تُطبع) |
| Snapshot المصدر | `/tmp/opencode/convexdump/dev-snapshot.zip` |
| الخطوط | Cairo (Arabic body) + El Messiri (Arabic headings) + Inter (Latin body) + Playfair Display (Latin headings) |
| اللون الرئيسي | `#8B7355` (warm bronze/taupe) |
| النطاق | `alhasanalsaiem.com` |
| الحزمة الأولى | 338KB (gzip: 105KB) — بعد إخراج framer-motion من entry |
| ESLint | 0 أخطاء، 22 تحذيرًا حميدًا |
| أحدث commit | `fc8e906` — feat: geo-targeted SEO titles/descriptions for all procedures |
