# تقرير وضع المشروع — محدّث 19-9-2026

**المستودع:** `abo3dam-hub/alhasan-aesthetics`
**الفرع:** `main` — HEAD: `0be1cb1` (نهاية جلسة 18-9) → **`dc29c4e`** (جلسة 19-9، راجع §6)

---

## ١. ملخص الحالة الحالية

| الجهة | الحالة |
|---|---|
| GitHub `main` | `0be1cb1` — متطابق مع فروع العمل، نظيف |
| Convex **Production** | `kindly-anaconda-422` — Auth مفعل، البيانات مستعادة، الكود حالي (بما فيه `/og-image`) |
| Convex **Dev** | `gregarious-perch-128` |
| Vercel `dralhasan` | نشط — **نشر تلقائي** من `main`؛ الاسم المستعار `https://dralhasan-three.vercel.app` والنطاق الحقيقي `dralhasanalsaiem.com` يخدمان نفس build |
| المصادقة | Password (بريد + كلمة مرور) — حد أقصى حسابان إداريان؛ الأول `abo3dam@gmail.com` |
| بيانات CMS | كاملة (جداول CMS + ملفات الـ Storage) |
| التحليلات | مفعلة — زيارات الصفحات وبلدان الزوار (تبويب Analytics في الداشبورد) |
| المدونة | مفعلة — `/blog` و`/blog/:slug` بالعربية والإنجليزية + صورة OG مخصصة عند المشاركة |
| النطاق | **`dralhasanalsaiem.com` متصل فعليًا بـ Vercel ويعمل في الإنتاج** (كل canonical/OG/JSON-LD/sitemap تشير إليه) |


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

### ٢.٣٠ تحديث نص CTA في صفحة قبل/بعد
- استبدال الجملة السفلية إلى: العنوان «تريد ان تشاهد نتائج مشابهة لحالتك؟» والوصف «احجز استشارتك و شاهد مزيد من الحالات المشابهة.» (مع موائمة EN).
- `2e16154` — content: update before/after CTA copy (AR + EN).

### ٢.٣١ تلميح تفاعلي لتقليب صور قبل/بعد
- طلب أدمن: تلميح/أيقونة صغيرة تفاعلية تشجّع على النقر لتقليب الصورة. بُني: واحة دائرية مركزية بأيقونة ⇆ مع حلقة نبض متحركة (تتوقف بعد التقليب)، تستحيل ذهبية عند التحويم، وتسمية «اضغط للقلب / Click to flip» تظهر عند التحويم وتبقى شبه ظاهرة للموبايل.
- `eef8993` — feat: visible flip affordance on homepage before/after cards.

### ٢.٣٢ تعديل تلميح التقليب إلى الطرف السفلي
- بعد الملاحظة أن الواحة المركزية تشوّش على المحتوى: حُذفت، واستُبدلت بشريحة صغيرة أسفل حافة الصورة تحمل «قبل وبعد / Before & After» مع أيقونة أسهم متبادلة تدور عند التحويم وتتوهّج ذهبية كأنها زر.
- `8a02c46` — feat: relocate flip hint to bottom edge as worded pill.

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
- [x] ~~(لاحقًا) ربط النطاق `dr-alhasan.com` في Vercel — حاليًا `000` (غير متاح).~~ → **أُلغي (19-9): لا وجود لنطاق باسم `dr-alhasan.com`** — النطاق الوحيد الفعلي `dralhasanalsaiem.com`.
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
| الحزمة الأولى | 341.78KB (gzip: 106.09KB) |
| ESLint | 0 أخطاء، 26 تحذيرًا حميدًا |
| أحدث commit | `4e2f7b7` — feat: mobile CTA bar, WhatsApp/CTA conversion tracking, drag-compare homepage results |

---

## ٦. جلسة 17-9-2026 — تحليلات الزيارات (Visits & Countries)

### الفكرة
لوحة تحليلات مدمجة داخل Dashboard (تبويب **Analytics**) تُظهر عدد الزيارات والبلدان التي يأتي منها الزوار، دون أي أداة خارجية (GA4/Vercel Analytics) ودون تخزين أي بيانات شخصية.

### البنية
- **جدولان جديدان في `schema.ts`:**
  - `pageVisits` = `{ path, locale?, country?, sessionId?, ts }` بفهرس `by_ts`.
  - `ipCountryCache` = `{ ipHash, country?, expiresAt }` بفهرس `by_ipHash` (كاش 24 ساعة).
- **`src/convex/analytics.ts`:**
  - `insertVisit` (mutation عام) — يسجّل الزيارة.
  - `saveIpCache` / `getIpCache` — كاش البلد لكل IP (الـ IP يُهشَّم ولا يُخزَّن خامًا أبدًا).
  - `getStats` (query عام، بنفس نمط `getMigrationStatus`) — تجميع: الإجمالي/اليوم/٧أيام/٣٠يوم، الجلسات الفريدة، أعلى الصفحات، البلدان، وسلسلة يومية 14 يومًا.
  - `purgePath` (internalMutation) — أداة صيانة لحذف زيارات مسار معيّن (مثل بيانات الاختبار).
