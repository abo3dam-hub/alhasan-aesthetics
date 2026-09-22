# REPORTS AUDIT — مراجعة جميع تقارير المستودع

**التاريخ:** 2026-09-19
**المرجع:** HEAD `e2a575b` (الكود آخر تعديله `b842f3c`)

> **تحديث 2026-09-19 (تحقق حي على Production):** تم إنشاء حسابَي admin بنجاح، وعند محاولة
> إنشاء حساب ثالث ظهرت رسالة الرفض («Registration is closed…») — **حدّان-admin يعمل كما هو
> موثق في `src/convex/auth.ts`**. بذلك أُغلق آخر بند مفتوح في قائمة `report 9-14-26.md` §4.
>
> **تحديث 2026-09-19 (Refactor):** `src/pages/Dashboard.tsx` قُسِّم من Monolith (~2050 سطراً) إلى
> shell (~48 سطراً) + مكونات تبويبات مستقلة في `src/components/dashboard/` (commit `dc29c4e`).
> **بند TD-1 حُلّ** — انظر §5 أدناه.
>
> **تحديث 2026-09-22 (فيديوهات Reels):** أُضيف `VIDEO-SECTION-FEATURE-REPORT.md` (مرجع حالي —
> انظر §1، الصف 27). اكتملت جولة تحسين أُدمن الفيديو: pagination + شريط إحصائيات + تحقق فوري من الملف
> + توليد غلاف تلقائي من الفيديو (#4) + إعادة ترتيب بالأزرار وحذف جماعي (#8، عبر `moveVideo`/
> `deleteVideos` في `src/convex/videos.ts`) + الوصف يتبع لغة الواجهة.
**المنهجية:** مراجعة كل ملف تقرير في المستودع (26 ملفاً) ومطابقته مع **الكود الفعلي الحالي** (auth، schema، http، main.tsx، middleware، vercel.json، env) ومع كتلة **"CURRENT STATUS — refreshed 2026-09-18"** في `PROJECT-MASTER-HANDOVER.md`.

---

## 1) فهرس التقارير والتصنيف النهائي

