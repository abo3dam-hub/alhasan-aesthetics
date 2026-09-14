# تقرير وضع المشروع — 14-9-2026

**المستودع:** `abo3dam-hub/alhasan-aesthetics`
**الفرع:** `main` — HEAD: `5f8533f` (شجرة نظيفة، مرفوع لـ GitHub)

---

## ١. ملخص الحالة الحالية

| الجهة | الحالة |
|---|---|
| GitHub `main` | `5f8533f` — متطابق مع فروع العمل، نظيف |
| Convex **Production** | `kindly-anaconda-422` — Auth مفعّل، البيانات مستعادة، الكود الحكومي حالي |
| Convex **Dev** | `gregarious-perch-128` |
| Vercel `dralhasan` | نشط — الاسم المستعار `https://dralhasan-three.vercel.app` يخدم آخر build |
| المصادقة | حساب Admin واحد `abo3dam@gmail.com` (سجّل الدخول بنجاح) |
| بيانات CMS | كاملة (جداول CMS + ملفات الـ Storage) |

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

### ٢.٥ الفحوصات
- `npm run build` (tsc + Vite) ينجح.
- `convex codegen` أعاد توليد `_generated` **بدون أي diff** — أي أن الكود الحكومي الحالي مطابق لكود HEAD.
- الـ سايت ماب: `https://kindly-anaconda-422.convex.site/sitemap.xml` يشمل الرئيسية + /ar + /en + consultation + before-after + **كل الإجراءات** مع `canonicalBase: https://dr-alhasan.com`.
- كل الصفحات العامة على `dralhasan-three.vercel.app` تعيد 200.
- `migration:getMigrationStatus`: `newProceduresCount: 9`، `oldCombinedStillActive: false`، 3 سجلات قديمة غير فعالة مع `supersededBy`، إجراءان فرعيان نشطان.
- eslint: تم تصفير أخطاء الـ lint بالكامل — من **166 خطأ** إلى **0 أخطاء** (يبقى 14 تحذيرًا حميدًا من `react-refresh/only-export-components` في مكونات shadcn/ui و`main.tsx` وملف vly مولّد). السبب الجذري لأغلب الأخطاء: مكوّن `ResolvedImage` استخدم اسم `ref` المحجوز كـ prop (أخطاء `react-hooks/refs` كاذبة). يُراجع لاحقًا إن لزم.

---

## ٣. قرارات مهمة في هذا السيشن

1. **لا تشغيل أي seed** (`seedAll`/`seedProcedures`/`seedHomepageSettings`) — لأنها تنقضي الإجراءات الأصلية ولا تستعيد الصور/المحتوى الحقيقي؛ المسار الصحيح كان نسخ بيانات Dev.
2. **لا تشغيل `migrateProcedureStructure`** — Production مطابق تمامًا للحالة ما بعد الهجرة، وتشغيلها يرجح no-op آمن (`0 created, 0 updated, already current`)؛ يمكن تشغيلها من لوحة التحكم عند الرغبة في التحقق البصري فقط.
3. **الحفاظ على حساب Admin الحالي** — لم نلمس `users`/`authAccounts` أثناء الاستيراد.

---

## ٤. القضايا المفتوحة / الخطوات التالية

- [ ] إنشاء حساب الـ Admin **الثاني** من صفحة التسجيل (مسموح — أول حسابين مديرين).
- [ ] التحقق من أن حسابًا **ثالثًا** يُرفض عند التسجيل.
- [ ] (لاحقًا) ربط النطاق `dr-alhasan.com` في Vercel — حاليًا `000` (غير متاح).
- [x] (تقني) الدَين: أخطاء eslint السابقة مصفّرة إلى **0** (كانت 166) — تم في commit `df273ca`.
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