- **`src/convex/http.ts`:** مسار `POST /trackVisit` (يُخدَم على `*.convex.site` وليس `.cloud`) مع:
  - استخراج الـ IP من `true-client-ip` / `cf-connecting-ip` / `x-forwarded-for`.
  - تحويل الـ IP إلى رمز بلد ISO-2 عبر `ipwho.is` ثم `ip-api.com` احتياطيًا، مع مهلة 3 ثوانٍ.
  - CORS (POST + OPTIONS) ومسار **OPTIONS** مستقل لاجتياز preflight.
- **المتتبّع في الواجهة:** `src/components/AnalyticsTracker.tsx` — يرسل `fetch` (keepalive, `text/plain` لتجنّب preflight) عند تغيّر المسار، مع `sessionId` في `sessionStorage`، ويستثني `/dashboard` و`/auth`.
- **اللوحة:** تبويب Analytics في `Dashboard.tsx` — 4 بطاقات (الإجمالي/اليوم/٧أيام/الجلسات الفريدة)، مخطط أعمدة لآخر 14 يومًا، قائمة البلدان مع الأعلام والبارات، وأعلى الصفحات.

### التحقق
- `analytics.getStats` أعاد `total` و`countries` صحيحين بعد اختبار `curl` (وُلّد بلد `US`).
- تم حذف صفَّي الاختبار عبر `purgePath` ثم `total = 0`.
- `tsc` نظيف، ESLint 0 أخطاء/26 تحذيرًا، `vite build` أخضر، ونُشر Convex على `kindly-anaconda-422`.

### ملاحظة تشغيلية
- يجب أن يستخدم المتتبّع رابط `VITE_CONVEX_SITE_URL` أو اشتقاقه باستبدال `.convex.cloud` بـ `.convex.site`. في حال عدم ضبط `VITE_CONVEX_SITE_URL` على Vercel، يُشتق تلقائيًا.

---

## ٧. جلسة 17-9-2026 (تكملة) — حزمة التحويل + تحسين قبل/بعد

### أ) حزمة التحويل
- **شريط CTA ثابت في الجوال** (`src/components/MobileCTABar.tsx`): زرّان (اتصل الآن + احجز استشارتك) على كل الصفحات العامة عدا `/dashboard` و`/auth`، مع احترام `safe-area` وإزاحة `padding-bottom` للجسم حتى لا يغطي المحتوى. نُقلت أيقونات `FloatingSocial` للأعلى على الجوال (`bottom-20`) للتفادي التداخل.
- **تتبّع نقرات التحويل:** جدول `analyticsEvents` جديد + `insertEvent`، ومسار `/trackVisit` أصبح يستقبل إما زيارة صفحة أو حدثًا (`type` + `label`). أُنشئ `src/lib/track.ts` (`trackPageView` + `trackEvent`) وربط النقرات في: الهيرو، قسم CTA، زر واتساب العائم، الشريط الجوّال، نموذج الاستشارة، ونموذجا التواصل.
- **اللوحة:** بطاقات تحويل (نقرات واتساب/CTA/الإجمالي) وقائمة **Top actions** ضمن تبويب Analytics.
- **صيانة:** `purgePath` أصبح يحذف الزيارات والأحداث معًا لمسار معيّن.

### ب) تحسين قبل/بعد في الرئيسية
- استُبدل «القلب» في بطاقات الرئيسية بمكوّن **مقارنة بالسحب** (drag-to-compare): مقبض مركزي متحرك، `touch-action: pan-y` للسماح بالتمرير الرأسي، دعم لوحة المفاتيح (الأسهم)، واتجاه RTL/LTR صحيح (الجانب «قبل» يتبع اتجاه اللغة). الحدود مقيّدة 8–92% لإبقاء المقبض ظاهرًا.

### ج) إزالة الشريط السفلي العائم + تدقيق الترجمة الإنكليزية
- **أُزيل `MobileCTABar.tsx`** (شريط «اتصل الآن / احجز استشارتك» السفلي في الجوال) نهائيًا: حُذف المكوّن وتركيبه في `main.tsx`، وأُزيلت إزاحة `padding-bottom` للجسم في `index.css`، وأعيد زر واتساب العائم إلى موضعه السفلي (`bottom-6`).
- **تدقيق الترجمة الإنكليزية** وتصحيح النسخ الحيّ في قاعدة البيانات عبر `seed:polishEnglishCopy` (لا يمس أي نصوص عربية):
  - Hero: زر CTA «Book Your Consultation & Get Pricing»، وشارات الثقة «10+ Years of Experience» و«5,000+ Successful Surgeries» و«Natural, discreet results tailored to each case» و«Honest, realistic expectations from the start».
  - About: تصحيح اسم الطبيب إلى «Dr. Al Hasan Al Saiem» ونقطة إغلاق، و«Years of Experience».
  - Information Card: إصلاح جملة مكسورة كانت تعلّق «…informed.is complete.» وإصلاح خطأ «Alsaiemem»، والعنوان «What Every Woman Considering Cosmetic Surgery Should Know».