| # | الملف | التاريخ | التصنيف |
|---|---|---|---|
| 1 | `README.md` | محدّث | ✅ **مرجع حالي** |
| 2 | `PROJECT-MASTER-HANDOVER.md` | 12-9 / كتلة حالية 18-9 | ✅ **مرجع حالي** |
| 3 | `CODESPACES-SETUP-REPORT.md` | 19-9 | ✅ **مرجع حالي** |
| 4 | `PROJECT-HANDOVER-AUDIT.md` | 19-9 | ✅ **مرجع حالي** |
| 5 | `report 9-14-26.md` | محدّث إلى 18-9 | ✅ **سجل الجلسات الأخيرة** (الأحدث شمولاً) |
| 6 | `PASSWORD-AUTH-IMPLEMENTATION-REPORT.md` | 13-9 (تحديث 17-9) | 🟡 تاريخي + **banner يصحّح** (نُشر فعلاً) |
| 7 | `PROCEDURES-RESTRUCTURE-IMPLEMENTATION-REPORT.md` | 13-9 | 🟡 دقيق تقريباً حتى اليوم (بنيه `parentSlug` موجودة) |
| 8 | `PRE-DEPLOY-AUDIT.md` | 13-9 (تحديث 17-9) | 🟡 تاريخي + banner يصحّح (حُلّت blockers) |
| 9 | `CONVEX-DEPLOY-REPORT.md` | 13-9 (تحديث 17-9/18-9) | 🟡 تاريخي + banner (نجح النشر لاحقاً) |
| 10 | `AUTH-FREEBUFF-DEPENDENCY-AUDIT-REPORT.md` | 13-9 (تحديث 17-9) | 🟡 أغلبه حُلّ؛ تبقّى تنظيف VLY اختياري |
| 11 | `VERCEL-DEPLOYMENT-REPORT.txt` | 2-9 | 🔴 أغلبه قديم (بدون banner) |
| 12 | `PHASE-7-PRODUCTION-LAUNCH-REPORT.txt` | 2-9 | 🔴 تاريخي (بدون banner) |
| 13 | `PHASE-8-GO-LIVE-REPORT.txt` | 2-9 | 🔴 تاريخي (بدون banner) |
| 14 | `PHASE-6-FINAL-REPORT.txt` | 2-9 | 🔴 تاريخي (أعلن "100%" قبل ميزات لاحقة) |
| 15 | `PHASE-5-FINAL-AUDIT.txt` | 2-9 | 🔴 تاريخي |
| 16 | `PHASE-4-COMPLETION-REPORT.txt` | 2-9 | 🔴 تاريخي |
| 17 | `PHASE-3-FINAL-AUDIT.txt` | 1-9 | 🔴 تاريخي |
| 18 | `AUDIT-REPORT.md` | 1-9 | 🔴 تاريخي (بقي بند واحد صالح) |
| 19 | `PROJECT-UNDERSTANDING-REPORT.md` | 13-9 (تحديث 18-9) | 🟡 شبه حالي (الأسلم للقراءة الحديثة) |
| 20 | `IMAGE-REPORT.md` | 3-9 | 🔴 تاريخي (أُصلحت جذوره) |
| 21 | `IMAGE-REPORT2.md` | 3-9 | 🔴 تاريخي |
| 22 | `IMAGE-REPORT3.md` | 3-9 | 🔴 تاريخي |
| 23 | `FINAL-CMS-VERIFICATION-REPORT.md` | 3-9 | 🔴 تاريخي (قسم Schema صالح) |
| 24 | `CMS-DATA-MAPPING-AUDIT-REPORT.md` | 3-9 | 🟡 فيه ملاحظات تشغيلية ما تزال صالحة |
| 25 | `DATA-SYNC-DIAGNOSIS-REPORT.txt` | 2-9 | 🟡 تشخيص ما زال مناسباً محتملاً |
| 26 | `integrations.md` | بلا تاريخ | 🔴 وثقة VLY قديمة غير موصولة بالكود |
| 27 | `VIDEO-SECTION-FEATURE-REPORT.md` | 22-9 | ✅ **مرجع حالي** (قسم الفيديوهات Reels + إدارة الأُدمن) |

> الملاحظة: ملفات المرجع الحالي = **6**، التاريخية المصحوبة بـbanner = **4**،
> التاريخية الخام بلا banner = **13**، وفيها بقايا صالحة = **4** (المجموع 27).

---

## 2) أبرز التعارضات بين التقارير والحالة الفعلية

كل ما يلي ذُكر في تقارير قديمة **ولم يعد مطابقاً للكود الحالي** (يجب تجاهله عند القراءة بدون سياق):

1. **المصادقة:** «Email-OTP + Anonymous + Freebuff federated + `becomeAdmin`»
   → الحقيقي الآن: **Password provider فقط، حدّان-admin ذريان** (`src/convex/auth.ts`)،
   `customJwt` و`VLY_CONVEX_AUTH_ISSUER` أُزيلا نهائياً.
2. **نطاقات/Deployments:** `dr-alhasan.com` (**لا وجود لنطاق بهذا الاسم** — ذُكر كوهمي)، `impartial-ladybug-881`، `gregarious-perch-128`
   → الحقيقي: **`dralhasanalsaiem.com`** وحيداً، و**`kindly-anaconda-422`** هو production.
3. **التوابـل:** «7 جداول» → الحالي **12** (أُضيفت articles, pageVisits, ipCountryCache, analyticsEvents).
4. **الـbuild:** أرقام `bun` القديمة و«Index 461.71 kB» → الحالي npm، entry **≈342.22 kB (gzip 106.24 kB)**.
5. **بند صار خاطئاً نص التاريخ:** `BUG-3` (sitemap `active` بدل `isActive`) → **حُلّ** في `http.ts:65`.
6. **قيد «hero/CTA image fields»** في عدد من التقارير لم يعد قابلاً للاستخدام — عمدي (قاعدة CMS).
7. **`use-upload.ts`** كان يبني `url` بالطريقة اليدوية → الآن يخزّن `url: ""` ويعتمد storageId فقط.
8. **`VITE_CONVEX_SITE_URL` "غير مستخدم"** (VERCEL report) → يُستخدم الآن في `middleware.ts:22` (اختياري).

