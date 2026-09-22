import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminText } from "@/hooks/use-admin-text";
import { ChevronDown, ChevronUp, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MediaSelector } from "@/components/MediaSelector";
import VideoSectionEditor from "./VideoEditor";

interface TrustBadge {
  labelAr: string;
  labelEn: string;
  icon: string;
  enabled: boolean;
}

interface AboutStat {
  icon: string;
  value: string;
  labelAr: string;
  labelEn: string;
  enabled: boolean;
}

interface HeroFormFields {
  badgeAr: string;
  badgeEn: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  ctaTextAr: string;
  ctaTextEn: string;
  ctaSecondaryTextAr: string;
  ctaSecondaryTextEn: string;
  badgeEnabled: boolean;
  ctaEnabled: boolean;
  ctaSecondaryEnabled: boolean;
  trustBadges: TrustBadge[];
}

interface AboutFormFields {
  badgeAr: string;
  badgeEn: string;
  titleAr: string;
  titleEn: string;
  titleHighlightAr: string;
  titleHighlightEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string;
  stats: AboutStat[];
}

interface CTAFormFields {
  enabled: boolean;
  badgeAr: string;
  badgeEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  buttonTextAr: string;
  buttonTextEn: string;
  buttonEnabled: boolean;
  buttonDestination: string;
}

