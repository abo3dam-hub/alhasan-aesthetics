# FINAL PROJECT HANDOVER AUDIT

**التاريخ:** 2026-09-19 (تحديث تصحيحي 2026-09-27 — انظر الملاحظة أدناه)
**البيئة:** GitHub Codespaces
**المستودع:** `abo3dam-hub/alhasan-aesthetics`
**الوكيل الجديد:** الوكيل الرئيسي للمشروع
**نوع العمل:** ورقة تسليم (Handover Audit) — فحص فقط، بلا تعديل/commit/deploy.

> **تحديث 2026-09-27 (تصحيح توثيقي فقط):** أُعيد التحقق من كل ادعاء رقمي أدناه مقابل الكود
> الحي (`main` @ `02ef1f5`): `tsc` سليم، ESLint **0/0**، `vitest` **12/12** (3 ملفات)،
> **22** ملفاً في `src/convex/`، **11** صفحة، **13** جدولاً مع `schemaValidation: true`.
> البنود التي تغيّرت منذ 19-9 عُلّمت بـ ✅ أدناه.

> **منهجية الفحص:** مطابقة الوثائق (`README.md`, `PROJECT-MASTER-HANDOVER.md`,
> `CODESPACES-SETUP-REPORT.md`, `report 9-14-26.md`, `CONVEX-DEPLOY-REPORT.md`,
> `VERCEL-DEPLOYMENT-REPORT.txt`, تقارير Auth/OG/Verification) مع **الكود الفعلي**
> في HEAD الحالي. أي تفصيل في الوثائق تعارض مع الكود تم تصحيحه وتوضيحه أدناه.

---

## 1) PROJECT UNDERSTANDING

### 1.1 Architecture (معماري)

```
                    ┌──────────────────────────────────────────────┐
   Bot crawlers ←── │  Vercel Edge (middleware.ts)                  │
   (Twitterbot,     │  · يحوّل /blog/:slug لبوتات → /og-meta shell   │
    WhatsApp…)      │  · يعمل بروكسي لـ /og-image على نفس الأصل      │
                    └───────────────┬──────────────────────────────┘
                                    │ (index.html / dist)
                    ┌───────────────▼──────────────────────────────┐
   الزائر البشري ──→│  SPA: Vite + React 19 + TS (dist/)           │
                    │  React Router v7 · lazy pages · chunking      │
                    └───────────────┬──────────────────────────────┘
                                    │ ConvexReactClient
                    ┌───────────────▼──────────────────────────────┐
                    │  Convex — backend واحد (kindly-anaconda-422) │
                    │  DB · Auth · Storage · HTTP actions · satori │
                    └──────────────────────────────────────────────┘
```

- **Convex هو الـ backend الوحيد** (لا خادم إضافي): قاعدة بيانات، مصادقة، تخزين ملفات،
  دوال HTTP، ومولد بطاقات OG يشتغل كـ node action.
- **Vercel Edge** يعالج طلبات العناكب فقط ويعيد توجيهها إلى `/og-meta` (Convex)، ويخدم
  `/og-image` على نفس أصل الصفحة (حتى لا يرفض سكرابير الاجتماعية رابط صورة على نطاق آخر).
- **الـ state:** React Context (i18n + Convex Auth) فقط؛ لا مكتبة state عامة. البيانات الحية
  تأتي عبر `useQuery` التفاعلية من Convex.
- **الفصل الواضح:** الصفحات العامة غير محمية؛ كل **mutations** الـCMS محمية بـ`requireAdmin()`.

### 1.2 Frontend

- **البنية:** `src/pages/` تضم 11 صفحة (Landing، Procedures، ProcedureDetail، BlogList،
  BlogArticle، BeforeAfter، Consultation، Contact، Auth، Dashboard، NotFound).
- **المكونات:** `src/components/` (20 مكوّناً): أقسام الرئيسية، تبويبات dashboard، مكتبة
  shadcn/ui، `ResolvedImage` (مرجع الصور)، `FloatingSocial`، `AnalyticsTracker`، `BrandMark`
  (WebP + `<picture>`)، `ScrollProgress`…
- **الأداء:** كل الصفحات lazy-loaded؛ chunk يدوي في `vite.config.ts` (react-vendor،
  convex-vendor، radix-ui، framer-motion، charts، forms)؛ الحزمة الأولى ≈ **342.22 kB
  (gzip 106.24 kB)** — مطابقة للخط الأساسي الموثق.
