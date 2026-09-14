import { useRef, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResolvedImage } from "@/components/ResolvedImage";
import { useImageUpload } from "@/hooks/use-upload";
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
 * Multi-image upload input for the admin dashboard.
 * Each file uploads via Convex Storage and the resulting storageId is
 * appended to the array. Thumbnails can be removed individually.
 */
export function ImageGalleryInput({ value, onChange, label, hint, className }: ImageGalleryInputProps) {
  const [uploading, setUploading] = useState(false);
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
    if (ids.length > 0) onChange([...value, ...ids]);
    setUploading(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}

      <div className="flex flex-wrap gap-3">
        {value.map((id) => (
          <div
            key={id}
            className="relative group w-20 h-20 rounded-xl overflow-hidden border border-border/60 shrink-0"
          >
            <ResolvedImage storageId={id} alt="" imgClassName="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== id))}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              aria-label="Remove image"
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
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : (
            <>
              <Plus className="h-5 w-5 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground leading-none px-1 text-center">
                Add Images
              </span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        className="hidden"
      />

      {hint && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground/80 leading-relaxed">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
          <span>{hint}</span>
        </p>
      )}

      {uploader.error && <p className="text-xs text-red-500">{uploader.error}</p>}
    </div>
  );
}