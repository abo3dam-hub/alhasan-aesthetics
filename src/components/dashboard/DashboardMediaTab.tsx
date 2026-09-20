import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Settings, Image as ImageIcon, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useImageUpload } from "@/hooks/use-upload";
import { useResolvedMedia } from "@/hooks/use-resolved-media";
import { ResolvedImage } from "@/components/ResolvedImage";
import { MediaDiagnostics } from "@/components/MediaDiagnostics";
import type { Id } from "@/convex/_generated/dataModel";

function ImageUploadUploadWidget() {
  const { upload, uploading, error } = useImageUpload();
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
          Uploading...
        </div>
      ) : (
        <>
          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            Click or drag to upload
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            JPEG, PNG, WebP, GIF • Max 5MB
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
  const [search, setSearch] = useState("");
  const [repairing, setRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState<string | null>(null);
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
    toast.success("URL copied to clipboard!");
  };

  const handleDelete = async (item: { _id: string; storageId: string; url: string; name: string }) => {
    setDeleteTarget({ _id: item._id, storageId: item.storageId, name: item.name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeMedia({ id: deleteTarget._id as Id<"media"> });
      toast.success("Image deleted");
      if (previewItem?._id === deleteTarget._id) setPreviewItem(null);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Media Library</h2>
        <span className="text-sm text-muted-foreground">
          {mediaItems?.length ?? 0} images
        </span>
      </div>

      {/* Upload Area */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <ImageUploadUploadWidget />
        </CardContent>
      </Card>

      {/* Repair Media URLs */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <Settings className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Repair Media URLs</p>
                <p className="text-sm text-muted-foreground">Fix media records with broken/empty URLs (idempotent)</p>
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
                  setRepairResult(result || "Done");
                  toast.success(result || "Media URLs repaired!");
                } catch {
                  toast.error("Failed to repair media URLs.");
                }
                setRepairing(false);
              }}
            >
              {repairing ? "Repairing..." : "Repair Media URLs"}
            </Button>
          </div>
          {repairResult && (
            <p className="mt-3 text-sm text-muted-foreground">{repairResult}</p>
          )}
        </CardContent>
      </Card>

      {/* Diagnostics */}
      <MediaDiagnostics />

      {/* Search */}
      {mediaItems && mediaItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>
      )}

      {/* Gallery Grid */}
      {!mediaItems || mediaItems.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-medium">No images yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Upload your first image above to get started.
            </p>
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.resolvedUrl || item.url); }}
                  className="p-2 rounded-full bg-white/90 hover:bg-white text-foreground shadow-md transition-colors"
                  title="Copy URL"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                  className="p-2 rounded-full bg-white/90 hover:bg-red-50 text-red-500 shadow-md transition-colors"
                  title="Delete"
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
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
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
                    {previewItem.type} • {formatSize(previewItem.size)}
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
                  Copy
                </Button>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(previewItem.resolvedUrl || previewItem.url);
                    toast.success("URL copied! Paste it in any image field.");
                  }}
                  className="gap-1"
                >
                  Use in Procedure
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
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete({ ...previewItem, url: previewItem.url })}
                  className="gap-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
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
                <h3 className="font-semibold text-foreground">Delete Image</h3>
                <p className="text-sm text-muted-foreground truncate">{deleteTarget.name}</p>
              </div>
            </div>

            {deleteRefs && deleteRefs.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-amber-600 font-medium">This image is referenced by:</p>
                <ul className="space-y-1">
                  {deleteRefs.map((ref: string) => (
                    <li key={ref} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                      {ref}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-2">Deleting this will break those references.</p>
              </div>
            ) : deleteRefs !== undefined ? (
              <p className="text-sm text-muted-foreground">This image is not referenced by any content.</p>
            ) : (
              <p className="text-sm text-muted-foreground">Checking references...</p>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                size="sm"
                variant={deleteRefs && deleteRefs.length > 0 ? "destructive" : "destructive"}
                disabled={deleteRefs === undefined}
                onClick={confirmDelete}
                className={deleteRefs && deleteRefs.length > 0 ? "" : "bg-red-600 text-white hover:bg-red-700"}
              >
                {deleteRefs && deleteRefs.length > 0 ? "Delete Anyway" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}