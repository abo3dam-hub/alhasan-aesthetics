"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ResolvedImage — renders an image from any reference (URL or Convex storageId).
 * Automatically resolves storageIds via ctx.storage.getUrl().
 * Shows a broken/empty state when the image cannot be loaded.
 */
export function ResolvedImage({
  ref,
  alt = "",
  className,
  imgClassName,
  fallbackClassName,
  lazy = true,
}: {
  ref: string | undefined | null;
  alt?: string;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  lazy?: boolean;
}) {
  const [loadError, setLoadError] = useState(false);

  const safeRef = ref || "";
  const resolved = useQuery(
    api.media.resolveUrl,
    safeRef ? { ref: safeRef } : "skip"
  );

  // Use resolved URL if available, fall back to original ref
  const src = resolved ?? safeRef;

  if (!src) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/30", fallbackClassName || className)}>
        <div className="text-center p-4">
          <ImageIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground/50">No image</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/30", fallbackClassName || className)}>
        <div className="text-center p-4">
          <ImageIcon className="h-8 w-8 text-amber-400/50 mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground/50">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("w-full h-full object-cover", imgClassName)}
      loading={lazy ? "lazy" : "eager"}
      onError={() => setLoadError(true)}
    />
  );
}