- حُدِّثت الافتراضات في `seed.ts` و`en.json` و`migration.ts` لتطابق النسخة المصقولة عند أي seed مستقبلي.

### التحقق
- `/trackVisit` سجّل حدث `whatsapp` بنجاح عبر `curl`، وظهر في `analytics.getStats`، ثم حُذف الحدث التجريبي عبر `purgePath`.
- `tsc` نظيف، ESLint 0 أخطاء/26 تحذيرًا، `vite build` أخضر، ونُشر Convex على `kindly-anaconda-422`.

---

## ٣. المقالات / المدونة (Blog Articles) — سيشن 2026-09-18

### ما تم بناؤه
- **الجدول** `articles` في `schema.ts`: `slug` فريد، عناوين/مقتطفات/أجسام ثنائية اللغة (AR/EN)، `coverImage` و`ogImage` (من مكتبة الوسائط)، `categoryAr/categoryEn`، `relatedProcedureSlug` (ربط إجراء ذي صلة)، حقول SEO AR/EN، `publishDate/updatedDate/readingMinutes`، أعلام `isPublished/isFeatured` و`order`، مع فهرس `by_slug` و`by_order`.
- **`src/convex/articles.ts`**: `list` و`listPublished` (المنشورات فقط، الأحدث أولًا) و`getBySlug` و`getById` و`create/update/remove` — جميع الكتابات محمية بـ `requireAdmin()`.
- **Seed إداري منشور:** `seed.seedArticles` أنشأ مقالين ثنائيي اللغة («كم تدوم عملية شد الوجه؟» و«متى يظهر الشكل النهائي لتجميل الأنف؟») في قاعدة الإنتاج؛ idempotent ولا يعيد كتابة تعديلات العيادة.

### الواجهة العامة
- **`/blog` (BlogListPage.tsx):** بطاقة مميزة + شبكة بطاقات (صورة الغلاف عبر `ResolvedImage`، التصنيف، العنوان، المقتطف، التاريخ + دقائق القراءة)، بدون كسور الحزم (lazy-loaded).
- **`/blog/:slug` (BlogArticlePage.tsx):** SEO ديناميكي (title/description/OG/Twitter)، وسوم `noindex` للمسودات، مخطط **Article JSON-LD** (المؤلف د. الحسن الصايم، التواريخ، اللغة)، عارض جسم يدعم العناوين (`## `), القوائم (`- `) والخط العريض (`**...**`), صلة بمقال ذي صلة، وخانة CTA للاتصال/الحجز إجمالاً من `siteSettings`.
- **sitemap.xml:** يضمّ الآن `/blog` (0.6) وجميع المقالات المنشورة (0.6) — تحقّق مباشر على `kindly-anaconda-422.convex.site/sitemap.xml`.

### لوحة التحكم
- تبويب **Articles** الحادي عشر في Dashboard (`src/components/dashboard/ArticlesTab.tsx`): بحث وتصفية (الكل/المنشورة/مسودات), محرر ثنائي اللغة كامل (عنوان، مدخل، جسم، تصنيف، دقائق القراءة، إجراء ذي صلة، غلاف عبر `MediaSelector`, SEO AR/EN), تبديل نشر/مميز, ترتيب ↑↓, وحذف.
- أضيف رابط «المقالات» (nav.blog) في القائمة العلوية والجوال والـ Footer.

### التحقق
- `tsc -b` نظيف، ESLint 0 أخطاء، `vite build` أخضر (index 106.15 kB gzip).
- نُشر Convex (`--typecheck enable`) وقاعدة البيانات حُدّثت، وتم seed مقالين، وفحص `listPublished`/`getBySlug`، وتأكيد تضمين الروابط في sitemap الحيّ.

### د) إصلاح الدومين الفعلي
- **الدومين الحقيقي للنشر هو `dralhasanalsaiem.com`** (مؤكّد من علياس Vercel) وليس `dr-alhasan.com` (دومين بلا سجل DNS عام).
- استُبدلت كل إشارات `dr-alhasan.com` في الكود والملفات العامّة بـ `dralhasanalsaiem.com`:
  `src/convex/http.ts` (DOMAIN الـ sitemap)، `src/pages/BlogArticlePage.tsx` (رابط المشاركة/OG/JSON-LD)، `index.html` (canonical + OG + Physician schema + البريد)، `public/sitemap.xml`، `public/robots.txt`، افتراضيات `seed.ts` (canonicalBase + البريد)، `SEOTab.tsx`، واردة البريد الاحتياطي في `Footer.tsx`/`Contact.tsx`/`ContactPage.tsx`.
