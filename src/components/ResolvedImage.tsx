"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ResolvedImage — renders an image from any reference (URL or Convex storageId).
 * 
 * State model:
 * - ref empty → "No image"
 * - ref present, query loading (undefined) → Loading skeleton
 * - ref present, query resolved with URL → <img>
 * - ref present, query resolved empty → "No image" (storage missing)
 * - ref present, <img> onError → "Image unavailable"
 * 
 * CRITICAL: resolved === undefined means the query is still loading.
 * resolved === "" means the query completed but the storage object doesn't exist.
 * These are DIFFERENT states and must not be conflated.
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

  // Reset loadError when the reference changes
  useEffect(() => {
    setLoadError(false);
  }, [safeRef]);

  // ── Empty reference → No image ──
  if (!safeRef) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/30", fallbackClassName || className)}>
        <div className="text-center p-4">
          <ImageIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground/50">No image</p>
        </div>
      </div>
    );
  }

  // ── Query still loading → Show loading skeleton ──
  // IMPORTANT: resolved === undefined means the query hasn't returned yet.
  // This happens on first render AND after page refresh while the batch resolves.
  // We must NOT treat this as "Image unavailable".
  if (resolved === undefined) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/20", fallbackClassName || className)}>
        <Loader2 className="h-5 w-5 text-muted-foreground/40 animate-spin" />
      </div>
    );
  }

  // ── Query resolved but returned empty string → Storage object missing ──
  if (!resolved) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/30", fallbackClassName || className)}>
        <div className="text-center p-4">
          <ImageIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground/50">No image</p>
        </div>
      </div>
    );
  }

  // ── Image failed to load in browser (onError fired) ──
  if (loadError) {
    if (typeof console !== "undefined") {
      console.warn(`[ResolvedImage] Failed to load: ref="${safeRef}" resolvedUrl="${resolved}"`);
    }
    return (
      <div className={cn("flex items-center justify-center bg-muted/30", fallbackClassName || className)}>
        <div className="text-center p-4">
          <ImageIcon className="h-8 w-8 text-amber-400/50 mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground/50">Image unavailable</p>
        </div>
      </div>
    );
  }

  // ── Render the actual image ──
  return (
    <img
      src={resolved}
      alt={alt}
      className={cn("w-full h-full object-fill", imgClassName)}
      loading={lazy ? "lazy" : "eager"}
      onError={() => setLoadError(true)}
    />
  );
}
