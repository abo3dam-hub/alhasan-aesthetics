import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminText } from "@/hooks/use-admin-text";
import { ArrowDown, ArrowUp, Eye, EyeOff, FileText, Plus, Trash2 } from "lucide-react";
import { MediaSelector } from "@/components/MediaSelector";
import { swapOrder } from "./dashboard-utils";
import { ConfirmDialog } from "./ConfirmDialog";
import type { Id } from "@/convex/_generated/dataModel";

export default function DashboardBeforeAfterTab() {
  const admin = useAdminText();
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
  const [deleteTarget, setDeleteTarget] = useState<Id<"beforeAfter"> | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      toast.success(admin.toast.saved);
    } else {
      await createCase({ ...data, isActive: true, order: cases?.length ?? 0 });
      toast.success(admin.toast.saved);
    }
    setShowForm(false);
    setEditingId(null);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{admin.beforeAfter.title}</h2>
        <Button onClick={() => handleOpenBAForm(null)} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> {admin.beforeAfter.add}
        </Button>
      </div>

      {showForm && (
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-lg">{editingId ? admin.beforeAfter.edit : admin.beforeAfter.addTitle}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{admin.content.titleEn}</Label><Input name="titleEn" required defaultValue={existing?.titleEn} /></div>
                <div className="space-y-2"><Label>{admin.content.titleAr}</Label><Input name="titleAr" dir="rtl" required defaultValue={existing?.titleAr} /></div>
              </div>
              <div className="space-y-2">
                <Label>{admin.beforeAfter.procedureType}</Label>
                <select name="procedureType" defaultValue={existing?.procedureType} className="w-full border border-border/60 rounded-lg px-3 py-2 bg-background text-sm">
                  {procedures?.map((p) => <option key={p._id} value={p.slug}>{p.titleEn}</option>)}
                </select>
              </div>
              <input type="hidden" name="beforeImage" value={baBeforeImage} />
              <input type="hidden" name="afterImage" value={baAfterImage} />
              <div className="grid sm:grid-cols-2 gap-4">
                <MediaSelector value={baBeforeImage} onChange={setBaBeforeImage} label={admin.beforeAfter.beforeImage} hint="يُزرع 4:3 في صفحة قبل/بعد و1:1 في قسم الرئيسية — ضَع الوجه/المنطقة بالمنتصف" />
                <MediaSelector value={baAfterImage} onChange={setBaAfterImage} label={admin.beforeAfter.afterImage} hint="يُزرع 4:3 في صفحة قبل/بعد و1:1 في قسم الرئيسية — ضَع الوجه/المنطقة بالمنتصف" />
              </div>
              <div className="space-y-2"><Label>{admin.content.descEn}</Label><Textarea name="descriptionEn" rows={2} defaultValue={existing?.descriptionEn} /></div>
              <div className="space-y-2"><Label>{admin.content.descAr}</Label><Textarea name="descriptionAr" dir="rtl" rows={2} defaultValue={existing?.descriptionAr} /></div>
              <div className="space-y-2"><Label>{admin.beforeAfter.patientAge}</Label><Input name="patientAge" type="number" min={1} max={120} defaultValue={existing?.patientAge ?? ""} placeholder="مثال: 35" /></div>
              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">{loading ? admin.common.saving : admin.common.save}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>{admin.common.cancel}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {!cases ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">{admin.common.loading}</CardContent></Card>
        ) : cases.length === 0 ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center space-y-3"><p className="text-muted-foreground">{admin.beforeAfter.empty}</p><Button variant="outline" size="sm" onClick={() => handleOpenBAForm(null)}>{admin.beforeAfter.emptyAction}</Button></CardContent></Card>
        ) : (
          cases.map((c) => (
            <Card key={c._id} className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{c.titleEn}</p>
                  <p className="text-sm text-muted-foreground">
                    {procedures?.find((p) => p.slug === c.procedureType)?.titleAr ||
                      procedures?.find((p) => p.slug === c.procedureType)?.titleEn ||
                      c.procedureType}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleOpenBAForm(c._id)} className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title={admin.common.edit} aria-label={admin.common.edit}><FileText className="h-4 w-4" /></button>
                  <button onClick={async () => { await updateCase({ id: c._id, isActive: !c.isActive }); toast.success(admin.toast.saved); }} className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title={c.isActive ? admin.common.inactive : admin.common.active} aria-label={c.isActive ? admin.common.inactive : admin.common.active}>
                    {c.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setDeleteTarget(c._id)} className="p-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title={admin.common.delete} aria-label={admin.common.delete}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col gap-0.5 border-s border-border/40 ps-2 ms-1">
                    <button disabled={cases!.indexOf(c) === 0} onClick={() => swapOrder(cases!, cases!.indexOf(c), "up", updateCase)} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors" aria-label={admin.common.moveUp}><ArrowUp className="h-3 w-3" /></button>
                    <button disabled={cases!.indexOf(c) === cases!.length - 1} onClick={() => swapOrder(cases!, cases!.indexOf(c), "down", updateCase)} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors" aria-label={admin.common.moveDown}><ArrowDown className="h-3 w-3" /></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={admin.confirm.title}
        message={admin.confirm.deleteCase}
        isLoading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await removeCase({ id: deleteTarget });
            toast.success(admin.toast.deleted);
            setDeleteTarget(null);
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}