- تحقّق مباشر: `https://dralhasanalsaiem.com/blog` يعيد 200.

---

## ٤. جلسة 2026-09-18 (تكملة) — بطاقات OG + أزرار المشاركة + WebP + إصلاح JSON-LD

### ٤.١ مولد بطاقة المشاركة (Branded OG Share Card Generator)
- **الهدف:** عند مشاركة رابط مقال على WhatsApp/Twitter/Facebook/LinkedIn تظهر صورة بطاقة 1200×630 تحمل العلامة (عنوان المقال + المقتطف فوق صورة الغلاف + هوية الموقع)، بدل الصورة الافتراضية.
- **البنية الجديدة:**
  - `src/convex/og_image.tsx` — إجراء Convex من نوع `"use node"` (ليس query): يبنـي SVG عبر **satori** ثم يحوّله إلى PNG عبر **@resvg/resvg-wasm**، ويُضيف صورة الغلاف مع تراكب زجاجي داكن. لا canvas ولا HTML على العميل → صفر layout shift.
  - نقطة HTTP **`/og-image?slug=…&lang=…`** في `src/convex/http.ts` — تُعيد PNG حقيقيًا (200، `image/png`) مع ذاكرة تخزين مؤقت: `Cache-Control: public, max-age=86400, stale-while-revalidate=43200`. عند غياب الغلاف تُستخدم بطاقة بديلة ذات علامة، وعند فشل كل شيء يعود الكود لصورة OG ثابتة.
  - **الخطوط:** تُجلب وقت التشغيل من Google Fonts عبر css2 مع UA من نوع curl (El Messiri 600 + Playfair Display 700) — تعريب عربي سليم في البطاقة.
- **العقدة الحرجة التي عطّلت الشغل — حُلت:** `satori@0.33.4` يتطلب `harfbuzzjs@0.10.0` للـ shaping العربي، وكان محمّل Emscripten فيه يستدعي `fs.readFileSync("/var/task/hb.wasm")` → ENOENT داخل بيئة Convex (لا نظام ملفات).
  - الحل: **patch-package** — `patches/harfbuzzjs+0.10.0.patch` يعدّل المحمل ليجلب `hb.wasm` من `https://cdn.jsdelivr.net/npm/harfbuzzjs@0.10.0/hb.wasm` وقت التشغيل ويمرّره عبر `wasmBinary`. أُضيف `postinstall: patch-package` في `package.json` (لا تحذفه — مهم عند أي `npm install` لاحق).
- **خلل Convex ثانٍ — حُل:** الإجراءات لا تقبل إرجاع `Uint8Array` (رسالة "not a supported Convex type")؛ صارت الدالة تعيد/تخزّن **`ArrayBuffer`** (`rendered.buffer.slice(...)`).

### ٤.٢ غلاف بحث البوتات `/og-meta` (استضافة Vercel edge)
- `middleware.ts` في جذر المشروع: عندما يطلب **بوت** (Twitterbot/WhatsApp/SlackBot/...) صفحة مقال، تُستبدل الاستجابة بـ HTML خفيف فيه `meta[property=og:image]` = `/og-image?slug=…` مع `og:image:width/height` الصحيحتين؛ والمستخدم البشري يستقبل الـ SPA كالمعتاد.
- بهذا تلتقط روابط المقالات صور البطاقة المخصصة عند المشاركة (تحقّق فعلي مباشر على الإنتاج بـ UA `Twitterbot` و`WhatsApp`).

### ٤.٣ أزرار مشاركة
- **بطاقات القائمة (`/blog`):** زر مشاركة `CardShareButton` يوزّع عبر Web Share API على الجوال مع نسخ رابط المقال إلى الحافظة كاحتياط.
- **صفحة المقال:** زر مشاركة العلني مطابق + حدث تحليلات `share` يُرسل عبر نفس `/trackVisit`.

### ٤.٤ أداء الصور — WebP + `<picture>`
- مولّدنا صيغ WebP مضغوطة من الصور الثابتة عبر `sharp` (المولدة إلى `public/assets/*.webp`) مع `BrandMark.tsx` (مكوّن `<picture>` بسقوط JPG/PNG) في: الناف بار، الفوتر، الشعار في المخطط الزمني، وقسم About (مع `srcSet`/`sizes`).

### ٤.٥ إصلاح JSON-LD للشعار
- شعار Organization في توصيف المقالات أصبح يشير إلى `https://dralhasanalsaiem.com/assets/3.jpg` — لتمرير متطلبات Google للشعار في النتائج الغنية.

