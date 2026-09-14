# تقرير وضع المشروع — 14-9-2026

**المستودع:** `abo3dam-hub/alhasan-aesthetics`
**الفرع:** `main` — HEAD: `cb8466d` (شجرة نظيفة، مرفوع لـ GitHub)

---

## ١. ملخص الحالة الحالية

| الجهة | الحالة |
|---|---|
| GitHub `main` | `cb8466d` — متطابق مع فروع العمل، نظيف |
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
| ESLint | 0 أخطاء، 12 تحذيرًا حميدًا |
| أحدث commit | `cb8466d` — perf: Arabic fonts, content-visibility, entry chunk -28%, 404 redesign |
