# FINAL PROJECT HANDOVER AUDIT

**التاريخ:** 2026-09-19
**البيئة:** GitHub Codespaces
**المستودع:** `abo3dam-hub/alhasan-aesthetics`
**الوكيل الجديد:** الوكيل الرئيسي للمشروع
**نوع العمل:** ورقة تسليم (Handover Audit) — فحص فقط، بلا تعديل/commit/deploy.

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

- **البنية:** `src/pages/` تضم 12 صفحة (Landing، Procedures، ProcedureDetail، BlogList،
  BlogArticle، BeforeAfter، Consultation، Contact، Auth، Dashboard، NotFound + مكونات مساعدة).
- **المكونات:** `src/components/` (20 مكوّناً): أقسام الرئيسية، تبويبات dashboard، مكتبة
  shadcn/ui، `ResolvedImage` (مرجع الصور)، `FloatingSocial`، `AnalyticsTracker`، `BrandMark`
  (WebP + `<picture>`)، `ScrollProgress`…
- **الأداء:** كل الصفحات lazy-loaded؛ chunk يدوي في `vite.config.ts` (react-vendor،
  convex-vendor، radix-ui، framer-motion، charts، forms)؛ الحزمة الأولى ≈ **342.22 kB
  (gzip 106.24 kB)** — مطابقة للخط الأساسي الموثق.
- **تحليلات مدمجة** (بلا GA4): `/trackVisit` يسجّل زيارات + أحداث تحويل (WhatsApp/CTA/mشاركة)
  مع تحديد بلد الزائر عبر geolocation مجاني وبدون تخزين IP خام.

### 1.3 Backend (Convex)

- **21 ملفاً في `src/convex/`:** schema، admin، users، procedures، articles، beforeAfter،
  testimonials، faq، homepageSettings، siteSettings، media، analytics، notifications (ميت)،
  migration، seed، procedureIconDefaults، procedureSeoDefaults، og_image، auth/، auth.config، http.
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
- **التقسيم:** 3 تبويبات مجزأة في `src/components/dashboard/` (ArticlesTab,
  HomepageCMSTab, SEOTab)؛ والبقية داخل `Dashboard.tsx` (~2050 سطراً — أكبر من الـ1600 الموثقة).
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
- **ملاحظة:** صفحة `/auth` إنجليزية فقط (لا تستخدم i18n — تحققّت بأنه لا مراجع `useI18n`).

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
| آخر commit | **`f7c85de`** `docs: add Codespaces setup & handover report` |
| آخر تغيير برمجي | **`b842f3c`** `feat: add og:image:alt + article:published_time …` |
| Working tree | `M package-lock.json` (سطر `hasInstallScript` من Prebuild — متفق عليه، بلا commit) |
| الفرع/المزامنة | `main` متزامن مع `origin/main` |
| آخر feature مكتملة | منظومة المشاركة ومعاينات OG (بطاقات 1200×630 + `/og-meta` + edge proxy + أزرار المشاركة + WebP + إصلاحات JSON-LD + `og:image:alt` + `article:published_time`) |
| البنية في Codespaces | dependencies ✅ · postinstall/patch-package ✅ · typecheck ✅ · lint ✅ (0 errors/30 warnings) · build ✅ — لا tests مستقلة حالياً |
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
| TD-1 | **Dashboard.tsx monolith** | `src/pages/Dashboard.tsx` (~2050 سطراً) | قائم (أعلى من الموثق 1600) |
| TD-2 | **بيانات seed مكررة/متباينة** | `src/convex/seed.ts` (`seedAll` vs `seedProcedures` بسلغات مختلفة) | قائم |
| TD-3 | **fallback URL لـConvex مضمّن** | `src/main.tsx:96`, `src/lib/track.ts:11` | جُزئياً حُلّ: أصبح يشير لـ**production** (ليس dev القديم) |
| TD-4 | مفتاح Email-OTP مضمّن | `src/convex/auth/emailOtp.ts` | **حُلّ** — Auth نُقل إلى Password؛ estimator لم يعد موجوداً |
| TD-5 | **تبعيات قد تكون unused** | `hono`, `react-day-picker`, `react-resizable-panels` (resizable غير مستورد) | جُزئي؛ `recharts` و`next-themes` أصبحا مستخدمين فعلاً |
| TD-6 | **ملف ميت** | `src/convex/notifications.ts` (سطر DEPRECATED) | قائم |
| TD-7/11 | **`schemaValidation: false` + لا نظام migrations حقيقي** | `src/convex/schema.ts:182` | قائم (الـ`migration.ts` أداة CMS يدوية) |
| TD-8 | **حقل `media.url` legacy** | جدول `media` | قائم: حلّ مزدوج (storageId + URL قديم) |
| TD-9 | `becomeAdmin` | `src/convex/users.ts` | **حُلّ** — أُلغي مع Password auth (حدّان-admin بدلها) |
| TD-10 | **Auth page إنجليزية** | `src/pages/Auth.tsx` (لا i18n) | قائم |
| — | **BUG-3 (sitemap `active`)** | `src/convex/http.ts:65` | **حُلّ** — الكود يفحص `isActive` |
| — | **BUG-1 (الصور في production)** | وثائق IMAGE-REPORT* | جُزئياً حُلّ: ترميم البيانات + فحص الإنتاج؛ بقي تحقق متصفح سطحي |
| — | BUG-2 (`object-cover`) | كل مكونات الصور | **عمد** (بطلب المالك، انظر الوثائق) |

