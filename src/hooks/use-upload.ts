import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback } from "react";

export interface UploadResult {
  storageId: string;
  url: string;
}

export function useImageUpload() {
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const recordUpload = useMutation(api.media.recordUpload);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      // Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a JPEG, PNG, WebP, or GIF image.");
        return null;
      }

      if (file.size > maxSize) {
        setError("Image must be smaller than 5MB.");
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

        // Get the public URL
        const convexUrl = import.meta.env.VITE_CONVEX_URL || 'https://impartial-ladybug-881.convex.cloud';
        const url = `${convexUrl}/api/storage/${storageId}`;

        // Record in media table
        await recordUpload({
          storageId,
          url,
          name: file.name,
          type: file.type,
          size: file.size,
          alt: file.name.replace(/\.[^.]+$/, ""),
        });

        return { storageId, url };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        return null;
      } finally {
        setUploading(false);
      }
    },
    [generateUploadUrl, recordUpload],
  );

  const reset = useCallback(() => {
    setError(null);
    setUploading(false);
  }, []);

  return { upload, uploading, error, reset };
}
