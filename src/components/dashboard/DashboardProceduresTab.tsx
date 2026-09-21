import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminText } from "@/hooks/use-admin-text";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getProcedureIcon,
  PROCEDURE_ICON_MAP,
  PROCEDURE_ICON_OPTIONS,
  PROCEDURE_ICON_LABELS,
  normalizeStoredIcon,
} from "@/lib/procedureIcons";
import { MediaSelector } from "@/components/MediaSelector";
import { swapOrder } from "./dashboard-utils";
import { ConfirmDialog } from "./ConfirmDialog";
import type { Id } from "@/convex/_generated/dataModel";

const iconOptions = [...PROCEDURE_ICON_OPTIONS];

export default function DashboardProceduresTab() {
  const admin = useAdminText();
  const procedures = useQuery(api.procedures.list);
  const createProcedure = useMutation(api.procedures.create);
  const updateProcedure = useMutation(api.procedures.update);
  const removeProcedure = useMutation(api.procedures.remove);
  const normalizeIcons = useMutation(api.migration.migrateProcedureIcons);
  const [normalizingIcons, setNormalizingIcons] = useState(false);
  const fillSeo = useMutation(api.migration.migrateProcedureSeo);
  const [fillingSeo, setFillingSeo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"procedures"> | null>(null);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [deleteTarget, setDeleteTarget] = useState<Id<"procedures"> | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredProcedures = procedures?.filter((p) => {
    const matchesSearch = !search || p.titleEn.toLowerCase().includes(search.toLowerCase()) || p.titleAr.includes(search) || p.slug.includes(search.toLowerCase());
    const matchesFilter = filterActive === "all" || (filterActive === "active" ? p.isActive : !p.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleToggleActive = async (id: Id<"procedures">, isActive: boolean) => {
    await updateProcedure({ id, isActive: !isActive });
    toast.success(admin.toast.saved);
  };

  const handleDelete = (id: Id<"procedures">) => {
    setDeleteTarget(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{admin.procedures.title}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={normalizingIcons}
            onClick={async () => {
              setNormalizingIcons(true);
              try {
                await normalizeIcons();
                toast.success(admin.procedures.iconsUpdated);
              } catch {
                toast.error(admin.procedures.iconsUpdateFailed);
              } finally {
                setNormalizingIcons(false);
              }
            }}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", normalizingIcons && "animate-spin")} />
            {admin.procedures.normalizeIcons}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={fillingSeo}
            onClick={async () => {
              setFillingSeo(true);
              try {
                await fillSeo();
                toast.success(admin.procedures.seoFilled);
              } catch {
                toast.error(admin.procedures.seoFillFailed);
              } finally {
                setFillingSeo(false);
              }
            }}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", fillingSeo && "animate-spin")} />
            {admin.procedures.fillSeo}
          </Button>
<Button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="gap-2 bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" /> {admin.procedures.add}
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder={admin.procedures.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <select value={filterActive} onChange={(e) => setFilterActive(e.target.value as "all" | "active" | "inactive")} className="border border-border/60 rounded-lg px-3 py-2 bg-background text-sm">
          <option value="all">{admin.common.all}</option>
          <option value="active">{admin.common.active}</option>
          <option value="inactive">{admin.common.inactive}</option>
        </select>
      </div>

      {showForm && (
        <ProcedureForm
          editingId={editingId}
          onSubmit={async (data) => {
            if (editingId) {
              await updateProcedure({ id: editingId, ...data });
              toast.success(admin.toast.saved);
            } else {
              await createProcedure(data);
              toast.success(admin.toast.saved);
            }
            setShowForm(false);
            setEditingId(null);
          }}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
        />
      )}

      <div className="space-y-3">
        {!procedures ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
            {admin.common.loading}
          </CardContent></Card>
        ) : procedures.length === 0 ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">
            <p>{admin.procedures.empty}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => { setShowForm(true); setEditingId(null); }}
            >
              <Plus className="h-4 w-4" /> {admin.procedures.emptyAction}
            </Button>
          </CardContent></Card>
        ) : (filteredProcedures || []).length === 0 ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">{admin.procedures.noResults}</CardContent></Card>
        ) : (
          (filteredProcedures || []).map((proc, index) => {
            const IconComp = getProcedureIcon(proc.slug, proc.icon);
            return (
            <Card key={proc._id} className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <IconComp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{proc.titleEn}</p>
                    <p className="text-sm text-muted-foreground truncate">{proc.titleAr}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingId(proc._id);
                      setShowForm(true);
                    }}
                    className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    title={admin.common.edit} aria-label={admin.common.edit}
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(proc._id, proc.isActive)}
                    className={cn(
                      "p-2.5 rounded-lg transition-colors",
                      proc.isActive ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"
                    )}
                    title={proc.isActive ? admin.common.inactive : admin.common.active}
                    aria-label={proc.isActive ? admin.common.inactive : admin.common.active}
                  >
                    {proc.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={async () => { await updateProcedure({ id: proc._id, isFeatured: !proc.isFeatured }); toast.success(admin.toast.saved); }}
                    className={cn(
                      "p-2.5 rounded-lg transition-colors",
                      proc.isFeatured ? "text-amber-500 hover:bg-amber-50" : "text-muted-foreground hover:bg-muted"
                    )}
                    title={admin.common.featured}
                    aria-label={admin.common.featured}
                  >
                    <Star className={cn("h-4 w-4", proc.isFeatured && "fill-amber-400")} />
                  </button>
                  <button onClick={() => handleDelete(proc._id)} className="p-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title={admin.common.delete} aria-label={admin.common.delete}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col gap-0.5 border-s border-border/40 ps-2 ms-1">
                    <button disabled={index === 0} onClick={() => swapOrder(procedures!, index, "up", updateProcedure)} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors" aria-label={admin.common.moveUp}><ArrowUp className="h-3 w-3" /></button>
                    <button disabled={index === procedures!.length - 1} onClick={() => swapOrder(procedures!, index, "down", updateProcedure)} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors" aria-label={admin.common.moveDown}><ArrowDown className="h-3 w-3" /></button>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={admin.confirm.title}
        message={admin.confirm.deleteProcedure}
        isLoading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await removeProcedure({ id: deleteTarget });
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

function ProcedureForm({
  onSubmit,
  onCancel,
  editingId,
}: {
  onSubmit: (data: {
    slug: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    longDescriptionAr: string;
    longDescriptionEn: string;
    icon: string;
    category: string;
    duration: string;
    recovery: string;
    price?: string;
    image?: string;
    gallery?: string[];
    beforeImage?: string;
    afterImage?: string;
    seoTitleAr?: string;
    seoTitleEn?: string;
    seoDescriptionAr?: string;
    seoDescriptionEn?: string;
    ogImage?: string;
    isActive: boolean;
    isFeatured?: boolean;
    order: number;
    parentSlug?: string;
  }) => Promise<void>;
  onCancel: () => void;
  editingId: Id<"procedures"> | null;
}) {
  const admin = useAdminText();
  const procedures = useQuery(api.procedures.list);
  const existing = editingId ? procedures?.find((p) => p._id === editingId) : null;
  const parentOptions = useMemo(
    () => (procedures || []).filter((p) => p.isActive && !p.parentSlug),
    [procedures]
  );
  const [loading, setLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(() => normalizeStoredIcon(existing?.slug ?? "", existing?.icon ?? ""));
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [imageUrl, setImageUrl] = useState(existing?.image || "");
  const [beforeImageUrl, setBeforeImageUrl] = useState(existing?.beforeImage || "");
  const [afterImageUrl, setAfterImageUrl] = useState(existing?.afterImage || "");
  const [ogImageUrl, setOgImageUrl] = useState(existing?.ogImage || "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(existing?.gallery || []);

  const addGalleryImage = (url: string) => setGalleryUrls((prev) => [...prev, url]);
  const removeGalleryImage = (index: number) => setGalleryUrls((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await onSubmit({
      slug: fd.get("slug") as string,
      titleAr: fd.get("titleAr") as string,
      titleEn: fd.get("titleEn") as string,
      descriptionAr: fd.get("descriptionAr") as string,
      descriptionEn: fd.get("descriptionEn") as string,
      longDescriptionAr: fd.get("longDescriptionAr") as string,
      longDescriptionEn: fd.get("longDescriptionEn") as string,
      icon: selectedIcon,
      image: imageUrl || undefined,
      beforeImage: beforeImageUrl || undefined,
      afterImage: afterImageUrl || undefined,
      ogImage: ogImageUrl || undefined,
      gallery: galleryUrls.length > 0 ? galleryUrls : undefined,
      price: (fd.get("price") as string) || undefined,
      isFeatured: !!fd.get("isFeatured"),
      category: (fd.get("category") as string) || "general",
      parentSlug: (fd.get("parentSlug") as string) || undefined,
      duration: (fd.get("duration") as string) || "1-2 hours",
      recovery: (fd.get("recovery") as string) || "1-2 weeks",
      seoTitleEn: (fd.get("seoTitleEn") as string) || undefined,
      seoTitleAr: (fd.get("seoTitleAr") as string) || undefined,
      seoDescriptionEn: (fd.get("seoDescriptionEn") as string) || undefined,
      seoDescriptionAr: (fd.get("seoDescriptionAr") as string) || undefined,
      isActive: existing?.isActive ?? true,
      order: existing?.order ?? 0,
    });
    setLoading(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">{editingId ? admin.procedures.edit : admin.procedures.addTitle}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{admin.content.titleEn}</Label>
              <Input name="titleEn" required defaultValue={existing?.titleEn} placeholder="Rhinoplasty" />
            </div>
            <div className="space-y-2">
              <Label>{admin.content.titleAr}</Label>
              <Input name="titleAr" dir="rtl" required defaultValue={existing?.titleAr} placeholder="تجميل الأنف" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{admin.procedures.slug}</Label>
              <Input name="slug" required defaultValue={existing?.slug} placeholder="rhinoplasty" />
            </div>
            <div className="space-y-2">
              <Label>{admin.procedures.category}</Label>
              <Input name="category" defaultValue={existing?.category} placeholder="الوجه" />
            </div>
            <div className="space-y-2">
              <Label>{admin.procedures.price}</Label>
              <Input name="price" defaultValue={existing?.price} placeholder="From $3000" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{admin.procedures.parent}</Label>
              <select
                name="parentSlug"
                defaultValue={existing?.parentSlug || ""}
                className="w-full border border-border/60 rounded-lg px-3 py-2 bg-white/40 text-sm"
              >
                <option value="">{admin.procedures.parentNone}</option>
                {parentOptions.map((p) => (
                  <option key={p._id} value={p.slug}>
                    {p.titleAr || p.titleEn}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">{admin.procedures.parentHint}</p>
            </div>
            <div className="space-y-2">
              <Label>{admin.procedures.duration}</Label><Input name="duration" defaultValue={existing?.duration} placeholder="1-2 hours" />
            </div>
          </div>
          <div className="space-y-2"><Label>{admin.procedures.recovery}</Label><Input name="recovery" defaultValue={existing?.recovery} placeholder="1-2 weeks" /></div>
          <div className="space-y-2">
            <Label>{admin.procedures.icon}</Label>
            <div className="relative">
              <button type="button" onClick={() => setShowIconPicker(!showIconPicker)} className="w-full flex items-center justify-between px-3 py-2 border border-border/60 rounded-lg bg-white/40 text-sm">
                <span className="flex items-center gap-2">
                  {(() => {
                    const IconComp = PROCEDURE_ICON_MAP[selectedIcon as keyof typeof PROCEDURE_ICON_MAP];
                    const label = PROCEDURE_ICON_LABELS[selectedIcon as keyof typeof PROCEDURE_ICON_LABELS];
                    return (<>
                      <IconComp className="h-4 w-4 text-primary" />
                      {label ? label.ar : selectedIcon}
                    </>);
                  })()}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showIconPicker && (
                <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-border/40 p-3 max-h-64 overflow-y-auto">
                  <input type="text" placeholder={admin.procedures.iconSearch} className="w-full mb-2 px-3 py-1.5 border border-border/60 rounded-lg text-sm bg-white" onChange={(e) => {
                    const query = e.target.value.toLowerCase();
                    document.querySelectorAll('[data-icon-btn]').forEach((btn) => {
                      const name = (btn as HTMLElement).dataset.iconName || "";
                      (btn as HTMLElement).style.display = name.toLowerCase().includes(query) ? "" : "none";
                    });
                  }} />
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                    {iconOptions.map((key) => {
                      const IconComp = PROCEDURE_ICON_MAP[key as keyof typeof PROCEDURE_ICON_MAP];
                      const label = PROCEDURE_ICON_LABELS[key as keyof typeof PROCEDURE_ICON_LABELS];
                      const selected = selectedIcon === key;
                      return (
                        <button key={key} type="button" data-icon-btn data-icon-name={`${key} ${label.en} ${label.ar}`} onClick={() => { setSelectedIcon(key); setShowIconPicker(false); }} className={cn("p-2 rounded-lg flex flex-col items-center gap-1 hover:bg-primary/10 transition-colors", selected && "bg-primary/10 ring-1 ring-primary")}>
                          <IconComp className="h-5 w-5 text-primary" />
                          <span className="text-[9px] text-muted-foreground leading-none truncate w-full text-center">{label.ar}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2"><Label>{admin.procedures.shortDescEn}</Label><Textarea name="descriptionEn" rows={2} required defaultValue={existing?.descriptionEn} placeholder="Brief description..." /></div>
          <div className="space-y-2"><Label>{admin.procedures.shortDescAr}</Label><Textarea name="descriptionAr" dir="rtl" rows={2} required defaultValue={existing?.descriptionAr} placeholder="وصف مختصر..." /></div>
          <div className="space-y-2"><Label>{admin.procedures.fullDescEn}</Label><Textarea name="longDescriptionEn" rows={4} required defaultValue={existing?.longDescriptionEn} placeholder="Detailed description..." /></div>
          <div className="space-y-2"><Label>{admin.procedures.fullDescAr}</Label><Textarea name="longDescriptionAr" dir="rtl" rows={4} required defaultValue={existing?.longDescriptionAr} placeholder="وصف تفصيلي..." /></div>

          {/* Images */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">{admin.procedures.images}</Label>
            <div className="space-y-2">
              <Label>{admin.procedures.mainImage}</Label>
              <MediaSelector value={imageUrl} onChange={setImageUrl} label={admin.procedures.mainImage} hint="يُزرع 4:3 في الرئيسية و16:10 في صفحة الإجراءات — يُنصح بقصّها أفقية واضحة" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{admin.procedures.beforeImage}</Label>
                <MediaSelector value={beforeImageUrl} onChange={setBeforeImageUrl} label={admin.procedures.beforeImage} hint="يُزرع 1:1 في صفحة الإجراء و4:3 في صفحة قبل/بعد — ضَع الوجه/المنطقة بالمنتصف" />
              </div>
              <div className="space-y-2">
                <Label>{admin.procedures.afterImage}</Label>
                <MediaSelector value={afterImageUrl} onChange={setAfterImageUrl} label={admin.procedures.afterImage} hint="يُزرع 1:1 في صفحة الإجراء و4:3 في صفحة قبل/بعد — ضَع الوجه/المنطقة بالمنتصف" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{admin.procedures.ogImage}</Label>
              <MediaSelector value={ogImageUrl} onChange={setOgImageUrl} label={admin.procedures.ogImage} hint="صورة المشاركة على السوشيال — يُنصح 1200×630 (نسبة 1.91:1)" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>{admin.procedures.gallery}</span>
                <Button type="button" variant="outline" size="sm" onClick={() => addGalleryImage("")}>+ {admin.procedures.addImage}</Button>
              </Label>
              <p className="text-xs text-muted-foreground">{admin.procedures.galleryHint}</p>
              <div className="space-y-3">
                {galleryUrls.map((url, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <MediaSelector value={url} onChange={(newUrl) => {
                        const updated = [...galleryUrls];
                        updated[i] = newUrl;
                        setGalleryUrls(updated);
                      }} label={`${admin.procedures.gallery} ${i + 1}`} hint="يُزرع مربّعًا 1:1 في معرض صور صفحة الإجراء" />
                    </div>
                    <div className="flex flex-col gap-0.5 mt-7">
                      <button type="button" disabled={i === 0} onClick={() => { const updated = [...galleryUrls]; [updated[i-1], updated[i]] = [updated[i], updated[i-1]]; setGalleryUrls(updated); }} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30" aria-label={admin.common.moveUp}><ArrowUp className="h-3 w-3" /></button>
                      <button type="button" disabled={i === galleryUrls.length - 1} onClick={() => { const updated = [...galleryUrls]; [updated[i], updated[i+1]] = [updated[i+1], updated[i]]; setGalleryUrls(updated); }} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30" aria-label={admin.common.moveDown}><ArrowDown className="h-3 w-3" /></button>
                      <button type="button" className="p-1 text-red-500 hover:bg-red-50 rounded" onClick={() => removeGalleryImage(i)}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">{admin.procedures.seoBlock}</Label>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{admin.procedures.seoTitleEn}</Label><Input name="seoTitleEn" defaultValue={existing?.seoTitleEn} placeholder="Custom SEO title..." /></div>
              <div className="space-y-2"><Label>{admin.procedures.seoTitleAr}</Label><Input name="seoTitleAr" dir="rtl" defaultValue={existing?.seoTitleAr} placeholder="عنوان SEO مخصص..." /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{admin.procedures.seoDescEn}</Label><Textarea name="seoDescriptionEn" rows={2} defaultValue={existing?.seoDescriptionEn} placeholder="Custom SEO description..." /></div>
              <div className="space-y-2"><Label>{admin.procedures.seoDescAr}</Label><Textarea name="seoDescriptionAr" dir="rtl" rows={2} defaultValue={existing?.seoDescriptionAr} placeholder="وصف SEO مخصص..." /></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" name="isFeatured" id="isFeatured" defaultChecked={existing?.isFeatured} className="rounded border-border" />
            <Label htmlFor="isFeatured" className="cursor-pointer">{admin.procedures.featuredHome}</Label>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">{loading ? admin.common.saving : admin.common.save}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>{admin.common.cancel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