### التحقق + النشر
- محليًا (بعد إبعاد `hb.wasm`): satori → SVG (34,267 حرفًا، تعريب سليم) → resvg → PNG بصيغة magick سليمة.
- نُشر Convex على `kindly-anaconda-422` (`--typecheck enable`)، وتحقّق بنقطتين: `/og-image` يرجع 1200×630 PNG (AR ≈168 KB، EN ≈179 KB)؛ `/og-meta` معروض لبوتات على النطاق الحقيقي و`og:image` فيه يحمل PNG فعليًا.
- `npx convex typecheck` و`npm run build` وESLint كلها نظيفة. الالتزام والدفع: **`0be1cb1`** (`feat: branded OG card generator, blog card share buttons, WebP assets, JSON-LD logo fix` — 19 ملفًا) → Vercel نشر تلقائيًا، والتحقق من الإنتاج نجح.
- ملاحظة: `CONVEX_SITE_URL` غير مضبوط كمتغير؛ `http.ts` يعتمد على `https://kindly-anaconda-422.convex.site` المضمّن (يعمل وينفع للعناكب).

---

## ٥. جلسة 2026-09-18 (الإصلاح) — صورة المشاركة على WhatsApp

### الشكوى
عند مشاركة رابط مقال الأنف، ظهر **كرت نصّي** بلا صورة (عنوان المقال + اسم الدكتور + عنوان الموقع) — لا غلاف ولا بطاقة ذات العلامة.

### الأسباب الجذرية (اكتُشفت بالقياس البرمجي، لا بالعين)
1. **صورة الغلاف لم تكن مدمجة أصلًا:** `toBase64` في `/og-image` كان يستخدم `Buffer.from(...)` الذي **غير معرّف داخل بيئة HTTP action في Convex** → خطأ `ReferenceError: Buffer is not defined` يُبلع بصمت في الـ catch → تُرسم البطاقة بدون الصورة (أُثبت بمقارنة إنتروبيا بالبكسل: منطقة الصورة في البطاقة stdev≈40 مثل الخلفية المسطحة، بينما الصورة الحقيقية ≈77).
   - **الحل:** مُشفّر Base64 محمول (يدوي، بدون Buffer).
2. **satori كان يرفض البطاقة التي تحوي `<img>`:** `display: flex` غائب عن حاوية الصورة → خطأ `Expected <div> to have explicit "display: flex" ...` → `500 error generating image`.
   - **الحل:** إضافة `display: flex` لحاوية الصورة في `src/convex/og_image.tsx` (أُثبت محليًا عبر إعادة إنتاج بـ satori+resvg ثم بالفحص على الإنتاج).
3. **`og:image` كان على `convex.site` والمسار على نطاق الإنتاج معطّل:** كان `https://dralhasanalsaiem.com/og-image` يُعيد **index.html** (SPA) بدل PNG.
   - **الحل:** `middleware.ts` أصبح يطابق `/og-image` وبروكسي للـ Convex على **نفس أصل الصفحة** (Vercel edge)، مع توجيه `Accept-Language` من الزاحف حتى يعرض العنوان العربي للأجهزة العربية.

### التحقق النهائي (على الإنتاج)
- `curl -A WhatsApp … -H "Accept-Language: ar" /blog/when-does-rhinoplasty-final-result-show` → `og:image = https://dralhasanalsaiem.com/og-image?slug=…` + عنوان عربي.
- نفس رابط الصورة → **HTTP 200, image/png, 1200×630، 477KB**، والغلاف مضمّن فعليًا (stdev المنطقة 69، ألوان 8549 بكسل مميّز — سابقًا ~40/~1270).
- مؤشر K: الالتزام `d49b0c9` (وسط) + الالتزام الحالي لإصلاح Buffer/satori. مصفوفة Convex: `kindly-anaconda-422` محدّثة.
- **ملاحظة تخزين:** WhatsApp يخزّن المعاينة حسب الرابط ولا يعيد جلبها فورًا. لمشاهدة المعاينة الجديدة فورًا: شارك الرابط مع إضافة معامل، مثل `https://dralhasanalsaiem.com/blog/when-does-rhinoplasty-final-result-show?v=2` (أو رابط مختصر جديد) — زر التجربة الرسمي يعيد جلب OG.

---

## ٦. جلسة 2026-09-19 — تسليم Codespaces + إغلاق بند الأدمن + مراجعة التقارير + Refactor الداشبورد

### ٦.١ إعداد Codespaces وحالة التحقق
- إعداد كامل (npm / patch-package / env / فحص قراءة-only للتقارير) موثّق في `CODESPACES-SETUP-REPORT.md`؛ فحص الحالة: `tsc` نظيف، ESLint 0 أخطاء (~30 تحذيرًا سابقًا)، build أخضر، الالتزام `f7c85de`.
- جولة تدقيق شاملة (قراءة-only) → `PROJECT-HANDOVER-AUDIT.md` (الالتزام `e2a575b`).

### ٦.٢ إغلاق بند الأدمن نهائيًا
- أنشأ المالك حسابَي admin على Production `kindly-anaconda-422` بنجاح، وعند محاولة إنشاء ثالث ظهرت رسالة الرفض «Registration is closed…» → **حدّان-admin يعمل ذريًا** كما في `src/convex/auth.ts`؛ بذلك أُغلق آخر بند مفتوح من قائمة الجلسات السابقة.

