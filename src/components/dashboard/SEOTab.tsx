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

export default function SEOTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">SEO Settings</h2>
      <p className="text-sm text-muted-foreground">Manage global site SEO and per-procedure metadata.</p>
      <GlobalSEOEditor />
    </div>
  );
}

function GlobalSEOEditor() {
  const seoCMS = useQuery(api.homepageSettings.getSEOSettings);
  const setSetting = useMutation(api.homepageSettings.set);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  if (seoCMS && !initialized) {
    setForm({
      siteTitleAr: seoCMS.siteTitleAr || "",
      siteTitleEn: seoCMS.siteTitleEn || "",
      metaDescriptionAr: seoCMS.metaDescriptionAr || "",
      metaDescriptionEn: seoCMS.metaDescriptionEn || "",
      ogImage: seoCMS.ogImage || "",
      canonicalBase: seoCMS.canonicalBase || "https://dr-alhasan.com",
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
        let meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute("content", desc);
      }
      toast.success("SEO settings saved!");
    } catch (e) { toast.error("Failed to save"); }
    setSaving(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">Global SEO</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Site Title (EN)</Label><Input value={form.siteTitleEn || ""} onChange={(e) => update("siteTitleEn", e.target.value)} placeholder="Dr. Al Hasan — Aesthetic Surgery" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Site Title (AR)</Label><Input dir="rtl" value={form.siteTitleAr || ""} onChange={(e) => update("siteTitleAr", e.target.value)} placeholder="د. الحسن — جراحة تجميلية" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Meta Description (EN)</Label><Textarea rows={3} value={form.metaDescriptionEn || ""} onChange={(e) => update("metaDescriptionEn", e.target.value)} placeholder="Board-certified aesthetic surgeon..." /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Meta Description (AR)</Label><Textarea dir="rtl" rows={3} value={form.metaDescriptionAr || ""} onChange={(e) => update("metaDescriptionAr", e.target.value)} placeholder="طبيب متخصص في الجراحة التجميلية..." /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">OG Image</Label><MediaSelector value={form.ogImage || ""} onChange={(url) => update("ogImage", url)} label="Select OG image" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Canonical Base URL</Label><Input value={form.canonicalBase || ""} onChange={(e) => update("canonicalBase", e.target.value)} placeholder="https://dr-alhasan.com" /></div>
        </div>
        <div className="flex justify-end" role="status" aria-live="polite">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">{saving ? "Saving..." : "Save SEO"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