- **تحليلات مدمجة** (بلا GA4): `/trackVisit` يسجّل زيارات + أحداث تحويل (WhatsApp/CTA/mشاركة)
  مع تحديد بلد الزائر عبر geolocation مجاني وبدون تخزين IP خام.

### 1.3 Backend (Convex)

- **22 ملفاً في `src/convex/`:** schema، auth، auth.config، admin، users، procedures، articles، videos، beforeAfter،
  testimonials، faq، homepageSettings، siteSettings، media، analytics، loginRateLimit، migration، seed،
  procedureIconDefaults، procedureSeoDefaults، og_image.tsx، http. (حُذف `notifications.ts`؛ لا يوجد مجلد `auth/`.)
- **`http.ts` يخدم:**
  - `/sitemap.xml` — sitemap حي من CMS (موجود في الكود، يفحص `isActive` سليماً).
  - `/og-meta` — HTML خفيف للعناكب يحمل وسوم OG صحيحة (شمل `og:image:alt` +
    `article:published_time`).
  - `/og-image?slug=…` — PNG 1200×630 براندي (satori → @resvg/resvg-wasm) مع
    `Cache-Control: max-age=86400, stale-while-revalidate=43200`.
  - `/trackVisit` (POST + OPTIONS) — التحليلات، والبلد عبر `ipwho.is` ثم `ip-api.com`.
  - `auth.addHttpRoutes(http)` — يوفر OIDC/JWKS للتحقق من توكنات الدخول الخاصة.
- **`og_image.tsx`:** action من نوع `"use node"` يعيد `ArrayBuffer` (لا `Uint8Array` —
  قيد Convex معروف ومُعالج)، ويستعين بـ `harfbuzzjs` المـ-patched لتحميل wasm من jsDelivr.

### 1.4 Auth

- **النموذج الحالي:** `@convex-dev/auth` مع **Password provider** (email + password،
  scrypt)، لا Email-OTP ولا Anonymous ولا Freebuff federated بعد الآن.
- **التفويض:** `auth.config.ts` يوثّق توكنات التطبيق الذاتية فقط (`domain: CONVEX_SITE_URL`)،
  مع تعليق تحذيري صريح: **لا تحويل إلى `customJwt`** (سيُفشل الدخول صامتاً لغياب `kid`).
- **قيد الأمان المركزي:** `MAX_ADMIN_ACCOUNTS = 2` في `auth.ts` يُطبَّق **ذرياً** داخل
  `createOrUpdateUser`: أول حسابين يُنشآن كأدمن، وأي حساب ثالث يُرفض برسالة
  «Registration is closed».
- **الحماية:** جميع mutations الـCMS عبر `requireAdmin()` من `admin.ts`.
- **سلوك قديم انتهى:** `becomeAdmin`، إرسال OTP عبر Freebuff، `isAnonymous` → كلها غادرت
  المسار النشط (بقايا وثائق تاريخية فقط).

### 1.5 CMS

- **11 تبويب** في `/dashboard`: Overview، Analytics، Homepage CMS، Procedures، Before & After،
  Testimonials، FAQ، Articles، SEO، Settings، Media.
- **التقسيم (Refactored 2026-09-19، commit `dc29c4e`):** كل تبويب مكوّن مستقل في
  `src/components/dashboard/` — `Dashboard*Tab.tsx` ×8 (Overview, Analytics, Procedures،
  Before & After, Testimonials, FAQ, Settings, Media) إضافة إلى `HomepageCMSTab`/`ArticlesTab`/`SEOTab`
  السابقين، مع `DashboardLayout` + `DashboardNav` + helpers مشتركة (`dashboard-utils.ts`).
  `Dashboard.tsx` أصبح shellاً (~48 سطراً) يدير auth/tab state/sign-out فقط.
- **نظام إعدادات عامة:** key/value في جدول `siteSettings`.
- **قواعد العمل الأساسية:** `storageId` هو المرجع القانوني للصور؛ الاستشارات لا تخزّن أي بيانات؛
  كل حقول المحتوى ثنائية AR/EN؛ أقسام الرئيسية قابلة للإظهار/الإخفاء كاملة.

### 1.6 Storage

- **Convex storage** للوسائط؛ السجلات في `media` (storageId + url + meta).
- **القاعدة:** لا بناء يدوي لروابط `api/storage/*` — كل الحل عبر `ctx.storage.getUrl()`
  و`resolveUrl` (الموجودة في `media.ts`).
