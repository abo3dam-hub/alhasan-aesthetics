import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAdminText } from "@/hooks/use-admin-text";
import { useVideoUpload } from "@/hooks/use-upload";
import { Film, Home, Play, Plus, Pencil, Trash2, Eye, EyeOff, Square } from "lucide-react";
import { MediaSelector } from "@/components/MediaSelector";
import { ConfirmDialog } from "./ConfirmDialog";
import { cn } from "@/lib/utils";

interface VideoItem {
  id: string;
  storageId: string;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  poster?: string;
  isActive: boolean;
  showOnHome: boolean;
  uploadedAt?: number;
  uploadedBy?: string;
  fileName?: string;
  size?: number;
  mimeType?: string;
  url: string;
  posterUrl: string;
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)}MB` : `${Math.round(bytes / 1024)}KB`;
}

function toVideoInput(rec: VideoItem) {
  return {
    id: rec.id,
    storageId: rec.storageId,
    titleAr: rec.titleAr,
    titleEn: rec.titleEn,
    descriptionAr: rec.descriptionAr,
    descriptionEn: rec.descriptionEn,
    poster: rec.poster,
    isActive: rec.isActive,
    showOnHome: rec.showOnHome,
    uploadedAt: rec.uploadedAt,
    uploadedBy: rec.uploadedBy,
    fileName: rec.fileName,
    size: rec.size,
    mimeType: rec.mimeType,
  };
}

export default function VideoSectionEditor() {
  const admin = useAdminText();
  const videos = useQuery(api.videos.listAll);
  const saveVideo = useMutation(api.videos.saveVideo);
  const removeVideo = useMutation(api.videos.deleteVideo);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VideoItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const handleOpenForm = (video: VideoItem | null) => {
    setEditing(video);
    setShowForm(true);
  };

  const toggleField = async (video: VideoItem, patch: Partial<Pick<VideoItem, "isActive" | "showOnHome">>) => {
    try {
      await saveVideo({ video: { ...toVideoInput(video), ...patch } });
      toast.success(admin.toast.videoSaved);
    } catch {
      toast.error(admin.toast.videoSaveError);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeVideo({ id: deleteTarget.id });
      toast.success(admin.toast.videoDeleted);
      setDeleteTarget(null);
    } catch {
      toast.error(admin.toast.videoDeleteError);
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-3">
          <div>
            <CardTitle className="text-lg">{admin.videos.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{admin.videos.subtitle}</p>
          </div>
          <Button onClick={() => handleOpenForm(null)} className="gap-2 bg-primary text-primary-foreground shrink-0">
            <Plus className="h-4 w-4" /> {admin.videos.add}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {!videos ? (
            <p className="text-sm text-muted-foreground animate-pulse">…</p>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Film className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{admin.videos.empty}</p>
            </div>
          ) : (
            videos.map((video) => {
              const title = video.titleAr || video.titleEn || admin.videos.untitled;
              return (
                <div key={video.id} className="rounded-xl border border-border/60 overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    <div className="relative h-16 w-11 shrink-0 rounded-lg overflow-hidden bg-[#1E1E1E] flex items-center justify-center">
                      {video.posterUrl ? (
                        <img src={video.posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <Film className="h-5 w-5 text-secondary/50" />
                      )}
                      {!video.isActive && <EyeOff className="absolute h-4 w-4 text-white/80 drop-shadow" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {video.fileName || ("video." + (video.mimeType ?? "mp4"))} {video.size ? `· ${formatBytes(video.size)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title={admin.videos.activeLabel}
                        aria-pressed={video.isActive}
                        onClick={() => toggleField(video, { isActive: !video.isActive })}
                        className={cn("p-2 rounded-lg transition-colors", video.isActive ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted")}
                      >
                        {video.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        title={admin.videos.showOnHomeLabel}
                        aria-pressed={video.showOnHome}
                        onClick={() => toggleField(video, { showOnHome: !video.showOnHome })}
                        className={cn("p-2 rounded-lg transition-colors", video.showOnHome ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted")}
                      >
                        <Home className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title={previewId === video.id ? admin.videos.closePreview : admin.videos.preview}
                        onClick={() => setPreviewId(previewId === video.id ? null : video.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                      >
                        {previewId === video.id ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button type="button" title={admin.videos.edit} onClick={() => handleOpenForm(video)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" title={admin.videos.delete} onClick={() => setDeleteTarget(video)} className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {previewId === video.id && video.url && (
                    <video src={video.url} controls muted playsInline preload="none" className="w-full max-h-72 bg-black" />
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {showForm && (
        <VideoForm
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={admin.confirm.deleteVideoTitle}
        message={admin.confirm.deleteVideoMsg}
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}

function VideoForm({ initial, onClose }: { initial: VideoItem | null; onClose: () => void }) {
  const admin = useAdminText();
  const saveVideo = useMutation(api.videos.saveVideo);
  const replaceVideoFile = useMutation(api.videos.replaceVideoFile);
  const { upload, uploading, error, reset } = useVideoUpload();

  const [titleAr, setTitleAr] = useState(initial?.titleAr ?? "");
  const [titleEn, setTitleEn] = useState(initial?.titleEn ?? "");
  const [descriptionAr, setDescriptionAr] = useState(initial?.descriptionAr ?? "");
  const [descriptionEn, setDescriptionEn] = useState(initial?.descriptionEn ?? "");
  const [poster, setPoster] = useState(initial?.poster ?? "");
  const [showOnHome, setShowOnHome] = useState(initial?.showOnHome ?? true);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setFile(next);
    setObjectUrl(next ? URL.createObjectURL(next) : "");
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!initial && !file) {
      setFormError(admin.videos.fileRequired);
      return;
    }

    setSaving(true);
    try {
      let storageId: string | undefined;
      let fileName: string | undefined;
      let size: number | undefined;
      let mimeType: string | undefined;

      if (file) {
        const result = await upload(file);
        if (!result) {
          setSaving(false);
          return;
        }
        storageId = result.storageId;
        fileName = result.name;
        size = result.size;
        mimeType = result.type;
        if (initial) {
          await replaceVideoFile({ id: initial.id, storageId, fileName, size, mimeType });
        }
      }

      const id = initial?.id ?? (typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `v-${Date.now()}`);
      await saveVideo({
        video: {
          id,
          storageId: storageId ?? initial!.storageId,
          titleAr,
          titleEn,
          descriptionAr,
          descriptionEn,
          poster,
          isActive,
          showOnHome,
          uploadedAt: initial?.uploadedAt ?? Date.now(),
          uploadedBy: initial?.uploadedBy,
          fileName: fileName ?? initial?.fileName,
          size: size ?? initial?.size,
          mimeType: mimeType ?? initial?.mimeType,
        },
      });

      toast.success(admin.toast.videoSaved);
      reset();
      onClose();
    } catch {
      setFormError(admin.videos.uploadFailed);
    }
    setSaving(false);
  };

  const previewSrc = objectUrl || initial?.url || "";
  const previewPoster = initial?.posterUrl || undefined;
  const displayError = formError || error;

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">{initial ? admin.videos.edit : admin.videos.add}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{admin.videos.titleArLabel}</Label>
              <Input dir="rtl" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="مثال: تجربة مريضة مع تجميل الأنف" />
            </div>
            <div className="space-y-2">
              <Label>{admin.videos.titleEnLabel}</Label>
              <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="e.g. Rhinoplasty patient story" />
            </div>
            <div className="space-y-2">
              <Label>{admin.videos.descriptionArLabel}</Label>
              <Textarea dir="rtl" rows={2} value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{admin.videos.descriptionEnLabel}</Label>
              <Textarea rows={2} value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} />
            </div>
          </div>

          {/* Video file */}
          <div className="space-y-2">
            <Label>{admin.videos.videoFile}</Label>
            <p className="text-xs text-muted-foreground">{admin.videos.videoFileHint}</p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                onChange={handleFileChange}
                className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
              />
              {initial?.fileName && (
                <span className="text-xs text-muted-foreground">
                  {initial.fileName} {initial.size ? `· ${formatBytes(initial.size)}` : ""}
                </span>
              )}
            </div>
            {uploading && <p className="text-xs text-primary animate-pulse">{admin.videos.uploading}</p>}
          </div>

          {/* Orientation / poster */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <MediaSelector value={poster} onChange={setPoster} label={admin.videos.posterLabel} hint={admin.videos.posterHint} />
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5 text-primary" /> {admin.videos.showOnHomeLabel}</p>
              <p className="text-xs">{admin.videos.showOnHomeHint}</p>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-start gap-2 rounded-xl border border-border/60 p-3 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="mt-0.5 accent-primary" />
              <span>
                <span className="block text-sm font-medium text-foreground">{admin.videos.activeLabel}</span>
                <span className="block text-xs text-muted-foreground">{admin.videos.activeHint}</span>
              </span>
            </label>
            <label className="flex items-start gap-2 rounded-xl border border-border/60 p-3 cursor-pointer">
              <input type="checkbox" checked={showOnHome} onChange={(e) => setShowOnHome(e.target.checked)} className="mt-0.5 accent-primary" />
              <span>
                <span className="block text-sm font-medium text-foreground">{admin.videos.showOnHomeLabel}</span>
                <span className="block text-xs text-muted-foreground">{admin.videos.showOnHomeHint}</span>
              </span>
            </label>
          </div>

          {/* Preview before save */}
          {previewSrc && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                {objectUrl ? admin.videos.unsavedPreview : admin.videos.preview}
              </p>
              <video
                key={objectUrl || initial?.url}
                src={previewSrc}
                poster={previewPoster}
                controls
                muted
                playsInline
                preload="none"
                className={cn("w-full rounded-xl bg-black", objectUrl ? "max-h-40" : "max-h-72")}
              />
            </div>
          )}

          {displayError && <p className="text-sm text-red-500">{displayError}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving || uploading}>
              {admin.videos.cancel}
            </Button>
            <Button type="submit" disabled={saving || uploading} className="gap-2 bg-primary text-primary-foreground">
              {saving || uploading ? admin.videos.saving : admin.videos.save}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}