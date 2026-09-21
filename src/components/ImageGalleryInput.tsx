import { useRef, useState } from "react";
import { Loader2, Plus, X, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResolvedImage } from "@/components/ResolvedImage";
import { useImageUpload } from "@/hooks/use-upload";
import { useAdminText } from "@/hooks/use-admin-text";
import { MediaLibraryModal } from "@/components/MediaLibraryModal";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

interface ImageGalleryInputProps {
  value: string[];
  onChange: (storageIds: string[]) => void;
  label?: string;
  hint?: ReactNode;
  className?: string;
}

/**
 * Multi-image input for the admin dashboard. Supports two add sources:
 *   1. Upload new files → Convex Storage (thumbs appended).
 *   2. Pick existing images from the media library (multi-select toggle).
 * Thumbnails can be removed individually.
 */
export function ImageGalleryInput({ value, onChange, label, hint, className }: ImageGalleryInputProps) {
  const admin = useAdminText();
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const uploader = useImageUpload();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const list = Array.from(files);
    const ids: string[] = [];
    for (const file of list) {
      const result = await uploader.upload(file);
      if (result) ids.push(result.storageId);
    }
    if (ids.length > 0) {
      const merged = [...value];
      for (const id of ids) if (!merged.includes(id)) merged.push(id);
      onChange(merged);
    }
    setUploading(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}

      <div className="flex flex-wrap items-center gap-3">
        {value.map((id) => (
          <div
            key={id}
            className="relative group w-20 h-20 rounded-xl overflow-hidden border border-border/60 shrink-0"
          >
            <ResolvedImage storageId={id} alt="" imgClassName="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== id))}
              className="absolute top-1.5 end-1.5 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100 transition-opacity hover:bg-red-500"
              aria-label={admin.media.removeImage}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all shrink-0",
            uploading
              ? "border-border/30 opacity-60 cursor-wait"
              : "border-border/40 cursor-pointer hover:border-primary/50 hover:bg-white/20"
          )}
          title={admin.media.upload}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : (
            <>
              <Plus className="h-5 w-5 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground leading-none px-1 text-center">
                {admin.media.upload}
              </span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setPickerSearch(""); setPickerOpen(true); }}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-1 transition-all shrink-0 cursor-pointer hover:border-primary/50 hover:bg-white/20"
          title={admin.media.fromLibrary}
        >
          <Images className="h-5 w-5 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground leading-none px-1 text-center">
            {admin.media.fromLibrary}
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={(e) => { void handleFiles(e.target.files); e.target.value = ""; }}
        className="hidden"
      />

      {hint && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground/80 leading-relaxed">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
          <span>{hint}</span>
        </p>
      )}

      {uploader.error && <p className="text-xs text-red-500">{uploader.error}</p>}

      {pickerOpen && (
        <MediaLibraryModal
          selectedUrls={value}
          search={pickerSearch}
          onSearch={setPickerSearch}
          onPick={(id) => {
            if (value.includes(id)) onChange(value.filter((v) => v !== id));
            else onChange([...value, id]);
          }}
          onUploaded={(id) => {
            if (!value.includes(id)) onChange([...value, id]);
          }}
          onClose={() => { setPickerOpen(false); setPickerSearch(""); }}
          title={admin.media.choosePhotos}
        />
      )}
    </div>
  );
}