- **رافعة الحذف الأمنة:** حذف وسيط يتحقق من كل مراجع CMS قبل السماح.

### 1.7 Routing

- **React Router v7** داخل `BrowserRouter` مع `AnimatedRoutes` (transition عبر CSS).
- **الجدول:**
  | المسار | الصفحة | حماية |
  |---|---|---|
  | `/`, `/ar`, `/en` | Landing | عام |
  | `/procedures`, `/procedure/:slug` | Procedures | عام |
  | `/blog`, `/blog/:slug` | Blog | عام |
  | `/before-after`, `/consultation`, `/contact` | عرض | عام |
  | `/auth` | تسجيل الدخول (ينقل إلى `/dashboard`) | عام |
  | `/dashboard` | Admin CMS | `RequireAuth` |
  | `*` | NotFound | عام |
- **استضافة SPA:** `vercel.json` يعيد كتابة كل المسارات غير الساكنة إلى `/index.html`.

### 1.8 i18n

- **النظام:** Context + `localStorage`, الافتراضي عربي؛ يضبط `document.lang` و
  `document.dir` تلقائياً (rtl/ltr).
- **الترجمات:** `ar.json`/`en.json` كاملتان؛ وكل حقول CMS ثنائية.
- **تسلسل السقوط:** حقل CMS → ترجمة i18n → قيمة افتراضية ثابتة.
- **ملاحظة:** صفحة `/auth` ~~إنجليزية فقط~~ → ✅ **ثنائية اللغة بالكامل** (تحقق 2026-09-27: كل النصوص من مفاتيح `admin.auth.*` في `src/locales`).

### 1.9 Deployment

- **Convex Production:** `kindly-anaconda-422` (site: `https://kindly-anaconda-422.convex.site`؛
  HTTP: `https://kindly-anaconda-422.convex.cloud`).
- **Frontend:** Vercel مرتبط بـ `main` (auto-deploy)، Build `npm run build` →
  output `dist`، والنطاق `https://dralhasanalsaiem.com`.
- **Env على المنصة:** `VITE_CONVEX_URL` (والاختياري `VITE_CONVEX_SITE_URL`)؛ الأسرار
  `JWT_PRIVATE_KEY`/`JWKS` مجهَّزة على مستوى deployment/المنصة وليست محلية.
- **الـ fallback المضمّن في الكود** يساوي قيمة production نفسها — فلا توجد فجوة env معطّلة.

---

## 2) CURRENT STATE

| البند | الحالة |
|---|---|
| آخر commit | **`02ef1f5`** `feat: token-gated read-only briefing analytics API (/briefing-analytics)` (تحقق 2026-09-27) |
| آخر تغيير برمجي | **`02ef1f5`** نفسه — نقطة نهاية قراءة فقط للإحاطة الصباحية |
| Working tree | نظيف (`git status` بلا تغييرات قبل جولة التصحيح التوثيقية) |
| الفرع/المزامنة | `main` متزامن مع `origin/main` |
| آخر feature مكتملة | مفتاح API قراءة فقط للإحاطة الصباحية (`GET /briefing-analytics` + `serviceTokens`) — أُضيف بعد منظومة المشاركة/OG وblog وفيديو الرئيسية والتحليلات |
| الحالة الصحية للفحوصات | `tsc` سليم · ESLint 0 أخطاء/0 تحذيرات · `vitest` 12/12 (3 ملفات) · build ✅ (تحقق 2026-09-27) |
| Production status | `https://dralhasanalsaiem.com`/`/blog` → 200؛ `www` → 308 إلى غير www |
| Convex status | prod قابل للوصول (OIDC 200، sitemap 200)؛ **محلياً not logged in**، `.convex/` غير موجود |
| Vercel status | `vercel.json` موجود؛ لا CLI محلي ولا `.vercel` link؛ إعدادات platform غير قابلة للفحص من Codespaces |

**المصادقة على الحالة:** التحقق من `git diff b842f3c..f7c85de` يُظهر إضافة التقرير الوثائقي
فقط (لمسة واحدة) دون أي تغيير كود؛ والـtree لا يحمل أي تغيير كود محلي معلّق.

---

## 3) KNOWN TECHNICAL DEBTS

(من الوثائق، مُصحَّحة ومُطابَقَة مع الكود الحالي)