export default function HomepageCMSTab() {
  const admin = useAdminText();
  const [activeSection, setActiveSection] = useState<string | null>("hero");

  const sections = [
    { key: "hero", label: admin.homepage.hero },
    { key: "about", label: admin.homepage.about },
    { key: "information-card", label: admin.homepage.informationCard },
    { key: "videos", label: admin.homepage.videosTitle },
    { key: "procedures-header", label: admin.homepage.proceduresHeader },
    { key: "beforeAfter-header", label: admin.homepage.beforeAfterHeader },
    { key: "testimonials-header", label: admin.homepage.testimonialsHeader },
    { key: "faq-header", label: admin.homepage.faqHeader },
    { key: "cta", label: admin.homepage.cta },
    { key: "footer", label: admin.homepage.footer },
    { key: "instagram", label: admin.homepage.instagram },
    { key: "visibility", label: admin.homepage.visibility },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{admin.homepage.title}</h2>
      <p className="text-sm text-muted-foreground">{admin.homepage.subtitle}</p>

      {sections.map((section) => (
        <div key={section.key}>
          <button
            onClick={() => setActiveSection(activeSection === section.key ? null : section.key)}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-border/60 hover:bg-muted/50 transition-colors"
          >
            <span className="font-medium text-foreground">{section.label}</span>
            {activeSection === section.key ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {activeSection === section.key && (
            <div className="mt-2">
              {section.key === "hero" && <HeroEditor />}
              {section.key === "about" && <AboutEditor />}
              {section.key === "information-card" && (
                <ErrorBoundary fallback={<div className="p-4 rounded-xl border border-border/60 text-sm text-muted-foreground">{admin.homepage.relatedNote}</div>}>
                  <InformationCardEditor />
                </ErrorBoundary>
              )}
              {section.key === "videos" && (
                <div className="space-y-4">
                  <SectionHeaderEditor sectionKey="videoSection" label={admin.homepage.videosTitle} fallbackKeys={{ badge: "videos.badge", title: "videos.title", titleHighlight: "videos.titleHighlight", subtitle: "videos.subtitle" }} />
                  <VideoSectionEditor />
                </div>
              )}
              {section.key === "procedures-header" && <SectionHeaderEditor sectionKey="proceduresSection" label={admin.nav.procedures} fallbackKeys={{ badge: "procedures.badge", title: "procedures.title", titleHighlight: "procedures.titleHighlight", subtitle: "procedures.subtitle" }} />}
              {section.key === "beforeAfter-header" && <SectionHeaderEditor sectionKey="beforeAfterSection" label={admin.nav.beforeAfter} fallbackKeys={{ badge: "beforeAfter.badge", title: "beforeAfter.title", titleHighlight: "beforeAfter.titleHighlight", subtitle: "beforeAfter.subtitle" }} />}
              {section.key === "testimonials-header" && <SectionHeaderEditor sectionKey="testimonialsSection" label={admin.nav.testimonials} fallbackKeys={{ badge: "testimonials.badge", title: "testimonials.title", titleHighlight: "testimonials.titleHighlight", subtitle: "testimonials.subtitle" }} />}
              {section.key === "faq-header" && <SectionHeaderEditor sectionKey="faqSection" label={admin.nav.faq} fallbackKeys={{ badge: "faq.badge", title: "faq.title", titleHighlight: "faq.titleHighlight", subtitle: "faq.subtitle" }} />}
              {section.key === "cta" && <CTAEditor />}
              {section.key === "footer" && <FooterEditor />}
              {section.key === "instagram" && <InstagramEditor />}
              {section.key === "visibility" && <VisibilityEditor />}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Hero Editor ───
function HeroEditor() {
  const admin = useAdminText();
  const heroCMS = useQuery(api.homepageSettings.getHeroSettings);
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<HeroFormFields>({} as HeroFormFields);
  const [initialized, setInitialized] = useState(false);

  if (heroCMS && !initialized) {
    setForm({
      badgeAr: heroCMS.badgeAr || "",
      badgeEn: heroCMS.badgeEn || "",
      titleAr: heroCMS.titleAr || "",
      titleEn: heroCMS.titleEn || "",
      subtitleAr: heroCMS.subtitleAr || "",
      subtitleEn: heroCMS.subtitleEn || "",
      descriptionAr: heroCMS.descriptionAr || "",
      descriptionEn: heroCMS.descriptionEn || "",
      ctaTextAr: heroCMS.ctaTextAr || "",
      ctaTextEn: heroCMS.ctaTextEn || "",
      ctaSecondaryTextAr: heroCMS.ctaSecondaryTextAr || "",
      ctaSecondaryTextEn: heroCMS.ctaSecondaryTextEn || "",
      badgeEnabled: heroCMS.badgeEnabled !== false,
      ctaEnabled: heroCMS.ctaEnabled !== false,
      ctaSecondaryEnabled: heroCMS.ctaSecondaryEnabled !== false,
      // Hero image fields intentionally unused — Hero section is text/design only
      trustBadges: heroCMS.trustBadges || [
        { labelAr: "+١٥ سنة خبرة", labelEn: "+15 Years Experience", icon: "award", enabled: true },
        { labelAr: "+٥٠٠٠ عملية ناجحة", labelEn: "+5000 Successful Surgeries", icon: "star", enabled: true },
        { labelAr: "نتائج طبيعية ١٠٠٪", labelEn: "100% Natural Results", icon: "sparkles", enabled: true },
      ],
    });
    setInitialized(true);
  }

  const update = (key: keyof HeroFormFields, value: string | boolean | TrustBadge[]) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting({ key: "hero", value: form });
      toast.success(admin.toast.heroSaved);
    } catch {
      toast.error(admin.toast.homepageSaveError);
    }
    setSaving(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">{admin.homepage.hero}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {/* Badge */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">الشارة / التسمية العلوية</Label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.badgeEnabled} onChange={(e) => update("badgeEnabled", e.target.checked)} className="rounded" /> {admin.homepage.enabled}</label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">الشارة (EN)</Label><Input value={form.badgeEn || ""} onChange={(e) => update("badgeEn", e.target.value)} placeholder="Aesthetic & Plastic Surgery" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">الشارة (AR)</Label><Input dir="rtl" value={form.badgeAr || ""} onChange={(e) => update("badgeAr", e.target.value)} placeholder="جراحة تجميلية وتجميلية" /></div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">العنوان الرئيسي</Label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان (EN)</Label><Input value={form.titleEn || ""} onChange={(e) => update("titleEn", e.target.value)} placeholder="Your Beauty Deserves" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان (AR)</Label><Input dir="rtl" value={form.titleAr || ""} onChange={(e) => update("titleAr", e.target.value)} placeholder="جمالك يستحق" /></div>
          </div>
        </div>

        {/* Subtitle / Highlight */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">العنوان الفرعي المميز</Label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان الفرعي (EN)</Label><Input value={form.subtitleEn || ""} onChange={(e) => update("subtitleEn", e.target.value)} placeholder="The Finest Care" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان الفرعي (AR)</Label><Input dir="rtl" value={form.subtitleAr || ""} onChange={(e) => update("subtitleAr", e.target.value)} placeholder="أرقى العناية" /></div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">الوصف</Label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">الوصف (EN)</Label><Textarea rows={2} value={form.descriptionEn || ""} onChange={(e) => update("descriptionEn", e.target.value)} placeholder="We bring your vision to life..." /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">الوصف (AR)</Label><Textarea dir="rtl" rows={2} value={form.descriptionAr || ""} onChange={(e) => update("descriptionAr", e.target.value)} placeholder="نحول رؤيتك إلى واقع..." /></div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">زر الحجز الرئيسي</Label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.ctaEnabled} onChange={(e) => update("ctaEnabled", e.target.checked)} className="rounded" /> {admin.homepage.enabled}</label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">نص الزر (EN)</Label><Input value={form.ctaTextEn || ""} onChange={(e) => update("ctaTextEn", e.target.value)} placeholder="Book Your Consultation" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">نص الزر (AR)</Label><Input dir="rtl" value={form.ctaTextAr || ""} onChange={(e) => update("ctaTextAr", e.target.value)} placeholder="احجز استشارتك" /></div>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">زر الحجز الثانوي</Label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.ctaSecondaryEnabled} onChange={(e) => update("ctaSecondaryEnabled", e.target.checked)} className="rounded" /> {admin.homepage.enabled}</label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">نص الزر (EN)</Label><Input value={form.ctaSecondaryTextEn || ""} onChange={(e) => update("ctaSecondaryTextEn", e.target.value)} placeholder="Explore Procedures" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">نص الزر (AR)</Label><Input dir="rtl" value={form.ctaSecondaryTextAr || ""} onChange={(e) => update("ctaSecondaryTextAr", e.target.value)} placeholder="استكشف الإجراءات" /></div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">شارات الثقة</Label>
          {(form.trustBadges || []).map((badge, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
              <div className="space-y-1"><Label className="text-xs">EN</Label><Input value={badge.labelEn} onChange={(e) => {
                const badges = [...form.trustBadges]; badges[i] = { ...badges[i], labelEn: e.target.value }; update("trustBadges", badges);
              }} /></div>
              <div className="space-y-1"><Label className="text-xs">AR</Label><Input dir="rtl" value={badge.labelAr} onChange={(e) => {
                const badges = [...form.trustBadges]; badges[i] = { ...badges[i], labelAr: e.target.value }; update("trustBadges", badges);
              }} /></div>
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={badge.enabled !== false} onChange={(e) => {
                const badges = [...form.trustBadges]; badges[i] = { ...badges[i], enabled: e.target.checked }; update("trustBadges", badges);
              }} className="rounded" /> {admin.homepage.enabled}</label>
              <button type="button" onClick={() => {
                const badges = form.trustBadges.filter((_, j) => j !== i); update("trustBadges", badges);
              }} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => {
            update("trustBadges", [...(form.trustBadges || []), { labelAr: "", labelEn: "", icon: "award", enabled: true }]);
          }} className="gap-1"><Plus className="h-3 w-3" /> {admin.common.add} شارة</Button>
        </div>

        {/* Hero Image — INTENTIONALLY UNUSED: Hero section is text/design only, no image rendered */}

        <div className="flex justify-end" role="status" aria-live="polite">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? admin.common.saving : admin.homepage.saveHero}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── About Editor ───
function AboutEditor() {
  const admin = useAdminText();
  const aboutCMS = useQuery(api.homepageSettings.getAboutSettings);
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AboutFormFields>({} as AboutFormFields);
  const [initialized, setInitialized] = useState(false);

  if (aboutCMS && !initialized) {
    setForm({
      badgeAr: aboutCMS.badgeAr || "", badgeEn: aboutCMS.badgeEn || "",
      titleAr: aboutCMS.titleAr || "", titleEn: aboutCMS.titleEn || "",
      titleHighlightAr: aboutCMS.titleHighlightAr || "", titleHighlightEn: aboutCMS.titleHighlightEn || "",
      descriptionAr: aboutCMS.descriptionAr || "", descriptionEn: aboutCMS.descriptionEn || "",
      image: aboutCMS.image || "",
      stats: aboutCMS.stats || [
        { icon: "clock", value: "15+", labelAr: "سنوات خبرة", labelEn: "Years Experience", enabled: true },
        { icon: "heart", value: "5000+", labelAr: "إجراء ناجح", labelEn: "Successful Procedures", enabled: true },
        { icon: "users", value: "99%", labelAr: "نسبة الرضا", labelEn: "Patient Satisfaction", enabled: true },
        { icon: "award", value: "10+", labelAr: "شهادة دولية", labelEn: "Certifications", enabled: true },
      ],
    });
    setInitialized(true);
  }

  const update = (key: keyof AboutFormFields, value: string | AboutStat[]) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting({ key: "about", value: form });
      toast.success(admin.toast.aboutSaved);
    } catch { toast.error(admin.toast.homepageSaveError); }
    setSaving(false);
  };

  const iconOptions = ["clock", "heart", "users", "award"];

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">{admin.homepage.about}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {/* Badge */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">الشارة (EN)</Label><Input value={form.badgeEn || ""} onChange={(e) => update("badgeEn", e.target.value)} placeholder="About Dr. Al Hasan" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">الشارة (AR)</Label><Input dir="rtl" value={form.badgeAr || ""} onChange={(e) => update("badgeAr", e.target.value)} placeholder="عن الدكتور الحسن" /></div>
        </div>

        {/* Title */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان (EN)</Label><Input value={form.titleEn || ""} onChange={(e) => update("titleEn", e.target.value)} placeholder="Expertise That Merges" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان (AR)</Label><Input dir="rtl" value={form.titleAr || ""} onChange={(e) => update("titleAr", e.target.value)} placeholder="خبرة تجمع بين" /></div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان المميز (EN)</Label><Input value={form.titleHighlightEn || ""} onChange={(e) => update("titleHighlightEn", e.target.value)} placeholder="Science & Beauty" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان المميز (AR)</Label><Input dir="rtl" value={form.titleHighlightAr || ""} onChange={(e) => update("titleHighlightAr", e.target.value)} placeholder="العلم والجمال" /></div>
        </div>

        {/* Description */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">الوصف (EN)</Label><Textarea rows={3} value={form.descriptionEn || ""} onChange={(e) => update("descriptionEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">الوصف (AR)</Label><Textarea dir="rtl" rows={3} value={form.descriptionAr || ""} onChange={(e) => update("descriptionAr", e.target.value)} /></div>
        </div>

        {/* Doctor Image */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">صورة الطبيب</Label>
          <MediaSelector value={form.image || ""} onChange={(url) => update("image", url)} label="صورة الطبيب" hint="يُزرع عموديًا 3:4 في قسم «عن الطبيب» بالصفحة الرئيسية — يُنصح صورة عمودية (بورتريه)" />
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">الإحصاءات</Label>
          {(form.stats || []).map((stat, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
              <div className="space-y-1"><Label className="text-xs">القيمة</Label><Input value={stat.value} onChange={(e) => { const s = [...form.stats]; s[i] = { ...s[i], value: e.target.value }; update("stats", s); }} placeholder="15+" /></div>
              <div className="space-y-1"><Label className="text-xs">الأيقونة</Label><select value={stat.icon} onChange={(e) => { const s = [...form.stats]; s[i] = { ...s[i], icon: e.target.value }; update("stats", s); }} className="w-full border border-border/60 rounded-lg px-3 py-2 bg-background text-sm">{iconOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
              <div className="space-y-1"><Label className="text-xs">EN</Label><Input value={stat.labelEn} onChange={(e) => { const s = [...form.stats]; s[i] = { ...s[i], labelEn: e.target.value }; update("stats", s); }} /></div>
              <div className="space-y-1"><Label className="text-xs">AR</Label><Input dir="rtl" value={stat.labelAr} onChange={(e) => { const s = [...form.stats]; s[i] = { ...s[i], labelAr: e.target.value }; update("stats", s); }} /></div>
              <label className="flex items-center gap-1 text-xs pb-1"><input type="checkbox" checked={stat.enabled !== false} onChange={(e) => { const s = [...form.stats]; s[i] = { ...s[i], enabled: e.target.checked }; update("stats", s); }} className="rounded" /> {admin.homepage.enabled}</label>
              <button type="button" onClick={() => update("stats", form.stats.filter((_, j) => j !== i))} className="p-1 text-red-500 hover:bg-red-50 rounded pb-1"><Trash2 className="h-3 w-3" /></button>
              <div className="flex flex-col gap-0.5 pb-1">
                <button type="button" disabled={i === 0} onClick={() => { const s = [...form.stats]; [s[i-1], s[i]] = [s[i], s[i-1]]; update("stats", s); }} className="p-1 text-muted-foreground hover:bg-muted rounded disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                <button type="button" disabled={i === (form.stats?.length ?? 1) - 1} onClick={() => { const s = [...form.stats]; [s[i], s[i+1]] = [s[i+1], s[i]]; update("stats", s); }} className="p-1 text-muted-foreground hover:bg-muted rounded disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => update("stats", [...(form.stats || []), { icon: "award", value: "", labelAr: "", labelEn: "", enabled: true }])} className="gap-1"><Plus className="h-3 w-3" /> {admin.common.add} إحصاء</Button>
        </div>

        <div className="flex justify-end" role="status" aria-live="polite">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? admin.common.saving : admin.homepage.saveAbout}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Information Card Editor ───
interface InformationCardForm {
  enabled: boolean;
  badgeAr: string;
  badgeEn: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  image: string;
  ctaTextAr: string;
  ctaTextEn: string;
  ctaLink: string;
  ctaEnabled: boolean;
}

function InformationCardEditor() {
  const admin = useAdminText();
  const infoCMS = useQuery(api.homepageSettings.getInformationCardSettings);
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InformationCardForm | null>(null);
  const [initialized, setInitialized] = useState(false);

  if (infoCMS && form === null && !initialized) {
    setForm({
      enabled: infoCMS.enabled !== false,
      badgeAr: infoCMS.badgeAr || "",
      badgeEn: infoCMS.badgeEn || "",
      titleAr: infoCMS.titleAr || "",
      titleEn: infoCMS.titleEn || "",
      contentAr: infoCMS.contentAr || "",
      contentEn: infoCMS.contentEn || "",
      image: infoCMS.image || "",
      ctaTextAr: infoCMS.ctaTextAr || "",
      ctaTextEn: infoCMS.ctaTextEn || "",
      ctaLink: infoCMS.ctaLink || "/consultation",
      ctaEnabled: infoCMS.ctaEnabled !== false,
    });
    setInitialized(true);
  }

  const update = (key: keyof InformationCardForm, value: string | boolean) =>
    setForm((p) => (p ? { ...p, [key]: value } : p));

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await setSetting({ key: "informationCard", value: form });
      toast.success(admin.toast.homepageSaved);
    } catch {
      toast.error(admin.toast.homepageSaveError);
    }
    setSaving(false);
  };

  if (!form) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-8 text-center text-muted-foreground text-sm">
          {admin.common.loading}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">{admin.homepage.informationCard}</CardTitle>
        <p className="text-xs text-muted-foreground">{admin.homepage.infoCardNote}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={(e) => update("enabled", e.target.checked)} className="rounded" /> القسم {admin.homepage.enabled}</label>

        <div className="space-y-3">
          <Label className="text-sm font-medium">الشارة / التسمية العلوية</Label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">الشارة (EN)</Label><Input value={form.badgeEn || ""} onChange={(e) => update("badgeEn", e.target.value)} placeholder="Patient Guide" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">الشارة (AR)</Label><Input dir="rtl" value={form.badgeAr || ""} onChange={(e) => update("badgeAr", e.target.value)} placeholder="معلومات مهمة" /></div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">العنوان</Label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان (EN)</Label><Textarea rows={2} value={form.titleEn || ""} onChange={(e) => update("titleEn", e.target.value)} placeholder="Information Every Woman Considering Cosmetic Surgery Should Know" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان (AR)</Label><Textarea dir="rtl" rows={2} value={form.titleAr || ""} onChange={(e) => update("titleAr", e.target.value)} placeholder="معلومات على كل سيدة تنوي إجراء جراحة تجميلية معرفتها" /></div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">محتوى النص</Label>
          <p className="text-xs text-muted-foreground">افصل الفقرات بسطر فارغ.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">المحتوى (EN)</Label><Textarea rows={7} value={form.contentEn || ""} onChange={(e) => update("contentEn", e.target.value)} /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">المحتوى (AR)</Label><Textarea dir="rtl" rows={7} value={form.contentAr || ""} onChange={(e) => update("contentAr", e.target.value)} /></div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">الصورة (اختياري)</Label>
          <MediaSelector value={form.image || ""} onChange={(url) => update("image", url)} label="صورة البطاقة" hint="يُزرع أفقيًا يملأ نصف القسم في الرئيسية — يُنصح 4:3 (أفقي)" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">زر الحجز (Call to Action)</Label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.ctaEnabled} onChange={(e) => update("ctaEnabled", e.target.checked)} className="rounded" /> {admin.homepage.enabled}</label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">نص الزر (EN)</Label><Input value={form.ctaTextEn || ""} onChange={(e) => update("ctaTextEn", e.target.value)} placeholder="Book Your Consultation" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">نص الزر (AR)</Label><Input dir="rtl" value={form.ctaTextAr || ""} onChange={(e) => update("ctaTextAr", e.target.value)} placeholder="احجزي استشارتك" /></div>
          </div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">وجهة الزر</Label><Input value={form.ctaLink || ""} onChange={(e) => update("ctaLink", e.target.value)} placeholder="/consultation" /></div>
        </div>

        <div className="flex justify-end" role="status" aria-live="polite">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? admin.common.saving : admin.homepage.saveInfoCard}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CTA Editor ───
function CTAEditor() {
  const admin = useAdminText();
  const ctaCMS = useQuery(api.homepageSettings.getCTASettings);
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CTAFormFields>({} as CTAFormFields);
  const [initialized, setInitialized] = useState(false);

  if (ctaCMS && !initialized) {
    setForm({
      enabled: ctaCMS.enabled !== false,
      badgeAr: ctaCMS.badgeAr || "", badgeEn: ctaCMS.badgeEn || "",
      titleAr: ctaCMS.titleAr || "", titleEn: ctaCMS.titleEn || "",
      descriptionAr: ctaCMS.descriptionAr || "", descriptionEn: ctaCMS.descriptionEn || "",
      buttonTextAr: ctaCMS.buttonTextAr || "", buttonTextEn: ctaCMS.buttonTextEn || "",
      buttonEnabled: ctaCMS.buttonEnabled !== false,
      buttonDestination: ctaCMS.buttonDestination || "/consultation",
    });
    setInitialized(true);
  }

  const update = (key: keyof CTAFormFields, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting({ key: "cta", value: form });
      toast.success(admin.toast.homepageSaved);
    } catch { toast.error(admin.toast.homepageSaveError); }
    setSaving(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">{admin.homepage.cta}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={(e) => update("enabled", e.target.checked)} className="rounded" /> القسم {admin.homepage.enabled}</label>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">الشارة (EN)</Label><Input value={form.badgeEn || ""} onChange={(e) => update("badgeEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">الشارة (AR)</Label><Input dir="rtl" value={form.badgeAr || ""} onChange={(e) => update("badgeAr", e.target.value)} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان (EN)</Label><Input value={form.titleEn || ""} onChange={(e) => update("titleEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان (AR)</Label><Input dir="rtl" value={form.titleAr || ""} onChange={(e) => update("titleAr", e.target.value)} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">الوصف (EN)</Label><Textarea rows={2} value={form.descriptionEn || ""} onChange={(e) => update("descriptionEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">الوصف (AR)</Label><Textarea dir="rtl" rows={2} value={form.descriptionAr || ""} onChange={(e) => update("descriptionAr", e.target.value)} /></div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">الزر</Label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.buttonEnabled} onChange={(e) => update("buttonEnabled", e.target.checked)} className="rounded" /> {admin.homepage.enabled}</label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">نص الزر (EN)</Label><Input value={form.buttonTextEn || ""} onChange={(e) => update("buttonTextEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">نص الزر (AR)</Label><Input dir="rtl" value={form.buttonTextAr || ""} onChange={(e) => update("buttonTextAr", e.target.value)} /></div>
        </div>
        <div className="space-y-2"><Label className="text-xs text-muted-foreground">وجهة الزر</Label><Input value={form.buttonDestination || ""} onChange={(e) => update("buttonDestination", e.target.value)} placeholder="/consultation" /></div>

        <div className="flex justify-end" role="status" aria-live="polite">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? admin.common.saving : admin.homepage.saveCta}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Footer Editor ───
function FooterEditor() {
  const admin = useAdminText();
  const footerCMS = useQuery(api.homepageSettings.getFooterSettings);
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  if (footerCMS && !initialized) {
    setForm({
      descriptionAr: footerCMS.descriptionAr || "",
      descriptionEn: footerCMS.descriptionEn || "",
    });
    setInitialized(true);
  }

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting({ key: "footer", value: form });
      toast.success(admin.toast.homepageSaved);
    } catch { toast.error(admin.toast.homepageSaveError); }
    setSaving(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">{admin.homepage.footer}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">وصف التذييل (EN)</Label><Textarea rows={3} value={form.descriptionEn || ""} onChange={(e) => update("descriptionEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">وصف التذييل (AR)</Label><Textarea dir="rtl" rows={3} value={form.descriptionAr || ""} onChange={(e) => update("descriptionAr", e.target.value)} /></div>
        </div>
        <p className="text-xs text-muted-foreground">{admin.homepage.relatedNote}</p>
        <div className="flex justify-end" role="status" aria-live="polite">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? admin.common.saving : admin.homepage.saveFooter}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Instagram Editor ───
interface InstagramForm {
  enabled: boolean;
  profileUrl: string;
  images: string[];
}

function InstagramEditor() {
  const admin = useAdminText();
  const sectionCMS = useQuery(api.homepageSettings.getSectionContent, { key: "instagramSection" });
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InstagramForm | null>(null);
  const [initialized, setInitialized] = useState(false);

  if (sectionCMS !== undefined && !initialized) {
    const s = sectionCMS ?? {};
    setForm({
      enabled: s.enabled !== false,
      profileUrl: s.profileUrl || "",
      images: Array.isArray(s.images) ? s.images.slice(0, 6) : [],
    });
    setInitialized(true);
  }

  const update = <K extends keyof InstagramForm>(key: K, value: InstagramForm[K]) =>
    setForm((p) => (p ? { ...p, [key]: value } : p));

  const setImage = (i: number, v: string) => {
    if (!form) return;
    const images = [...form.images];
    images[i] = v;
    update("images", images.filter(Boolean));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await setSetting({ key: "instagramSection", value: form });
      toast.success(admin.toast.homepageSaved);
    } catch { toast.error(admin.toast.homepageSaveError); }
    setSaving(false);
  };

  if (!form) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6"><div className="shimmer h-24 rounded-xl" /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">{admin.homepage.instagram}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => update("enabled", e.target.checked)}
            className="rounded"
          />
          {admin.homepage.sectionEnabled}
        </label>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">رابط إنستغرام (اختياري — يُستخدم رابط الطبيب تلقائيًا إن تُرك فارغًا)</Label>
          <Input
            dir="ltr"
            value={form.profileUrl}
            onChange={(e) => update("profileUrl", e.target.value)}
            placeholder="https://instagram.com/..."
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">الصور (حتى 6 — تظهر في الرئيسية قبل التذييل)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <MediaSelector
                key={i}
                value={form.images[i] || ""}
                onChange={(v) => setImage(i, v)}
                label={`صورة ${i + 1}`}
                hint="مربعة 1:1"
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end" role="status" aria-live="polite">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">
            {saving ? admin.common.saving : admin.homepage.saveInstagram}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Section Header Editor (reusable for Procedures/Testimonials/FAQ/BeforeAfter/Videos) ───
export function SectionHeaderEditor({ sectionKey, label }: { sectionKey: string; label: string; fallbackKeys: { badge: string; title: string; titleHighlight: string; subtitle: string } }) {
  const admin = useAdminText();
  const sectionCMS = useQuery(api.homepageSettings.getSectionContent, { key: sectionKey });
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  if (sectionCMS && !initialized) {
    setForm({
      badgeAr: sectionCMS.badgeAr || "",
      badgeEn: sectionCMS.badgeEn || "",
      titleAr: sectionCMS.titleAr || "",
      titleEn: sectionCMS.titleEn || "",
      titleHighlightAr: sectionCMS.titleHighlightAr || "",
      titleHighlightEn: sectionCMS.titleHighlightEn || "",
      subtitleAr: sectionCMS.subtitleAr || "",
      subtitleEn: sectionCMS.subtitleEn || "",
    });
    setInitialized(true);
  }

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting({ key: sectionKey, value: form });
      toast.success(admin.toast.homepageSaved);
    } catch { toast.error(admin.toast.homepageSaveError); }
    setSaving(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">{label} — عنوان القسم</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">الشارة (EN)</Label><Input value={form.badgeEn || ""} onChange={(e) => update("badgeEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">الشارة (AR)</Label><Input dir="rtl" value={form.badgeAr || ""} onChange={(e) => update("badgeAr", e.target.value)} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان (EN)</Label><Input value={form.titleEn || ""} onChange={(e) => update("titleEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان (AR)</Label><Input dir="rtl" value={form.titleAr || ""} onChange={(e) => update("titleAr", e.target.value)} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان المميز (EN)</Label><Input value={form.titleHighlightEn || ""} onChange={(e) => update("titleHighlightEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان المميز (AR)</Label><Input dir="rtl" value={form.titleHighlightAr || ""} onChange={(e) => update("titleHighlightAr", e.target.value)} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان الفرعي (EN)</Label><Textarea rows={2} value={form.subtitleEn || ""} onChange={(e) => update("subtitleEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">العنوان الفرعي (AR)</Label><Textarea dir="rtl" rows={2} value={form.subtitleAr || ""} onChange={(e) => update("subtitleAr", e.target.value)} /></div>
        </div>
        <p className="text-xs text-muted-foreground">{admin.homepage.defaultTranslationsHint}</p>
        <div className="flex justify-end" role="status" aria-live="polite">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? admin.common.saving : admin.homepage.saveSection}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Visibility Editor ───
function VisibilityEditor() {
  const admin = useAdminText();
  const homepageCMS = useQuery(api.homepageSettings.getHomepageSettings);
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [initialized, setInitialized] = useState(false);

  if (homepageCMS && !initialized) {
    setVisibility({
      hero: homepageCMS.hero !== false,
      about: homepageCMS.about !== false,
      informationCard: homepageCMS.informationCard !== false,
      videos: homepageCMS.videos !== false,
      procedures: homepageCMS.procedures !== false,
      beforeAfter: homepageCMS.beforeAfter !== false,
      testimonials: homepageCMS.testimonials !== false,
      faq: homepageCMS.faq !== false,
      cta: homepageCMS.cta !== false,
      contact: homepageCMS.contact !== false,
      instagram: homepageCMS.instagram !== false,
    });
    setInitialized(true);
  }

  const toggle = (key: string) => setVisibility((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting({ key: "homepage", value: visibility });
      toast.success(admin.toast.homepageSaved);
    } catch { toast.error(admin.toast.homepageSaveError); }
    setSaving(false);
  };

  const sections = [
    { key: "hero", label: admin.homepage.hero },
    { key: "about", label: admin.homepage.about },
    { key: "informationCard", label: admin.homepage.informationCard },
    { key: "videos", label: admin.homepage.videosTitle },
    { key: "procedures", label: admin.nav.procedures },
    { key: "beforeAfter", label: admin.nav.beforeAfter },
    { key: "testimonials", label: admin.nav.testimonials },
    { key: "faq", label: admin.nav.faq },
    { key: "cta", label: admin.homepage.cta },
    { key: "contact", label: admin.nav.overview },
    { key: "instagram", label: admin.homepage.instagram },
  ];

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">{admin.homepage.visibilityTitle}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {sections.map((s) => (
          <div key={s.key} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
            <span className="text-sm font-medium">{s.label}</span>
            <button onClick={() => toggle(s.key)} className={cn("p-2 rounded-lg transition-colors", visibility[s.key] ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted")}>
              {visibility[s.key] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
        ))}
        <div className="flex justify-end" role="status" aria-live="polite">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? admin.common.saving : admin.homepage.saveVisibility}</Button>
        </div>
      </CardContent>
    </Card>
  );
}