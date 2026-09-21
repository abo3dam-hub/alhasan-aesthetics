import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MediaSelector } from "@/components/MediaSelector";
import { useAdminText } from "@/hooks/use-admin-text";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SEOTab() {
  const admin = useAdminText();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{admin.seo.title}</h2>
      <p className="text-sm text-muted-foreground">{admin.seo.subtitle}</p>
      <GlobalSEOEditor />
    </div>
  );
}

function GlobalSEOEditor() {
  const admin = useAdminText();
  const seoCMS = useQuery(api.homepageSettings.getSEOSettings);
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  if (seoCMS && !initialized) {
    setForm({
      siteTitleAr: seoCMS.siteTitleAr || "",
      siteTitleEn: seoCMS.siteTitleEn || "",
      metaDescriptionAr: seoCMS.metaDescriptionAr || "",
      metaDescriptionEn: seoCMS.metaDescriptionEn || "",
      ogImage: seoCMS.ogImage || "",
      canonicalBase: seoCMS.canonicalBase || "https://dralhasanalsaiem.com",
    });
    setInitialized(true);
  }

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting({ key: "seo", value: form });
      const title = form.siteTitleEn || form.siteTitleAr || document.title;
      if (title) document.title = title;
      const desc = form.metaDescriptionEn || form.metaDescriptionAr;
      if (desc) {
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute("content", desc);
      }
      toast.success(admin.toast.seoSaved);
    } catch { toast.error(admin.toast.seoSaveError); }
    setSaving(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">{admin.seo.globalSeo}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">{admin.seo.siteTitleEn}</Label><Input value={form.siteTitleEn || ""} onChange={(e) => update("siteTitleEn", e.target.value)} placeholder="Dr. Al Hasan — Aesthetic Surgery" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">{admin.seo.siteTitleAr}</Label><Input dir="rtl" value={form.siteTitleAr || ""} onChange={(e) => update("siteTitleAr", e.target.value)} placeholder="د. الحسن — جراحة تجميلية" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">{admin.seo.metaDescEn}</Label><Textarea rows={3} value={form.metaDescriptionEn || ""} onChange={(e) => update("metaDescriptionEn", e.target.value)} placeholder="Board-certified aesthetic surgeon..." /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">{admin.seo.metaDescAr}</Label><Textarea dir="rtl" rows={3} value={form.metaDescriptionAr || ""} onChange={(e) => update("metaDescriptionAr", e.target.value)} placeholder="طبيب متخصص في الجراحة التجميلية..." /></div>
        </div>
        <div className="space-y-2"><Label className="text-xs text-muted-foreground">{admin.seo.ogImage}</Label><MediaSelector value={form.ogImage || ""} onChange={(url) => update("ogImage", url)} label={admin.seo.ogImage} hint="صورة المشاركة على السوشيال — يُنصح 1200×630 (نسبة 1.91:1)" /></div>

        {/* Canonical base under advanced */}
        <Card className="border-border/40">
          <CardContent className="p-4">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowAdvanced((s) => !s)}
              className="gap-2"
            >
              {showAdvanced ? admin.lessDetails : admin.advancedTitle}
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {showAdvanced && (
              <div className="mt-4 space-y-2">
                <Label className="text-xs text-muted-foreground">{admin.seo.canonicalBase}</Label>
                <Input value={form.canonicalBase || ""} onChange={(e) => update("canonicalBase", e.target.value)} placeholder="https://dralhasanalsaiem.com" />
                <p className="text-xs text-muted-foreground">{admin.seo.canonicalHint}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end" role="status" aria-live="polite">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? admin.common.saving : admin.seo.save}</Button>
        </div>
      </CardContent>
    </Card>
  );
}