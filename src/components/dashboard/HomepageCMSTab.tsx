import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ImageUpload";

export default function HomepageCMSTab() {
  const [activeSection, setActiveSection] = useState<string | null>("hero");

  const sections = [
    { key: "hero", label: "Hero Section" },
    { key: "about", label: "About Section" },
    { key: "procedures-header", label: "Procedures Section Header" },
    { key: "beforeAfter-header", label: "Before & After Section Header" },
    { key: "testimonials-header", label: "Testimonials Section Header" },
    { key: "faq-header", label: "FAQ Section Header" },
    { key: "cta", label: "CTA Section" },
    { key: "footer", label: "Footer Content" },
    { key: "visibility", label: "Section Visibility" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Homepage CMS</h2>
      <p className="text-sm text-muted-foreground">Edit homepage section content. All changes reflect on the public website.</p>

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
              {section.key === "procedures-header" && <SectionHeaderEditor sectionKey="proceduresSection" label="Procedures" fallbackKeys={{ badge: "procedures.badge", title: "procedures.title", titleHighlight: "procedures.titleHighlight", subtitle: "procedures.subtitle" }} />}
              {section.key === "beforeAfter-header" && <SectionHeaderEditor sectionKey="beforeAfterSection" label="Before & After" fallbackKeys={{ badge: "beforeAfter.badge", title: "beforeAfter.title", titleHighlight: "beforeAfter.titleHighlight", subtitle: "beforeAfter.subtitle" }} />}
              {section.key === "testimonials-header" && <SectionHeaderEditor sectionKey="testimonialsSection" label="Testimonials" fallbackKeys={{ badge: "testimonials.badge", title: "testimonials.title", titleHighlight: "testimonials.titleHighlight", subtitle: "testimonials.subtitle" }} />}
              {section.key === "faq-header" && <SectionHeaderEditor sectionKey="faqSection" label="FAQ" fallbackKeys={{ badge: "faq.badge", title: "faq.title", titleHighlight: "faq.titleHighlight", subtitle: "faq.subtitle" }} />}
              {section.key === "cta" && <CTAEditor />}
              {section.key === "footer" && <FooterEditor />}
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
  const heroCMS = useQuery(api.homepageSettings.getHeroSettings);
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
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
      image: heroCMS.image || "",
      trustBadges: heroCMS.trustBadges || [
        { labelAr: "+١٥ سنة خبرة", labelEn: "+15 Years Experience", icon: "award", enabled: true },
        { labelAr: "+٥٠٠٠ عملية ناجحة", labelEn: "+5000 Successful Surgeries", icon: "star", enabled: true },
        { labelAr: "نتائج طبيعية ١٠٠٪", labelEn: "100% Natural Results", icon: "sparkles", enabled: true },
      ],
    });
    setInitialized(true);
  }

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting({ key: "hero", value: form });
      toast.success("Hero settings saved!");
    } catch (e) {
      toast.error("Failed to save hero settings");
    }
    setSaving(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">Hero Section Content</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {/* Badge */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Badge / Eyebrow</Label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.badgeEnabled} onChange={(e) => update("badgeEnabled", e.target.checked)} className="rounded" /> Enabled</label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">Badge (EN)</Label><Input value={form.badgeEn || ""} onChange={(e) => update("badgeEn", e.target.value)} placeholder="Aesthetic & Plastic Surgery" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">Badge (AR)</Label><Input dir="rtl" value={form.badgeAr || ""} onChange={(e) => update("badgeAr", e.target.value)} placeholder="جراحة تجميلية وتجميلية" /></div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Main Title</Label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">Title (EN)</Label><Input value={form.titleEn || ""} onChange={(e) => update("titleEn", e.target.value)} placeholder="Your Beauty Deserves" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">Title (AR)</Label><Input dir="rtl" value={form.titleAr || ""} onChange={(e) => update("titleAr", e.target.value)} placeholder="جمالك يستحق" /></div>
          </div>
        </div>

        {/* Subtitle / Highlight */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Highlighted Subtitle</Label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">Subtitle (EN)</Label><Input value={form.subtitleEn || ""} onChange={(e) => update("subtitleEn", e.target.value)} placeholder="The Finest Care" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">Subtitle (AR)</Label><Input dir="rtl" value={form.subtitleAr || ""} onChange={(e) => update("subtitleAr", e.target.value)} placeholder="أرقى العناية" /></div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Description</Label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">Description (EN)</Label><Textarea rows={2} value={form.descriptionEn || ""} onChange={(e) => update("descriptionEn", e.target.value)} placeholder="We bring your vision to life..." /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">Description (AR)</Label><Textarea dir="rtl" rows={2} value={form.descriptionAr || ""} onChange={(e) => update("descriptionAr", e.target.value)} placeholder="نحول رؤيتك إلى واقع..." /></div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Primary CTA Button</Label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.ctaEnabled} onChange={(e) => update("ctaEnabled", e.target.checked)} className="rounded" /> Enabled</label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">CTA Text (EN)</Label><Input value={form.ctaTextEn || ""} onChange={(e) => update("ctaTextEn", e.target.value)} placeholder="Book Your Consultation" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">CTA Text (AR)</Label><Input dir="rtl" value={form.ctaTextAr || ""} onChange={(e) => update("ctaTextAr", e.target.value)} placeholder="احجز استشارتك" /></div>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Secondary CTA Button</Label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.ctaSecondaryEnabled} onChange={(e) => update("ctaSecondaryEnabled", e.target.checked)} className="rounded" /> Enabled</label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">Text (EN)</Label><Input value={form.ctaSecondaryTextEn || ""} onChange={(e) => update("ctaSecondaryTextEn", e.target.value)} placeholder="Explore Procedures" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">Text (AR)</Label><Input dir="rtl" value={form.ctaSecondaryTextAr || ""} onChange={(e) => update("ctaSecondaryTextAr", e.target.value)} placeholder="استكشف الإجراءات" /></div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Trust Badges</Label>
          {(form.trustBadges || []).map((badge: any, i: number) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
              <div className="space-y-1"><Label className="text-xs">EN</Label><Input value={badge.labelEn} onChange={(e) => {
                const badges = [...form.trustBadges]; badges[i] = { ...badges[i], labelEn: e.target.value }; update("trustBadges", badges);
              }} /></div>
              <div className="space-y-1"><Label className="text-xs">AR</Label><Input dir="rtl" value={badge.labelAr} onChange={(e) => {
                const badges = [...form.trustBadges]; badges[i] = { ...badges[i], labelAr: e.target.value }; update("trustBadges", badges);
              }} /></div>
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={badge.enabled !== false} onChange={(e) => {
                const badges = [...form.trustBadges]; badges[i] = { ...badges[i], enabled: e.target.checked }; update("trustBadges", badges);
              }} className="rounded" /> On</label>
              <button type="button" onClick={() => {
                const badges = form.trustBadges.filter((_: any, j: number) => j !== i); update("trustBadges", badges);
              }} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => {
            update("trustBadges", [...(form.trustBadges || []), { labelAr: "", labelEn: "", icon: "award", enabled: true }]);
          }} className="gap-1"><Plus className="h-3 w-3" /> Add Badge</Button>
        </div>

        {/* Hero Image */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Hero Image (optional)</Label>
          <ImageUpload value={form.image || ""} onChange={(url) => update("image", url)} label="Upload hero image" />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? "Saving..." : "Save Hero"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── About Editor ───
function AboutEditor() {
  const aboutCMS = useQuery(api.homepageSettings.getAboutSettings);
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
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

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting({ key: "about", value: form });
      toast.success("About settings saved!");
    } catch (e) { toast.error("Failed to save"); }
    setSaving(false);
  };

  const iconOptions = ["clock", "heart", "users", "award"];

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">About Section Content</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {/* Badge */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Badge (EN)</Label><Input value={form.badgeEn || ""} onChange={(e) => update("badgeEn", e.target.value)} placeholder="About Dr. Al Hasan" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Badge (AR)</Label><Input dir="rtl" value={form.badgeAr || ""} onChange={(e) => update("badgeAr", e.target.value)} placeholder="عن الدكتور الحسن" /></div>
        </div>

        {/* Title */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Title (EN)</Label><Input value={form.titleEn || ""} onChange={(e) => update("titleEn", e.target.value)} placeholder="Expertise That Merges" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Title (AR)</Label><Input dir="rtl" value={form.titleAr || ""} onChange={(e) => update("titleAr", e.target.value)} placeholder="خبرة تجمع بين" /></div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Title Highlight (EN)</Label><Input value={form.titleHighlightEn || ""} onChange={(e) => update("titleHighlightEn", e.target.value)} placeholder="Science & Beauty" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Title Highlight (AR)</Label><Input dir="rtl" value={form.titleHighlightAr || ""} onChange={(e) => update("titleHighlightAr", e.target.value)} placeholder="العلم والجمال" /></div>
        </div>

        {/* Description */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Description (EN)</Label><Textarea rows={3} value={form.descriptionEn || ""} onChange={(e) => update("descriptionEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Description (AR)</Label><Textarea dir="rtl" rows={3} value={form.descriptionAr || ""} onChange={(e) => update("descriptionAr", e.target.value)} /></div>
        </div>

        {/* Doctor Image */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Doctor Profile Image</Label>
          <ImageUpload value={form.image || ""} onChange={(url) => update("image", url)} label="Upload doctor image" />
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Statistics</Label>
          {(form.stats || []).map((stat: any, i: number) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
              <div className="space-y-1"><Label className="text-xs">Value</Label><Input value={stat.value} onChange={(e) => { const s = [...form.stats]; s[i] = { ...s[i], value: e.target.value }; update("stats", s); }} placeholder="15+" /></div>
              <div className="space-y-1"><Label className="text-xs">Icon</Label><select value={stat.icon} onChange={(e) => { const s = [...form.stats]; s[i] = { ...s[i], icon: e.target.value }; update("stats", s); }} className="w-full border border-border/60 rounded-lg px-3 py-2 bg-background text-sm">{iconOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
              <div className="space-y-1"><Label className="text-xs">EN</Label><Input value={stat.labelEn} onChange={(e) => { const s = [...form.stats]; s[i] = { ...s[i], labelEn: e.target.value }; update("stats", s); }} /></div>
              <div className="space-y-1"><Label className="text-xs">AR</Label><Input dir="rtl" value={stat.labelAr} onChange={(e) => { const s = [...form.stats]; s[i] = { ...s[i], labelAr: e.target.value }; update("stats", s); }} /></div>
              <label className="flex items-center gap-1 text-xs pb-1"><input type="checkbox" checked={stat.enabled !== false} onChange={(e) => { const s = [...form.stats]; s[i] = { ...s[i], enabled: e.target.checked }; update("stats", s); }} className="rounded" /> On</label>
              <button type="button" onClick={() => update("stats", form.stats.filter((_: any, j: number) => j !== i))} className="p-1 text-red-500 hover:bg-red-50 rounded pb-1"><Trash2 className="h-3 w-3" /></button>
              <div className="flex flex-col gap-0.5 pb-1">
                <button type="button" disabled={i === 0} onClick={() => { const s = [...form.stats]; [s[i-1], s[i]] = [s[i], s[i-1]]; update("stats", s); }} className="p-1 text-muted-foreground hover:bg-muted rounded disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                <button type="button" disabled={i === (form.stats?.length ?? 1) - 1} onClick={() => { const s = [...form.stats]; [s[i], s[i+1]] = [s[i+1], s[i]]; update("stats", s); }} className="p-1 text-muted-foreground hover:bg-muted rounded disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => update("stats", [...(form.stats || []), { icon: "award", value: "", labelAr: "", labelEn: "", enabled: true }])} className="gap-1"><Plus className="h-3 w-3" /> Add Stat</Button>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? "Saving..." : "Save About"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CTA Editor ───
function CTAEditor() {
  const ctaCMS = useQuery(api.homepageSettings.getCTASettings);
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
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

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting({ key: "cta", value: form });
      toast.success("CTA settings saved!");
    } catch (e) { toast.error("Failed to save"); }
    setSaving(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">CTA Section Content</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={(e) => update("enabled", e.target.checked)} className="rounded" /> Section Enabled</label>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Badge (EN)</Label><Input value={form.badgeEn || ""} onChange={(e) => update("badgeEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Badge (AR)</Label><Input dir="rtl" value={form.badgeAr || ""} onChange={(e) => update("badgeAr", e.target.value)} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Title (EN)</Label><Input value={form.titleEn || ""} onChange={(e) => update("titleEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Title (AR)</Label><Input dir="rtl" value={form.titleAr || ""} onChange={(e) => update("titleAr", e.target.value)} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Description (EN)</Label><Textarea rows={2} value={form.descriptionEn || ""} onChange={(e) => update("descriptionEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Description (AR)</Label><Textarea dir="rtl" rows={2} value={form.descriptionAr || ""} onChange={(e) => update("descriptionAr", e.target.value)} /></div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Button</Label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.buttonEnabled} onChange={(e) => update("buttonEnabled", e.target.checked)} className="rounded" /> Enabled</label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Button Text (EN)</Label><Input value={form.buttonTextEn || ""} onChange={(e) => update("buttonTextEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Button Text (AR)</Label><Input dir="rtl" value={form.buttonTextAr || ""} onChange={(e) => update("buttonTextAr", e.target.value)} /></div>
        </div>
        <div className="space-y-2"><Label className="text-xs text-muted-foreground">Button Destination</Label><Input value={form.buttonDestination || ""} onChange={(e) => update("buttonDestination", e.target.value)} placeholder="/consultation" /></div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? "Saving..." : "Save CTA"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Footer Editor ───
function FooterEditor() {
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
      toast.success("Footer settings saved!");
    } catch (e) { toast.error("Failed to save"); }
    setSaving(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">Footer Content</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Footer Description (EN)</Label><Textarea rows={3} value={form.descriptionEn || ""} onChange={(e) => update("descriptionEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Footer Description (AR)</Label><Textarea dir="rtl" rows={3} value={form.descriptionAr || ""} onChange={(e) => update("descriptionAr", e.target.value)} /></div>
        </div>
        <p className="text-xs text-muted-foreground">Social media links and contact info come from Doctor Settings.</p>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? "Saving..." : "Save Footer"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Section Header Editor (reusable for Procedures/Testimonials/FAQ/BeforeAfter) ───
function SectionHeaderEditor({ sectionKey, label, fallbackKeys }: { sectionKey: string; label: string; fallbackKeys: { badge: string; title: string; titleHighlight: string; subtitle: string } }) {
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
      toast.success(`${label} section header saved!`);
    } catch (e) { toast.error("Failed to save"); }
    setSaving(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">{label} Section Header</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Badge (EN)</Label><Input value={form.badgeEn || ""} onChange={(e) => update("badgeEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Badge (AR)</Label><Input dir="rtl" value={form.badgeAr || ""} onChange={(e) => update("badgeAr", e.target.value)} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Title (EN)</Label><Input value={form.titleEn || ""} onChange={(e) => update("titleEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Title (AR)</Label><Input dir="rtl" value={form.titleAr || ""} onChange={(e) => update("titleAr", e.target.value)} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Title Highlight (EN)</Label><Input value={form.titleHighlightEn || ""} onChange={(e) => update("titleHighlightEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Title Highlight (AR)</Label><Input dir="rtl" value={form.titleHighlightAr || ""} onChange={(e) => update("titleHighlightAr", e.target.value)} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Subtitle (EN)</Label><Textarea rows={2} value={form.subtitleEn || ""} onChange={(e) => update("subtitleEn", e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Subtitle (AR)</Label><Textarea dir="rtl" rows={2} value={form.subtitleAr || ""} onChange={(e) => update("subtitleAr", e.target.value)} /></div>
        </div>
        <p className="text-xs text-muted-foreground">Leave fields blank to use default translations.</p>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? "Saving..." : "Save"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Visibility Editor ───
function VisibilityEditor() {
  const homepageCMS = useQuery(api.homepageSettings.getHomepageSettings);
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [initialized, setInitialized] = useState(false);

  if (homepageCMS && !initialized) {
    setVisibility({
      hero: homepageCMS.hero !== false,
      about: homepageCMS.about !== false,
      procedures: homepageCMS.procedures !== false,
      beforeAfter: homepageCMS.beforeAfter !== false,
      testimonials: homepageCMS.testimonials !== false,
      faq: homepageCMS.faq !== false,
      cta: homepageCMS.cta !== false,
      contact: homepageCMS.contact !== false,
    });
    setInitialized(true);
  }

  const toggle = (key: string) => setVisibility((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting({ key: "homepage", value: visibility });
      toast.success("Visibility settings saved!");
    } catch (e) { toast.error("Failed to save"); }
    setSaving(false);
  };

  const sections = [
    { key: "hero", label: "Hero" },
    { key: "about", label: "About" },
    { key: "procedures", label: "Procedures" },
    { key: "beforeAfter", label: "Before & After" },
    { key: "testimonials", label: "Testimonials" },
    { key: "faq", label: "FAQ" },
    { key: "cta", label: "CTA" },
    { key: "contact", label: "Contact" },
  ];

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">Homepage Section Visibility</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {sections.map((s) => (
          <div key={s.key} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
            <span className="text-sm font-medium">{s.label}</span>
            <button onClick={() => toggle(s.key)} className={cn("p-2 rounded-lg transition-colors", visibility[s.key] ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted")}>
              {visibility[s.key] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
        ))}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? "Saving..." : "Save Visibility"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
