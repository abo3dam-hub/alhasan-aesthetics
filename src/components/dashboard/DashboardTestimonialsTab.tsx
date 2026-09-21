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
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { MediaSelector } from "@/components/MediaSelector";
import { ImageGalleryInput } from "@/components/ImageGalleryInput";
import { swapOrder } from "./dashboard-utils";
import { ConfirmDialog } from "./ConfirmDialog";
import type { Id } from "@/convex/_generated/dataModel";

export default function DashboardTestimonialsTab() {
  const admin = useAdminText();
  const testimonials = useQuery(api.testimonials.list);
  const createTestimonial = useMutation(api.testimonials.create);
  const updateTestimonial = useMutation(api.testimonials.update);
  const removeTestimonial = useMutation(api.testimonials.remove);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"testimonials"> | null>(null);
  const [loading, setLoading] = useState(false);
  const existing = editingId ? testimonials?.find((t) => t._id === editingId) : null;
  const [testAvatar, setTestAvatar] = useState("");
  const [testImages, setTestImages] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Id<"testimonials"> | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenTestForm = (id: Id<"testimonials"> | null) => {
    setEditingId(id);
    setShowForm(true);
    const t = id ? testimonials?.find((t) => t._id === id) : null;
    setTestAvatar(t?.avatar || "");
    setTestImages(t?.images || []);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      nameAr: fd.get("nameAr") as string,
      nameEn: fd.get("nameEn") as string,
      textAr: fd.get("textAr") as string,
      textEn: fd.get("textEn") as string,
      rating: Number(fd.get("rating") as string) || 5,
      avatar: testAvatar || undefined,
      images: testImages,
      procedureType: (fd.get("procedureType") as string) || undefined,
    };
    if (editingId) {
      await updateTestimonial({ id: editingId, ...data });
      toast.success(admin.toast.saved);
    } else {
      await createTestimonial({ ...data, isActive: true, order: testimonials?.length ?? 0 });
      toast.success(admin.toast.saved);
    }
    setShowForm(false);
    setEditingId(null);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{admin.testimonials.title}</h2>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setTestImages([]); setTestAvatar(""); }} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> {admin.testimonials.add}
        </Button>
      </div>

      {showForm && (
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-lg">{editingId ? admin.testimonials.edit : admin.testimonials.addTitle}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{admin.content.nameEn}</Label><Input name="nameEn" required defaultValue={existing?.nameEn} /></div>
                <div className="space-y-2"><Label>{admin.content.nameAr}</Label><Input name="nameAr" dir="rtl" required defaultValue={existing?.nameAr} /></div>
              </div>
              <div className="space-y-2"><Label>{admin.content.textEn}</Label><Textarea name="textEn" rows={3} required defaultValue={existing?.textEn} /></div>
              <div className="space-y-2"><Label>{admin.content.textAr}</Label><Textarea name="textAr" dir="rtl" rows={3} required defaultValue={existing?.textAr} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{admin.testimonials.rating}</Label><Input name="rating" type="number" min={1} max={5} defaultValue={existing?.rating ?? 5} /></div>
                <div className="space-y-2"><Label>{admin.testimonials.procedureType}</Label><Input name="procedureType" defaultValue={existing?.procedureType} placeholder={admin.testimonials.procedureTypePlaceholder} /></div>
              </div>
              <input type="hidden" name="avatar" value={testAvatar} />
              <MediaSelector value={testAvatar} onChange={setTestAvatar} label={admin.testimonials.avatar} hint="يُزرع دائريًا صغيرًا — يُنصح 1:1 (مربّع) مع الوجه بالمنتصف" />
              <ImageGalleryInput
                value={testImages}
                onChange={setTestImages}
                label={admin.testimonials.resultPhotos}
                hint="تُعرض كمصغّرات في قسم تجارب المرضى ويمكن تصفّحها — يُنصح 4:3 (أفقي) أو 3:4 عمودي؛ تُقصّ تلقائيًا من المنتصف"
              />
              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">{loading ? admin.common.saving : admin.common.save}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>{admin.common.cancel}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {!testimonials ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">{admin.common.loading}</CardContent></Card>
        ) : testimonials.length === 0 ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center space-y-3"><p className="text-muted-foreground">{admin.testimonials.empty}</p><Button variant="outline" size="sm" onClick={() => { setShowForm(true); setEditingId(null); }}>{admin.testimonials.emptyAction}</Button></CardContent></Card>
        ) : testimonials.map((t) => (
          <Card key={t._id} className="border-border/60">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{t.nameEn}</p>
                  <div className="flex">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
                </div>
                <p className="text-sm text-muted-foreground truncate max-w-md">{t.textEn}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleOpenTestForm(t._id)} className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title={admin.common.edit} aria-label={admin.common.edit}><FileText className="h-4 w-4" /></button>
                <button onClick={async () => { await updateTestimonial({ id: t._id, isActive: !t.isActive }); toast.success(admin.toast.saved); }} className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title={t.isActive ? admin.common.inactive : admin.common.active} aria-label={t.isActive ? admin.common.inactive : admin.common.active}>
                  {t.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => setDeleteTarget(t._id)} className="p-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title={admin.common.delete} aria-label={admin.common.delete}>
                  <Trash2 className="h-4 w-4" />
                </button>
                {t.images != null && t.images.length > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] text-primary font-medium shrink-0" title={admin.testimonials.resultPhotos}>
                    <ImageIcon className="h-3 w-3" />
                    {t.images.length}
                  </span>
                )}
                <div className="flex flex-col gap-0.5 border-s border-border/40 ps-2 ms-1">
                  <button disabled={testimonials!.indexOf(t) === 0} onClick={() => swapOrder(testimonials!, testimonials!.indexOf(t), "up", updateTestimonial)} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors" aria-label={admin.common.moveUp}><ArrowUp className="h-3 w-3" /></button>
                  <button disabled={testimonials!.indexOf(t) === testimonials!.length - 1} onClick={() => swapOrder(testimonials!, testimonials!.indexOf(t), "down", updateTestimonial)} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors" aria-label={admin.common.moveDown}><ArrowDown className="h-3 w-3" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={admin.confirm.title}
        message={admin.confirm.deleteTestimonial}
        isLoading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await removeTestimonial({ id: deleteTarget });
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