### ٦.٣ مراجعة جميع التقارير
- مراجعة 26 ملف تقرير في المستودع ومطابقتها بالكود الحالي → `REPORTS-AUDIT.md` (الالتزام `df79c19`). الحاصلة: 5 مصادر حقيقة حاليّة، 4 تقارير مرفقة بـ banner تصحيحي، والباقي أرشيف تاريخي.

### ٦.٤ Refactor الداشبورد (إغلاق TD-1)
- `src/pages/Dashboard.tsx` (Monolith ~2050 سطرًا) → shell (~48 سطرًا) يدير auth/active tab/sign-out/layout فقط.
- كل تبويب مكوّن مستقل في `src/components/dashboard/`: `DashboardOverviewTab`، `DashboardAnalyticsTab`، `DashboardProceduresTab` (مع `ProcedureForm`)، `DashboardBeforeAfterTab`، `DashboardTestimonialsTab`، `DashboardFaqTab`، `DashboardSettingsTab`، `DashboardMediaTab` (مع أداة الرفع وكل سلوك storageId/references)؛ إضافة إلى `HomepageCMSTab`/`ArticlesTab`/`SEOTab` السابقين، و`DashboardLayout` + `DashboardNav` + `dashboard-utils.ts` (مشترك `swapOrder`/`OrderableItem`).
- تحقق: `npx tsc -b` نظيف، ESLint 0 أخطاء، build أخضر بنفس حجم الـ entry (342.22KB/gzip 106.24KB). الالتزام الوحيد: **`dc29c4e`** (`refactor: split monolithic dashboard into modular tabs`).

### ٦.٥ تحديث الوثائق المرتبطة
- حدّثت `PROJECT-MASTER-HANDOVER.md` (كتلة CURRENT STATUS + شجرة الملفات + قسم Dashboard + TD-1 + Fragile Areas + Recommended First Investigation)، `PROJECT-HANDOVER-AUDIT.md` (§1.5 + جدول TD)، `REPORTS-AUDIT.md` (تحديثات + §5)، و`README.md` (الشجرة) بما يطابق البنية الجديدة. بند **TD-1** صار **محلولًا**.

### ٦.٦ رفع blockers بيئة العمل (من المالك)
- سجّل المالك الدخول من Codespaces عبر `npx convex login`، وتأكّد في Vercel أن `VITE_CONVEX_URL` = `https://kindly-anaconda-422.convex.cloud`.
- بذلك انتهى آخر بلوكين موثقين (Convex غير معلّق + Vercel env غير قابلة للفحص) — البيئة جاهزة لأي `codegen`/`deploy`/عمل Convex قادم.

### ٦.٧ إصلاحات البند «الصغيرة» + تحديث الوثائق + دفعة k = 21
- **4.1 صورة الطبيب:** مؤكَّد مكتمل أصلًا — `About.tsx:95` يقرأ `aboutCMS.image` عبر `ResolvedImage`، وحقل "Doctor Profile Image" موجود في HomepageCMSTab، والبيانات في Production مضبوطة (`about.image = kg281f7...` — تحقق قراءة-only عبر `npx convex run homepageSettings:getAboutSettings` على `kindly-anaconda-422`). الاستيراد الثابت `/assets/1.jpg` مجرد fallback.
- **4.2 توحيد `resolveUrls`:** في `src/convex/media.ts` يعيد `""` عند فشل الـ storageId (نفس `resolveUrl`) بدل raw storageId كمصدر صورة مكسور. **يحتاج `convex deploy` ليسري على Production.**
- **4.3 تنظيف VLY:** حذف `src/instrumentation.tsx` و`src/lib/vly-integrations.ts`، فك ربط `@vly-ai/integrations` (استيراد `main.tsx` + `vlyPlugin()` في `vite.config.ts` + من `package.json`/`package-lock.json`). بقي `VlyToolbar` كأداة preview. لا بقايا VLY/Freebuff في `src/` سوى إشارة الـtoolbar.
- **4.4 `.env.local` (آخر القائمة):** غير موجود في workspace هذا (مهمَل في `.gitignore`) — لا شيء يُحذف؛ بقي `VLY_CONVEX_AUTH_ISSUER` القديم خارج المستودع بلا أي reference.
- تحقق: `npx tsc -b` نظيف، ESLint 0 أخطاء (30 تحذيرًا كلها سابقة)، build أخضر (الـentry 340.19KB/gzip 105.54KB — أصغر من 342.22 بعد إزالة استيراد VLY). الالتزام: **`502fb6e`** — رُفعت التحديثات ووثّقت في `REPORTS-AUDIT.md` (بعنوان «نفذ البند 4»), `PROJECT-MASTER-HANDOVER.md`, `CODESPACES-SETUP-REPORT.md`.

