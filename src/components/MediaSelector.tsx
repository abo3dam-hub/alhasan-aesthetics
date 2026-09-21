import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageIcon, X, Upload, Info } from "lucide-react";
import type { ReactNode } from "react";
import { ResolvedImage } from "@/components/ResolvedImage";
import { useAdminText } from "@/hooks/use-admin-text";
import { MediaLibraryModal } from "@/components/MediaLibraryModal";

interface MediaSelectorProps {
  value: string;
  onChange: (storageIdOrUrl: string) => void;
  label?: string;
  hint?: ReactNode;
  className?: string;
}

export function MediaSelector({ value, onChange, label, hint, className }: MediaSelectorProps) {
  const admin = useAdminText();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative group w-24 h-24 rounded-xl overflow-hidden border border-border/60">
            <ResolvedImage storageId={value} alt="" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
              <button type="button" onClick={() => setIsOpen(true)} className="p-1.5 rounded-full bg-white/90 hover:bg-white text-foreground shadow-sm" aria-label={admin.media.replaceImage}>
                <Upload className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onChange("")} className="p-1.5 rounded-full bg-white/90 hover:bg-red-50 text-red-500 shadow-sm" aria-label={admin.media.removeImage}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full h-24 border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-white/20 transition-all"
          >
            <ImageIcon className="h-6 w-6 text-muted-foreground/50 mb-1" />
            <span className="text-xs text-muted-foreground">{admin.media.selectImage}</span>
          </button>
        )}
      </div>

      {hint && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground/80 leading-relaxed">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
          <span>{hint}</span>
        </p>
      )}

      {isOpen && (
        <MediaLibraryModal
          selectedUrls={value ? [value] : []}
          search={search}
          onSearch={setSearch}
          onPick={(storageId) => { onChange(storageId); setIsOpen(false); setSearch(""); }}
          onClose={() => { setIsOpen(false); setSearch(""); }}
        />
      )}
    </div>
  );
}