---

## 3) التقارير الأكثر عرضة للتضليل (اقرأها بحذر)

| الملف | سبب الحذر |
|---|---|
| `PHASE-7-PRODUCTION-LAUNCH-REPORT.txt` | يعرض خطوات مالكة (deploy/seed/domain) **نُفّذت كلها** لاحقاً؛ auth/domain/توابـل قديمة بلا banner |
| `PHASE-8-GO-LIVE-REPORT.txt` | نفس ما سبق + sitemap موصوفة كساكنة فقط |
| `PHASE-6-FINAL-REPORT.txt` | أعلن «مكتمل 100%» قبل blog/OG/analytics/Password، وبقي خطأ sitemap غير مكتشف وقتها |
| `IMAGE-REPORT*.md` الثلاثة + `FINAL-CMS-VERIFICATION` | كلها عن بنية الصور القديمة؛ بنية storageId/resolveUrl حُلّت بعدها |
| `integrations.md` | تشرح تشغيل ميزات VLY غير موصولة أصلاً في الكود |

---

## 4) النقاط التي ما تزال صالحة/قابلة للتنفيذ (من التقارير)

من «بقايا» التقارير (لا من التخمين) — بلا تنفيذ حتى الآن:

1. ~~**من `CONVEX-DEPLOY-REPORT`:** المالك يجب أن ينفّذ `npx convex login`~~ → ✅ **منفَّذ (2026-09-19):** المالك سجّل الدخول من Codespaces — أي `codegen`/`deploy` قادم غير محجوب.
2. ~~**من `VERCEL-DEPLOYMENT-REPORT`:** `VITE_CONVEX_URL`~~ → ✅ **مؤكَّد (2026-09-19):** المالك تحقّق في Vercel أن `VITE_CONVEX_URL` = `https://kindly-anaconda-422.convex.cloud` (ارتفع بند Unverified).
3. **من `CMS-DATA-MAPPING-AUDIT`:** زر **Seed** على Production لم يُنفَّذ عمداً (لا تلمس data حقيقية)؛
   أزرار "Seed Settings"/"Full" للعمليات الجديدة فقط بالوثائق.
4. ~~**من `AUTH-FREEBUFF-AUDIT`:** التنظيف الاختياري المتبقي~~ → ✅ **نُفِّذ (2026-09-19):** حُذف `src/instrumentation.tsx` و`src/lib/vly-integrations.ts`، وفُكّ ربط `@vly-ai/integrations` (استيراد `main.tsx` + `vlyPlugin()` في `vite.config.ts` + التبعية من `package.json`/`package-lock.json`). بقي `VlyToolbar` (`vly-toolbar-readonly.tsx`) كأداة preview فقط. الصفر VLY/Freebuff في `src/` غير إشارة الـtoolbar.
5. ~~**من `CMS-DATA-MAPPING` / `DATA-SYNC`:** حقل `about.doctorImage`~~ → ✅ **مؤكَّد مكتمل (2026-09-19):** `About.tsx:95` يعرض `aboutCMS.image` عبر `ResolvedImage`، وواجهة HomepageCMSTab فيها حقل "Doctor Profile Image"، و**البيانات في Production مضبوطة** (`about.image = kg281f7...` — تحقق قراءة-only عبر `npx convex run`). الاستيراد الثابت `/assets/1.jpg` هو fallback عند غياب الصورة فقط.
6. **من `VERCEL`:** قائمة المسارات في `vercel.json` لم تعد تحوي `/procedures`, `/contact`, `/blog/:slug`
   في جداول الوثيقة فقط (الملف الفعلي سليم — SPA rewrite عام).
