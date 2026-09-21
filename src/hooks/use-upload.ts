import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback } from "react";
import { useAdminText } from "@/hooks/use-admin-text";

export interface UploadResult {
  storageId: string;
  url: string;
}

/**
 * Upload hook — the canonical image upload path.
 *
 * Flow:
 *   file → generateUploadUrl → Convex Storage → storageId
 *   → recordUpload(storageId) → media record
 *
 * The `url` field in the media table is a LEGACY field kept for backward
 * compatibility with old records. New uploads store an empty string here.
 * The frontend resolves ALL images through storageId → ctx.storage.getUrl().
 * Never use media.url as the source of truth for new uploads.
 */
export function useImageUpload() {
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const recordUpload = useMutation(api.media.recordUpload);
  const adminMedia = useAdminText().media;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      // Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

      if (!allowedTypes.includes(file.type)) {
        setError(adminMedia.typeError);
        return null;
      }

      if (file.size > maxSize) {
        setError(adminMedia.sizeError);
        return null;
      }

      setUploading(true);
      setError(null);

      try {
        // Get signed upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload file to Convex storage
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();
        const storageId = result.storageId;

        // Record in media table
        // url is a legacy field — stored empty for new uploads.
        // All image resolution goes through storageId → ctx.storage.getUrl().
        await recordUpload({
          storageId,
          url: "", // LEGACY: empty for new uploads. Resolution via storageId only.
          name: file.name,
          type: file.type,
          size: file.size,
          alt: file.name.replace(/\.[^.]+$/, ""),
        });

        return { storageId, url: "" };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : adminMedia.uploadFailed;
        setError(message === "Upload failed" ? adminMedia.uploadFailed : message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [generateUploadUrl, recordUpload, adminMedia],
  );

  const reset = useCallback(() => {
    setError(null);
    setUploading(false);
  }, []);

  return { upload, uploading, error, reset };
}