### ٦.٨ قرارات المالك (بند «اختر لي»)
- **لا نعرب صفحة `/auth`** — بند TD-10 في قائمة المقترحات **أُلغي بقرار المالك** (لا يُنفَّذ).
- **النطاق:** لا وجود لنطاق باسم `dr-alhasan.com`؛ النطاق الوحيد الفعلي هو **`dralhasanalsaiem.com`**. صُحّحت إشارات `dr-alhasan.com` في `PROJECT-HANDOVER-AUDIT.md` و`PROJECT-MASTER-HANDOVER.md` (canonical) و`REPORTS-AUDIT.md` و`report 9-14-26.md` (بند ربط النطاق أُلغي).

### ٦.٩ جلسة إكمال بنود القائمة المتبقية — تحقق نظيف + نشر Convex (2026-09-21)
نفّذت كل البنود المتبقية من قائمة الأمن/المراجعة، وتحقّق كامل ثم نُشر على Convex Prod. **لم يُعمل أي git commit** (بانتظار موافقة المالك).

**التحقق النهائي (كلّه نظيف):**
- `npm run build`: 0 أخطاء TypeScript (entry 340.54 kB / gzip 105.74 kB — مطابق تقريبًا لـ baseline).
- `npm run lint`: **0 أخطاء و0 تحذيرات** (كانت 30 تحذيراً: 4 من الملفات `_generated` أُضيفت إلى `ignores` في `eslint.config.js` لأنها كود مولّد، و26 من قاعدة `react-refresh/only-export-components` التطويرية فقط — عُطّلت بإعداد project لأن المشروع يخلط مكوّنات مع hooks/constants/variants عمداً بأسلوب shadcn؛ صفر تأثير على production).
- `npm audit`: 2 moderate فقط (satori→fflate؛ residual مُوثّقة، لا خادم أرشفة يخدم المحتوى).
- `npm test` (Vitest، جديد): 12 اختبارًا ناجحًا عبر 3 ملفات، + GitHub Actions CI (` .github/workflows/ci.yml`).