---

## 4) KNOWN FUTURE WORK

(مصدرها roadmap/تقارير فقط — لم يُنفَّذ منها شيء)

1. **من `report 9-14-26.md` §4 (قائمة مفتوحة):**
   - إنشاء حساب **admin الثاني** من `/auth` (مسموح — أول حسابين أدمن).
   - **التحقق من رفض حساب ثالث** (اختبار حدّان-admin).
   - لاحقاً: ربط `dr-alhasan.com` (حالياً domain 000)، وربط `alhasanalsaiem.com` في Vercel إن رغبنا.
   - نظافة تقنية: إزالة `VLY_CONVEX_AUTH_ISSUER` الميت من `.env.local` القديمة (غير متتبعة).
2. **من الـhandover (توصيات لا فرض):**
   - إضافة **tests** (لا توجد حالياً) و **CI/CD** (لا GitHub Actions).
   - **promoteUser** mutation لإدارة حساب أدمن إضافي (بديل becomeAdmin الملغى).
   - تفعيل `schemaValidation` بعد استقرار الـschema والتحقق من تطابق البيانات.
3. **خطوة مالك فقط:** `npx convex login` قبل أي عمل Convex قادم (codegen/deploy).

---

## 5) RISKS

(موثقة في الوثائق أو مثبتة من الكود فقط — لم أضف مخاطر غير قابلة للإثبات)

1. **Auth بلا rate limiting** على محاولات الدخول المسجلة (Security Audit — الـhandover §25).
2. **XSS عبر `dangerouslySetInnerHTML`** في مواضع JSON-LD (BlogArticlePage:229، Landing:91،
   FAQ:114، ProcedureDetail:530/546) من محتوى CMS بلا تعقيم — مدخلات أدمن فقط، مصنفة Medium.
   (متن المقال نفسه يُعرض كعناصر React بأمان — لا HTML خام.)
3. **`schemaValidation: false`** قد يسمح بانحراف بيانات بين dev/prod.
4. **الوصول الافتراضي للإنتاج:** أي تشغيل محلي بلا `VITE_CONVEX_URL` يتصل بـ**production**
   (fallback مضمّن) — يجب الحذر في أي عمل مستقبلي لا يراد له لمس بيانات حقيقية.
5. **Convex غير معلّق في Codespaces** → أي codegen/deploy قادم متوقف على تسجيل دخول المالك.
6. **إعدادات Vercel/env غير قابلة للفحص من Codespaces** (لا CLI ولا link — موثق Unverified).
7. **npm audit: 12 vulnerabilities** (4 moderate / 6 high / 2 critical) في التبعيات — سابقة ولم تُعالج.
8. **تخزين WhatsApp للمعاينة حسب الرابط** — أي معاينة جديدة تتطلب كسر الكاش (`?v=2`) —
   قيد تشغيلي موثق في `report 9-14-26.md` §5.

---

## 6) RECOMMENDED NEXT STEP

الخطوة التالية **الموثقة** في المشروع — وأُعلن صراحةً أنني **لم أنفّذها**:

> من القائمة المفتوحة في `report 9-14-26.md` §4:

1. تسجيل حساب **admin الثاني** عبر `/auth` (سلوك حدّان-admin).
2. **التحقق من رفض تسجيل حساب ثالث** (تأكيد قيد `MAX_ADMIN_ACCOUNTS = 2` في الإنتاج).

أما أي عمل Convex مستقبلي فيبدأ بتسجيل دخول المالك: `npx convex login`.

---

## 7) الامتثال للقواعد الصارمة

- ❌ لم أعدّل أي ملف (الملف الحالي غير متتبع).
- ❌ لا commit / لا push / لا deploy / لا migration / لا seed.
- ❌ لا تغيير على Convex production أو Vercel.
- ❌ لم أُعد تنفيذ أي feature مكتملة.
- ❌ لم أخترع scope جديد، ولم أسمِّ شيئاً «مشكلة» لمجرد القابلية للتحسين.
- ✅ التقرير مبني على الوثائق + الكود الفعلي فقط.

**الحالة:** جاهز — أنتظر تعليماتك للتطوير القادم.