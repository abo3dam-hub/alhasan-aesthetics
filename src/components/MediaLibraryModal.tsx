import { useQuery } from "convex/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ImageIcon, Search, X, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImageUpload } from "@/hooks/use-upload";
import { ResolvedImage } from "@/components/ResolvedImage";
import { api } from "@/convex/_generated/api";

interface MediaLibraryModalProps {
  selectedUrls: string[];
  search: string;
  onSearch: (s: string) => void;
  onPick: (storageId: string) => void;
  onClose: () => void;
  onUploaded?: (storageId: string, name: string) => void;
  title?: string;
}

/**
 * Modal picker against the Convex media library with an inline upload area
 * on top. Used by single-select fields (MediaSelector) and multi-select
 * galleries (ImageGalleryInput). Items are clickable → onPick(storageId);
 * renderers mark items already present in `selectedUrls`.
 */
export function MediaLibraryModal({
  selectedUrls,
  search,
  onSearch,
  onPick,
  onClose,
  onUploaded,
  title = "Media Library",
}: MediaLibraryModalProps) {
  const mediaItems = useQuery(api.media.list);
  const { upload, uploading } = useImageUpload();
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = mediaItems?.filter((item) =>
    !search || item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const result = await upload(file);
      if (result) onUploaded?.(result.storageId, file.name);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
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
            <h3 className="font-semibold text-foreground">{title}</h3>
            {mediaItems && <span className="text-sm text-muted-foreground">({mediaItems.length})</span>}
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Close media selector">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "mx-4 mt-4 h-20 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all",
            dragOver ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/50",
            uploading && "opacity-50 pointer-events-none"
          )}
        >
          {uploading ? (
            <span className="text-sm text-muted-foreground">Uploading...</span>
          ) : (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Upload className="h-4 w-4" /> Click or drag to upload
            </span>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) => { void handleFiles(e.target.files); e.target.value = ""; }}
            className="hidden"
          />
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
                const isSelected =
                  selectedUrls.includes(item.storageId) || selectedUrls.includes(item.url);
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => onPick(item.storageId)}
                    className={cn(
                      "relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:shadow-md group",
                      isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-border/60"
                    )}
                    aria-label={`Select ${item.name}`}
                    aria-pressed={isSelected}
                  >
                    <ResolvedImage
                      storageId={item.storageId}
                      alt={item.name}
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
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}