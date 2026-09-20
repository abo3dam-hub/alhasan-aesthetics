import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Eye, EyeOff, FileText, Plus, Trash2 } from "lucide-react";
import { MediaSelector } from "@/components/MediaSelector";
import { swapOrder } from "./dashboard-utils";
import type { Id } from "@/convex/_generated/dataModel";

export default function DashboardBeforeAfterTab() {
  const cases = useQuery(api.beforeAfter.list);
  const createCase = useMutation(api.beforeAfter.create);
  const updateCase = useMutation(api.beforeAfter.update);
  const removeCase = useMutation(api.beforeAfter.remove);
  const procedures = useQuery(api.procedures.list);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"beforeAfter"> | null>(null);
  const [loading, setLoading] = useState(false);
  const existing = editingId ? cases?.find((c) => c._id === editingId) : null;
  const [baBeforeImage, setBaBeforeImage] = useState("");
  const [baAfterImage, setBaAfterImage] = useState("");

  const handleOpenBAForm = (id: Id<"beforeAfter"> | null) => {
    setEditingId(id);
    setShowForm(true);
    const c = id ? cases?.find((c) => c._id === id) : null;
    setBaBeforeImage(c?.beforeImage || "");
    setBaAfterImage(c?.afterImage || "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const ageVal = (fd.get("patientAge") as string) || "";
    const data = {
      titleAr: fd.get("titleAr") as string,
      titleEn: fd.get("titleEn") as string,
      procedureType: fd.get("procedureType") as string,
      beforeImage: baBeforeImage || "",
      afterImage: baAfterImage || "",
      descriptionAr: (fd.get("descriptionAr") as string) || undefined,
      descriptionEn: (fd.get("descriptionEn") as string) || undefined,
      patientAge: ageVal ? Number(ageVal) : undefined,
    };
    if (editingId) {
      await updateCase({ id: editingId, ...data });
      toast.success("Case updated");
    } else {
      await createCase({ ...data, isActive: true, order: cases?.length ?? 0 });
      toast.success("Case added");
    }
    setShowForm(false);
    setEditingId(null);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Before & After</h2>
        <Button onClick={() => handleOpenBAForm(null)} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Case
        </Button>
      </div>

      {showForm && (
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-lg">{editingId ? "Edit Case" : "Add Before & After Case"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Title (EN)</Label><Input name="titleEn" required defaultValue={existing?.titleEn} /></div>
                <div className="space-y-2"><Label>Title (AR)</Label><Input name="titleAr" dir="rtl" required defaultValue={existing?.titleAr} /></div>
              </div>
              <div className="space-y-2">
                <Label>Procedure Type</Label>
                <select name="procedureType" defaultValue={existing?.procedureType} className="w-full border border-border/60 rounded-lg px-3 py-2 bg-background text-sm">
                  {procedures?.map((p) => <option key={p._id} value={p.slug}>{p.titleEn}</option>)}
                </select>
              </div>
              <input type="hidden" name="beforeImage" value={baBeforeImage} />
              <input type="hidden" name="afterImage" value={baAfterImage} />
              <div className="grid sm:grid-cols-2 gap-4">
                <MediaSelector value={baBeforeImage} onChange={setBaBeforeImage} label="Before Image" hint="يُزرع 4:3 في صفحة قبل/بعد و1:1 في قسم الرئيسية — ضَع الوجه/المنطقة بالمنتصف" />
                <MediaSelector value={baAfterImage} onChange={setBaAfterImage} label="After Image" hint="يُزرع 4:3 في صفحة قبل/بعد و1:1 في قسم الرئيسية — ضَع الوجه/المنطقة بالمنتصف" />
              </div>
              <div className="space-y-2"><Label>Description (EN)</Label><Textarea name="descriptionEn" rows={2} defaultValue={existing?.descriptionEn} /></div>
              <div className="space-y-2"><Label>Description (AR)</Label><Textarea name="descriptionAr" dir="rtl" rows={2} defaultValue={existing?.descriptionAr} /></div>
              <div className="space-y-2"><Label>Patient Age (optional)</Label><Input name="patientAge" type="number" min={1} max={120} defaultValue={existing?.patientAge ?? ""} placeholder="e.g. 35" /></div>
              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">{loading ? "Saving..." : (editingId ? "Update" : "Save")}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {!cases || cases.length === 0 ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">No before/after cases yet.</CardContent></Card>
        ) : (
          cases.map((c) => (
            <Card key={c._id} className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{c.titleEn}</p>
                  <p className="text-sm text-muted-foreground">{c.procedureType}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleOpenBAForm(c._id)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Edit"><FileText className="h-4 w-4" /></button>
                  <button onClick={async () => { await updateCase({ id: c._id, isActive: !c.isActive }); toast.success("Updated"); }} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                    {c.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={async () => { if (confirm("Delete this case?")) { await removeCase({ id: c._id }); toast.success("Deleted"); } }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col gap-0.5 border-s border-border/40 ps-2 ms-1">
                    <button disabled={cases!.indexOf(c) === 0} onClick={() => swapOrder(cases!, cases!.indexOf(c), "up", updateCase)} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"><ArrowUp className="h-3 w-3" /></button>
                    <button disabled={cases!.indexOf(c) === cases!.length - 1} onClick={() => swapOrder(cases!, cases!.indexOf(c), "down", updateCase)} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"><ArrowDown className="h-3 w-3" /></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}