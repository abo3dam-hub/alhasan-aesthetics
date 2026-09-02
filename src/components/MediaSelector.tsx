import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageIcon, Search, X, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImageUpload } from "@/hooks/use-upload";

interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export function MediaSelector({ value, onChange, label, className }: MediaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative group w-24 h-24 rounded-xl overflow-hidden border border-border/60">
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
              <button type="button" onClick={() => setIsOpen(true)} className="p-1.5 rounded-full bg-white/90 hover:bg-white text-foreground shadow-sm" aria-label="Replace image">
                <Upload className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onChange("")} className="p-1.5 rounded-full bg-white/90 hover:bg-red-50 text-red-500 shadow-sm" aria-label="Remove image">
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
            <span className="text-xs text-muted-foreground">Select Image</span>
          </button>
        )}
      </div>

      {isOpen && (
        <MediaLibraryModal
          selectedUrl={value}
          search={search}
          onSearch={setSearch}
          onSelect={(url) => { onChange(url); setIsOpen(false); setSearch(""); }}
          onClose={() => { setIsOpen(false); setSearch(""); }}
        />
      )}
    </div>
  );
}

function MediaLibraryModal({
  selectedUrl,
  search,
  onSearch,
  onSelect,
  onClose,
}: {
  selectedUrl: string;
  search: string;
  onSearch: (s: string) => void;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const mediaItems = useQuery(api.media.list);
  const { upload, uploading } = useImageUpload();
  const [dragOver, setDragOver] = useState(false);

  const filtered = mediaItems?.filter((item) =>
    !search || item.name.toLowerCase().includes(search.toLowerCase())
  );

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Media Library"
    >
      <div
        className="relative bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Media Library</h3>
            {mediaItems && <span className="text-sm text-muted-foreground">({mediaItems.length})</span>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Close media selector">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "mx-4 mt-4 h-20 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all",
            dragOver ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/50",
            uploading && "opacity-50 pointer-events-none"
          )}
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleFile(f); }; input.click(); }}
        >
          {uploading ? (
            <span className="text-sm text-muted-foreground">Uploading...</span>
          ) : (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Upload className="h-4 w-4" /> Click or drag to upload
            </span>
          )}
        </div>

        {/* Search */}
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="ps-9"
              aria-label="Search media library"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {!filtered || filtered.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {filtered.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => onSelect(item.url)}
                    className={cn(
                      "relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:shadow-md group",
                      isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-border/60"
                    )}
                    aria-label={`Select ${item.name}`}
                    aria-pressed={isSelected}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isSelected && (
                      <div className="absolute top-2 end-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                    )}
                    <p className="absolute bottom-0 inset-x-0 p-1.5 text-[10px] text-white font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.name}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border/40">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