7. **النشر على Convex Production** → ✅ **منفَّذ (2026-09-21):** `deploy` نجح على
   `kindly-anaconda-422` (كل دوال الأمن/الـ loginRateLimit/listUsers/promoteUser + schema الجديد حيّة).
   - **قيد الإصدار:** `@convex-dev/auth` مُثبَّت **عند `0.0.94` تحديداً** — الإصدار `0.0.95` يجعل تقييم
     الوحدات على الخادم يفشل (`evaluate_push 400 InvalidModules … Uncaught fetch failed`) فتُرفض كل عمليات push؛
     لا ترفع الإصدار قبل التجربة على نسخة قابلة للنشر.
   - **Residual معتمَد:** `npm audit` عند **2 moderate** (satori→fflate؛ لا مسار وصول للمحتوى المُرفع) —
     الـ criticals في @auth/core أُغلقت (المُثبَّت 0.41.3).
8. **اختبارات + CI** → ✅ **مضاف (2026-09-21):** `npm test` (Vitest، 12 اختباراً/3 ملفات) +
   `.github/workflows/ci.yml` (typecheck/lint/test/build على push وPR).

---

## 5) ملاحظات دقيقة رصدتها المراجعة (فروق بين الوثائق والكود)

- `resolveUrls` (مجمّع الروابط) في `src/convex/media.ts` كان يعيد **raw storageId** عند الفشل بينما
  `resolveUrl` الفردي يعيد `""` — ~~فرق سلوكي محتمل~~ → ✅ **حُلّ (2026-09-19):** وحّدنا السلوك، `resolveUrls`
  يعيد الآن `""` لنفس مسار فشل الـ storageId (يُعرض fallback «بدون صورة» بدل src مكسور). → ✅ **نُشر (2026-09-21)** على Production، ويُضاف إليه أن جميع الروابط المخزنة (الصيغة القديمة `kg…`) تحلّ بنجاح عبر المسار الرسمي (200 image/*، 15/15).
- ~~`Dashboard.tsx` monolith (~2050 سطراً)~~ → **حُلّ (2026-09-19، `dc29c4e`):** الملف صار shellاً
  (~48 سطراً) وكل تبويب مكوّن مستقل في `src/components/dashboard/` (`Dashboard*Tab.tsx` +
  `DashboardLayout`/`DashboardNav`/`dashboard-utils.ts`)؛ الملاحظة القديمة أعلاه صارت تاريخية.
- صفحة `/auth` إنجليزية دائماً (بند TD-10 قائم، تحقّقنا: لا i18n في `Auth.tsx`).

---

## 6) الخلاصة

- **مصادر الحقيقة للوضع الحالي (5 ملفات):** `README.md`، `PROJECT-MASTER-HANDOVER.md`
  (كتلة التحديث 18-9 هي الأعلى سلطة)، `CODESPACES-SETUP-REPORT.md`، `PROJECT-HANDOVER-AUDIT.md`،
  و`report 9-14-26.md` لسجل الجلسات.
- **التقارير التاريخية (17+ ملفاً):** يُنصح بمعاملتها كأرشيف فقط؛ لا تُبنى عليها قرارات تخص الحالة الحالية.
- **لا يوجد تناقض حالي يمنع التطوير**؛ الـblockers السابقة (أمور مالك فقط: `convex login`، فحص Vercel env)
  ~~أُغلقت~~ → ✅ **مؤكَّدة من المالك (2026-09-19):** تم تسجيل الدخول من Codespaces + تأكيد `VITE_CONVEX_URL` على Vercel.
- **لا يوجد عمل «مفقود»**: التفاصيل التي بدت ناقصة في التقارير القديمة حُلّت في جلسات لاحقة موثقة
  بتقارير أحدث أو بالكود نفسه (مطابق للتأكيد الأصلي عن Recovery Audit).