| # | البند | الدليل / الموقع | الحالة |
|---|---|---|---|
| TD-1 | Dashboard.tsx monolith | `src/pages/Dashboard.tsx` + `src/components/dashboard/` | **حُلّ** (2026-09-19، `dc29c4e`): صار shellاً (~95 سطراً) وكل تبويب مكوّن مستقل؛ السلوك محفوظ (tsc/lint/build خضراء) |
| TD-2 | **بيانات seed مكررة/متباينة** | `src/convex/seed.ts` (`seedAll` vs `seedProcedures` بسلغات مختلفة) | قائم |
| TD-3 | **fallback URL لـConvex مضمّن** | `src/main.tsx:96`, `src/lib/track.ts:11` | جُزئياً حُلّ: أصبح يشير لـ**production** (ليس dev القديم) |
| TD-4 | مفتاح Email-OTP مضمّن | `src/convex/auth/emailOtp.ts` | **حُلّ** — الملف محذوف؛ Auth نُقل إلى Password بالكامل |
| TD-5 | **تبعيات قد تكون unused** | `package.json` | جُزئي؛ `hono`/`react-day-picker`/`react-resizable-panels` غادرت التبعيات (تحقق 2026-09-27)؛ `recharts` و`next-themes` مستخدمان فعلاً؛ `zod` مثبّت لكن بلا أي استيراد في `src/` |
| TD-6 | **ملف ميت** | `src/convex/notifications.ts` | ✅ **حُلّ** (تحقق 2026-09-27) — الملف محذوف من الشجرة |
| TD-7/11 | **`schemaValidation: false` + لا نظام migrations حقيقي** | `src/convex/schema.ts` | ✅ **عُدّل**: `schemaValidation: true` في السكيما الحي (~السطر 201) — ادعاء `false` كان خاطئاً |
| TD-8 | **حقل `media.url` legacy** | جدول `media` | قائم: حلّ مزدوج (storageId + URL قديم) |
| TD-9 | `becomeAdmin` | `src/convex/users.ts` | **حُلّ** — أُلغي مع Password auth؛ `promoteUser` هو البديل (حدّان-admin) |
| TD-10 | **Auth page إنجليزية** | `src/pages/Auth.tsx` | ✅ **حُلّ** (تحقق 2026-09-27): الصفحة ثنائية اللغة بالكامل |
| — | **BUG-3 (sitemap `active`)** | `src/convex/http.ts:65` | **حُلّ** — الكود يفحص `isActive` |
| — | **BUG-1 (الصور في production)** | وثائق IMAGE-REPORT* | جُزئياً حُلّ: ترميم البيانات + فحص الإنتاج؛ بقي تحقق متصفح سطحي |
| — | BUG-2 (`object-cover`) | كل مكونات الصور | **عمد** (بطلب المالك، انظر الوثائق) |

---

## 4) KNOWN FUTURE WORK

(مصدرها roadmap/تقارير فقط — لم يُنفَّذ منها شيء)

1. **من `report 9-14-26.md` §4 (قائمة مفتوحة):**
   - ✅ إنشاء حساب **admin الثاني** — **مُنجز (2026-09-19)** عبر `promoteUser`.
   - ✅ **التحقق من رفض حساب ثالث** — **مُنجز (2026-09-19)**: ظهرت رسالة «Registration is closed» — حدّان-admin يعمل.
   - لاحقاً: ربط `alhasanalsaiem.com` في Vercel إن رغبنا (النطاق الفعلي حاليًا `dralhasanalsaiem.com`؛ **لا يوجد نطاق باسم `dr-alhasan.com`** — أُلغي بقرار المالك 19-9).
   - ~~نظافة تقنية: إزالة `VLY_CONVEX_AUTH_ISSUER` الميت من `.env.local` القديمة (غير متتبعة).~~ → **أُلغي نهائيًا (2026-09-27):** مسار Freebuff/VLY أُزيل كليًا من الكود — لا بقايا تنظّف.
2. **من الـhandover (توصيات لا فرض):**
   - ~~إضافة **tests** (لا توجد حالياً) و **CI/CD** (لا GitHub Actions).~~ → ✅ **موجودان (تحقق 2026-09-27):** `vitest` 12/12 (3 ملفات) + workflow GitHub Actions.
   - ~~**promoteUser** mutation لإدارة حساب أدمن إضافي (بديل becomeAdmin الملغى).~~ → ✅ **موجود** في `src/convex/users.ts` (admin-only، حدّ أدمنَيْن).
   - ~~تفعيل `schemaValidation` بعد استقرار الـschema والتحقق من تطابق البيانات.~~ → ✅ **مفعّل** في `src/convex/schema.ts`.
