import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, m as motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ResolvedImage } from "@/components/ResolvedImage";

interface LightboxProps {
  images: string[];
  index: number | null;
  onClose: () => void;
  alt?: string;
  renderHeader?: (activeIndex: number, total: number) => React.ReactNode;
}

/**
 * Reusable fullscreen lightbox for browsing a list of storageIds.
 * Handles keyboard navigation (Escape / Arrow keys) + body scroll lock.
 * Pass `index` and call `onClose()` to dismiss; navigation is internal.
 */
export function Lightbox({ images, index, onClose, alt = "Image", renderHeader }: LightboxProps) {
  const [active, setActive] = useState(index);

  const goPrev = useCallback(() => {
    setActive((a) => (a === null || a === 0 ? images.length - 1 : a - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setActive((a) => (a === null ? 0 : (a + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (index === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, goPrev, goNext, onClose]);

  return (
    <AnimatePresence>
      {index !== null && active !== null && images[active] && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
        >
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 end-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Prev / Next */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute start-3 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute end-3 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>
          {/* Image */}
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {renderHeader && (
              <div className="mb-4 px-2">{renderHeader(active, images.length)}</div>
            )}
            <div className="relative w-full h-[70vh] sm:h-[80vh] flex items-center justify-center">
              <ResolvedImage
                storageId={images[active]}
                key={active}
                alt={`${alt} ${active + 1}`}
                imgClassName="max-w-full max-h-full w-auto h-auto object-contain"
                fallbackClassName="w-full h-full"
                lazy={false}
              />
            </div>
          </div>
          {/* Counter */}
          <div className="absolute bottom-4 inset-x-0 text-center text-sm text-white/80 z-10">
            {active + 1} / {images.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}