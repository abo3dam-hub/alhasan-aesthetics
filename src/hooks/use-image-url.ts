import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";

/**
 * Resolve a single image reference to a working URL.
 * Accepts: full URL, Convex storageId, or empty string.
 * Returns the resolved URL or the original reference as fallback.
 */
export function useImageUrl(ref: string | undefined | null): string {
  const safeRef = ref || "";
  const resolved = useQuery(
    api.media.resolveUrl,
    safeRef ? { ref: safeRef } : "skip"
  );
  // Return the resolved URL if available, otherwise the original ref as fallback
  return resolved ?? safeRef;
}

/**
 * Resolve multiple image references in one batch query.
 * Returns a Record mapping original ref → resolved URL.
 */
export function useImageUrls(refs: (string | undefined | null)[]): Record<string, string> {
  const safeRefs = useMemo(() => {
    const unique = new Set<string>();
    for (const r of refs) {
      if (r) unique.add(r);
    }
    return Array.from(unique);
  }, [refs]);

  const resolved = useQuery(
    api.media.resolveUrls,
    safeRefs.length > 0 ? { refs: safeRefs } : "skip"
  );

  // Build a lookup, falling back to the original ref
  const lookup = useMemo(() => {
    const map: Record<string, string> = {};
    for (const r of safeRefs) {
      map[r] = resolved?.[r] ?? r;
    }
    return map;
  }, [safeRefs, resolved]);

  return lookup;
}
