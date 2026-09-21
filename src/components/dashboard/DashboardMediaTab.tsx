import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Settings, Image as ImageIcon, SearchCheck, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useImageUpload } from "@/hooks/use-upload";
import { useAdminText } from "@/hooks/use-admin-text";
import { useResolvedMedia } from "@/hooks/use-resolved-media";
import { ResolvedImage } from "@/components/ResolvedImage";
import { MediaDiagnostics } from "@/components/MediaDiagnostics";
import type { Id } from "@/convex/_generated/dataModel";

function ImageUploadUploadWidget() {
  const { upload, uploading, error } = useImageUpload();
  const admin = useAdminText();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    await upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all",
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border/40 hover:border-primary/50 hover:bg-white/20",
        uploading && "opacity-50 pointer-events-none"
      )}
    >
      {uploading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          {admin.media.uploading}
        </div>
      ) : (
        <>
          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            {admin.media.uploadHelp}
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            {admin.media.uploadFormats}
          </p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={(e) => {
          const files = e.target.files;
          if (files) {
            Array.from(files).forEach((f) => handleFile(f));
          }
          e.target.value = "";
        }}
        className="hidden"
      />
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default function DashboardMediaTab() {
  const mediaItems = useQuery(api.media.list);
  const removeMedia = useMutation(api.media.remove);
  const repairUrls = useMutation(api.media.repairUrls);
  const admin = useAdminText();
  const [search, setSearch] = useState("");
  const [repairing, setRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewItem, setPreviewItem] = useState<
    { url: string; resolvedUrl?: string; name: string; type: string; size: number; storageId: string; _id: string } | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<{ _id: string; storageId: string; name: string } | null>(null);
  const deleteRefs = useQuery(api.media.checkReferences, deleteTarget ? { storageId: deleteTarget.storageId } : "skip");

  const resolvedMediaItems = useResolvedMedia(mediaItems);

  const filteredMedia = resolvedMediaItems?.filter((item) => {
    if (!search) return true;
    return item.name.toLowerCase().includes(search.toLowerCase());
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success(admin.toast.urlCopied);
  };

  const handleDelete = async (item: { _id: string; storageId: string; url: string; name: string }) => {
    setDeleteTarget({ _id: item._id, storageId: item.storageId, name: item.name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeMedia({ id: deleteTarget._id as Id<"media"> });
      toast.success(admin.toast.imageDeleted);
      if (previewItem?._id === deleteTarget._id) setPreviewItem(null);
      setDeleteTarget(null);
    } catch {
      toast.error(admin.toast.imageDeleteError);
    }
  };

  const showEmptyState = !!mediaItems && mediaItems.length === 0;
  const showNoResults = !!mediaItems && mediaItems.length > 0 && (filteredMedia?.length ?? 0) === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-foreground">{admin.media.title}</h2>
        <span className="text-sm text-muted-foreground">
          {admin.media.imagesCount.replace("{count}", String(mediaItems?.length ?? 0))}
        </span>
      </div>

      {/* Upload Area */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <ImageUploadUploadWidget />
        </CardContent>
      </Card>

      {/* Repair + Diagnostics → advanced */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h3 className="font-medium text-foreground">{admin.advancedTitle}</h3>
              <p className="text-sm text-muted-foreground">{admin.media.repairHint}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAdvanced((s) => !s)}
              className="gap-2"
            >
              {showAdvanced ? admin.lessDetails : admin.moreDetails}
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {showAdvanced && (
            <div className="mt-5 space-y-4">
              {/* Repair Media URLs */}
              <Card className="border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{admin.media.repairTitle}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={repairing}
                      onClick={async () => {
                        setRepairing(true);
                        setRepairResult(null);
                        try {
                          const result = await repairUrls();
                          setRepairResult(result || admin.toast.mediaRepaired);
                          toast.success(result || admin.toast.mediaRepaired);
                        } catch {
                          toast.error(admin.toast.mediaRepairError);
                        }
                        setRepairing(false);
                      }}
                    >
                      {repairing ? admin.media.repairing : admin.media.repair}
                    </Button>
                  </div>
                  {repairResult && (
                    <p className="mt-3 text-sm text-muted-foreground">{repairResult}</p>
                  )}
                </CardContent>
              </Card>

              {/* Diagnostics */}
              <MediaDiagnostics />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      {mediaItems && mediaItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder={admin.media.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>
      )}

      {/* Gallery Grid */}
      {!mediaItems ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center text-muted-foreground">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            {admin.common.loading}
          </CardContent>
        </Card>
      ) : showEmptyState ? (
        <Card className="border-border/60">
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-medium">{admin.media.noImagesTitle}</p>
            <p className="text-sm text-muted-foreground/70 mt-1">{admin.media.noImagesDesc}</p>
          </CardContent>
        </Card>
      ) : showNoResults ? (
        <Card className="border-border/60">
          <CardContent className="p-10 text-center">
            <SearchCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">{admin.media.noSearchResults}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {(filteredMedia || []).map((item) => (
            <div
              key={item._id}
              className="group relative glass-card rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => setPreviewItem({ ...item, resolvedUrl: item.resolvedUrl })}
            >
              <div className="aspect-square overflow-hidden bg-muted/30">
                <ResolvedImage
                  storageId={item.storageId}
                  alt={item.name}
                  fallbackClassName="aspect-square"
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-foreground truncate">
                  {item.name}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">
                    {formatSize(item.size)}
                  </p>
                  {item.uploadedAt && (
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 pointer-coarse:bg-black/30 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100">
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.resolvedUrl || item.url); }}
                  className="p-2 rounded-full bg-white/90 hover:bg-white text-foreground shadow-md transition-colors"
                  title={admin.media.copyUrl}
                  aria-label={admin.media.copyUrl}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                  className="p-2 rounded-full bg-white/90 hover:bg-red-50 text-red-500 shadow-md transition-colors"
                  title={admin.media.delete}
                  aria-label={admin.media.delete}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative bg-background rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-3 end-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label={admin.common.close}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Image */}
            <div className="bg-black/20 flex items-center justify-center p-4">
              <ResolvedImage
                storageId={previewItem.storageId}
                alt={previewItem.name}
                imgClassName="max-h-[60vh] max-w-full object-contain rounded-lg"
                fallbackClassName="max-h-[60vh] w-full"
              />
            </div>

            {/* Info & Actions */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {previewItem.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatSize(previewItem.size)}
                  </p>
                </div>
              </div>

              {/* URL field */}
              <div className="flex gap-2">
                <Input
                                    value={previewItem.resolvedUrl || previewItem.url} readOnly
                  className="font-mono text-xs flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(previewItem.resolvedUrl || previewItem.url)}
                  className="shrink-0 gap-1"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {admin.common.copy}
                </Button>
              </div>

              <div className="flex gap-2 pt-1 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(previewItem.resolvedUrl || previewItem.url);
                    toast.success(admin.toast.urlCopied);
                  }}
                  className="gap-1"
                >
                  {admin.media.useInContent}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = previewItem.resolvedUrl || previewItem.url;
                    link.download = previewItem.name;
                    link.click();
                  }}
                  className="gap-1"
                >
                  {admin.media.download}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete({ ...previewItem, url: previewItem.url })}
                  className="gap-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {admin.media.delete}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation with Reference Check */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="relative bg-background rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{admin.media.delete}</h3>
                <p className="text-sm text-muted-foreground truncate">{deleteTarget.name}</p>
              </div>
            </div>

            {deleteRefs && deleteRefs.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-600">
                  {admin.confirm.imageReferencedBy}
                </p>
                <p className="text-sm text-muted-foreground">
                  {admin.confirm.imageReferenceWarning.replace("{count}", String(deleteRefs.length))}
                </p>
              </div>
            ) : deleteRefs !== undefined ? (
              <p className="text-sm text-muted-foreground">{admin.confirm.imageNotReferenced}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{admin.confirm.checkingReferences}</p>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                {admin.common.cancel}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={deleteRefs === undefined}
                onClick={confirmDelete}
              >
                {deleteRefs && deleteRefs.length > 0 ? admin.confirm.deleteAnyway : admin.common.delete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}