3. ~~**خطوة مالك فقط:** `npx convex login`~~ → ✅ **منفَّذة (2026-09-19)** — المالك سجّل الدخول من Codespaces وأكّد env على Vercel (`VITE_CONVEX_URL` = `kindly-anaconda-422`). لا بلوك على أي عمل Convex قادم.

---

## 5) RISKS

(موثقة في الوثائق أو مثبتة من الكود فقط — لم أضف مخاطر غير قابلة للإثبات)

1. **حد دخول (rate limiting) على مستوى التطبيق:** `loginRateLimit.ts` يتتبع محاولات الدخول لكل بريد
   (`loginAttempts`) ويُظهر رسالة القفل (15 دقيقة) من `Auth.tsx` — التنفيذ على مستوى الواجهة (يفشل مغلقًا)،
   والحماية الذرية من طرف الخادم ما زالت غير موجودة. (حدُّ الأدمنَيْن نفسه يبقى ذريًا عبر `auth.ts`.)
2. **`dangerouslySetInnerHTML`:** 6 مواضع حقيقية (تحقق 2026-09-27 — لا 4 فقط): 5 منها JSON-LD
   (FAQ.tsx، Landing.tsx، BlogArticlePage.tsx، وموضعان في ProcedureDetail.tsx) تمر كلها عبر
   `safeJsonLd()` (تهرّب `<`)، والسادس كتلة `<style>` داخلية قياسية في `components/ui/chart.tsx`
   (مكوّن shadcn). كل المحتوى مصدره أدمن/كود — مصنفة Medium/منخفضة، لا محتوى زوّار.
3. ~~**`schemaValidation: false`** قد يسمح بانحراف بيانات بين dev/prod.~~ → ✅ **خاطئ/محلول:** القيمة الحية `true`.
4. **الوصول الافتراضي للإنتاج:** أي تشغيل محلي بلا `VITE_CONVEX_URL` يتصل بـ**production**
   (fallback مضمّن) — يجب الحذر في أي عمل مستقبلي لا يراد له لمس بيانات حقيقية.
5. ~~**Convex غير معلّق في Codespaces**~~ → ✅ **حُلّ (2026-09-19):** سجّل المالك الدخول — لا عائق على codegen/deploy.
6. ~~**إعدادات Vercel/env غير قابلة للفحص من Codespaces**~~ → ✅ **حُلّ (2026-09-19):** أكّد المالك من Vercel أن `VITE_CONVEX_URL` = `https://kindly-anaconda-422.convex.cloud`.
7. **npm audit:** الأرقام القديمة (12 ثغرة، 2026-09-19) لم يُعَد التحقق منها اليوم — سجل الـnpm الداخلي يمنع التشغيل في هذه البيئة؛ لا تُعامل كرقم حي.
8. **تخزين WhatsApp للمعاينة حسب الرابط** — أي معاينة جديدة تتطلب كسر الكاش (`?v=2`) —
   قيد تشغيلي موثق في `report 9-14-26.md` §5.

---

## 6) RECOMMENDED NEXT STEP

الخطوة التالية **الموثقة** في المشروع — وأُعلن صراحةً أنني **لم أنفّذها**:

> من القائمة المفتوحة في `report 9-14-26.md` §4:

1. تسجيل حساب **admin الثاني** عبر `/auth` (سلوك حدّان-admin).
2. **التحقق من رفض تسجيل حساب ثالث** (تأكيد قيد `MAX_ADMIN_ACCOUNTS = 2` في الإنتاج).

بند «تسجيل الدخول Convex + تأكيد Vercel env» الذي كان يبدأ به أي عمل قادم — ✅ **مُنفَّذ من المالك (2026-09-19)**، فإنّ البيئة جاهزة لأي codegen/deploy/عمل Convex مستقبلي.

---

## 7) الامتثال للقواعد الصارمة

- ❌ لم أعدّل أي ملف (الملف الحالي غير متتبع).
- ❌ لا commit / لا push / لا deploy / لا migration / لا seed.
- ❌ لا تغيير على Convex production أو Vercel.
- ❌ لم أُعد تنفيذ أي feature مكتملة.
- ❌ لم أخترع scope جديد، ولم أسمِّ شيئاً «مشكلة» لمجرد القابلية للتحسين.
- ✅ التقرير مبني على الوثائق + الكود الفعلي فقط.

**الحالة:** جاهز — أنتظر تعليماتك للتطوير القادم.