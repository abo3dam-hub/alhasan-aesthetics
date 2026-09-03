import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";

interface MediaItem {
  _id: string;
  storageId: string;
  url: string;
  name: string;
  type: string;
  size: number;
  alt?: string;
  uploadedAt?: number;
  uploadedBy?: string;
}

/**
 * Takes media items and returns them with resolved image URLs.
 * Uses a single batch query for efficiency.
 * Each item gets a `resolvedUrl` property with the correct working URL.
 */
export function useResolvedMedia(items: MediaItem[] | undefined): (MediaItem & { resolvedUrl: string })[] | undefined {
  // Collect all storageIds and URLs to resolve
  const refs = useMemo(() => {
    if (!items) return [];
    const unique = new Set<string>();
    for (const item of items) {
      // Always try to resolve from storageId for reliability
      if (item.storageId) unique.add(item.storageId);
    }
    return Array.from(unique);
  }, [items]);

  const resolvedMap = useQuery(
    api.media.resolveUrls,
    refs.length > 0 ? { refs } : "skip"
  );

  if (!items || !resolvedMap) return undefined;

  return items.map((item) => ({
    ...item,
    // Prefer resolved URL from storageId, fall back to stored URL
    resolvedUrl: (item.storageId && resolvedMap[item.storageId]) || item.url,
  }));
}