**نشر Convex Prod (`kindly-anaconda-422`): نجح.**
- السبب: `@convex-dev/auth@0.0.95` جعل تقييم الوحدات في الخادم يفشل (`evaluate_push 400 InvalidModules … Uncaught fetch failed`) فتعذّر أي push.
- الحل: تثبيت `@convex-dev/auth@0.0.94` (تُنشر بنجاح، وتحمل @auth/core 0.41.3 فتظل الـ criticals مقفلة). `deploy` نجح: `✔ Deployed Convex functions`.
- الدوال الجديدة حيّة على Prod: `loginRateLimit.getLoginStatus` (`{"retryAfterMs":0}`)، `users.listUsers` (تصل لـ requireAdmin وتحتاج جلسة أدمن — متوقع).
- **وسم انتقاد:** سببًا محتملًا لـ «أنواع التخزين القديمة`: صور الـ media في الجدول تحمل `storageId` بالصيغة القديمة `kg…`، لكن المسار الرسمي `getFileUrl` يحوّلها ويُرجع رابط 200 (image/*) لكل القيم (15/15) — إغلاق جزئي لـ BUG-1 من جهة الخادم.

**قرارات/ملاحظات الجلسة:**
- إصلاح أخطاء الـ types اليدوية السابقة: أُلغيت الأنوتيشنات غير الصحيحة في `ProceduresPage`/`ProcedureDetail`/`ConsultationPage` (الاستدلال الأنسب يعمل مع الأنواع المتولّدة)، وأُصلح `DashboardSettingsTab` (استيراد Loader2 + مجال الاسم `name` + guard لـ `users`).
- إعادة إنشاء ملفين بعد حذف عرضي أثناء الفحص: `src/convex/loginRateLimit.ts` و`src/lib/jsonLd.ts` (نفس المحتوى).
- حُذفت أخطاء كثيرة كانت تظهر سابقًا بسبب حالة node_modules غير المتطابقة أثناء الفحص؛ في الحالة المتّسقة نهائيًا لا أخطاء.
- `git status` (غير committed): تعديلات الكود/الوثائق أعلاه + ملفات جديدة (`loginRateLimit.ts`, `jsonLd.ts`, `vitest.config.ts`, `src/lib/__tests__/*`, `.github/workflows/ci.yml`) + حذف (`ui/calendar.tsx`, `ui/resizable.tsx`, `convex/notifications.ts`).

### ٦.١٠ إصلاحات مراجعة خارجية — تقوية التحليلات + إصلاحات Reels (2026-09-23)

مراجعة كود خارجية (كل الفحوص خضراء: `tsc -b`، `eslint`، `vitest` 12/12، `vite build`) اكتشفت وأصلحت:

- **تقوية التحليلات** (`src/convex/analytics.ts`، `src/convex/http.ts`): حُوّلت `insertVisit` و`insertEvent` و`saveIpCache` و`getIpCache` من دوال عامة إلى داخلية (`internal`) — لا تُستدعى إلا من الـ HTTP action الخاص بـ `/trackVisit`؛ وأُضيف `requireAdmin` إلى `getStats`. سابقًا كان بإمكان أي شخص يملك رابط Convex حقن زيارات وهمية أو تسميم كاش الدول.
- **حارس الـ seed** (`src/convex/seed.ts`): كان `guardSeedAccess` يمرّر غير المصدّقين بصمت؛ الآن يرمي خطأً، فالـ seed يتطلب جلسة أدمن.
- **إصلاحات Reels** (`src/components/sections/Videos.tsx`): أُزيل معالج نقر مكرر كان يمنع الإيقاف المؤقت بالنقر؛ وزُامنت حالة الكتم مع عنصر الوسائط.

مؤجّل (يتطلب تغييرًا معماريًا): تقييد محاولات الدخول (`loginRateLimit.ts`) مطبّق حاليًا في واجهة صفحة Auth فقط ويمكن تجاوزه عبر الـ API مباشرة؛ التنفيذ الصحيح يكون من جهة الخادم داخل مزوّد Password في `@convex-dev/auth`.

### ٦.١١ تحسينات الأداء — تسريع التحميل (2026-09-23)

تحسينات على زمن التحميل فقط، دون أي تغيير في التصميم أو الوظائف أو المعمارية:

- **الخطوط محليًا** (`index.html`، `public/fonts/`): أُزيلت stylesheet خطوط Google. تُقدَّم الآن فقط الأوزان المستخدمة فعليًا كملفات woff2 محلية — Inter/Cairo بأوزان 400–700، وPlayfair Display/El Messiri بأوزان 600–700 (دون مائل)؛ مع preload للوجهين الحرِجَين فوق الشاشة. لا طلبات خطوط خارجية بعد الآن.
- **framer-motion ← LazyMotion** (`src/main.tsx` + 19 ملفًا): أصبح الاستيراد `{ m as motion }` مع تغليف الجذر بـ `<LazyMotion features={loadFeatures} strict>` حيث `loadFeatures` تحميل ديناميكي عبر `import()`؛ محرك الأنيميشن (132KB) يُحمَّل الآن كقطعة منفصلة بعد عرض الصفحة وغير موجود ضمن التحميل الأولي إطلاقًا (تُحقق منه في `dist/index.html`). ملاحظة: المحاولة الأولى أبقت استيرادًا ثابتًا لـ `domMax` فقُضي على التأجيل؛ صُحّح ذلك في `804cca6`.
- **تلميحات تحميل الصور:** `fetchpriority="high"` لشعاري أعلى الصفحة (`LogoDropdown.tsx`، `Auth.tsx`)؛ و`loading="lazy"` + `decoding="async"` للمصغّرات تحت الشاشة (`MediaDiagnostics.tsx`، ومصغّرات الأغلفة في `VideoEditor.tsx`).

الفُحوص كلها خضراء: `tsc -b`، `eslint`، `vitest` (12/12)، `vite build`.

### ٦.١٢ تحسينات جمالية وإصلاح وميض الصورة (2026-09-23)

تحسينات بصرية وتجربة استخدام فقط، دون تغيير المعمارية:

- **ظهور عنوان الهيرو كلمةً كلمة** (`src/components/sections/Hero.tsx`): حركة صعود مقنّعة بتأخير متدرج 60ms للكلمة، مع حماية الحروف العربية النازلة من القصّ، وانزلاق لطيف لكتلة النص أثناء التمرير (parallax).
- **ملء الشاشة لقبل/بعد** (`src/components/sections/BeforeAfter.tsx`): استُخرج السلايدر كمكوّن `CompareSlider` قابل لإعادة الاستخدام (سحب بالفأرة واللمس ولوحة المفاتيح، ودعم RTL)؛ زر توسيع عند التحويم يفتح مقارنة كبيرة بملء الشاشة مع إغلاق بزر Escape.
- **قسم إنستغرام** (`src/components/sections/Instagram.tsx`): شبكة 6 صور قبل التذييل مع تكبير عند التحويم وأيقونة إنستغرام، تُدار من لوحة التحكم (Homepage CMS ← إنستغرام: حتى 6 صور + رابط مخصص اختياري + مفتاح إظهار)؛ يظهر shimmer أثناء التحميل ولا يظهر القسم إن لم تُضبط صور.
- **إصلاح وميض صورة الطبيب** (`src/components/sections/About.tsx`): أثناء تحميل إعدادات CMS كانت الصورة الافتراضية المضمّنة تظهر لحظات ثم تُستبدل بصورة اللوحة؛ الآن يظهر shimmer محايد أثناء التحميل.

الفُحوص كلها خضراء: `tsc -b`، `eslint`، `vitest` (12/12)، `vite build`.
