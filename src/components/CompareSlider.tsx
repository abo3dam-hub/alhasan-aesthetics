import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { ResolvedImage } from "@/components/ResolvedImage";
import { cn } from "@/lib/utils";

/** Drag-to-compare slider. The visitor drags (mouse or touch) the handle to
 *  reveal the before/after photos in place. `touch-action: pan-y` lets
 *  vertical page scrolling through the card while horizontal drags drive the
 *  comparison. Keyboard arrows also work. */
export function CompareSlider({
  beforeId,
  afterId,
  beforeAlt,
  afterAlt,
  isRtl,
  className,
  eager = false,
  onInteract,
}: {
  beforeId: string | undefined | null;
  afterId: string | undefined | null;
  beforeAlt: string;
  afterAlt: string;
  isRtl: boolean;
  className?: string;
  eager?: boolean;
  onInteract?: () => void;
}) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const beforeLabel = isRtl ? "قبل" : "Before";
  const afterLabel = isRtl ? "بعد" : "After";

  const updateFromPointer = (clientX: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const raw = isRtl ? rect.right - clientX : clientX - rect.left;
    const pct = (Math.min(Math.max(raw, 0), rect.width) / rect.width) * 100;
    setPos(Math.min(92, Math.max(8, pct)));
  };

  const beforeClip = isRtl
    ? `inset(0 0 0 ${100 - pos}%)`
    : `inset(0 ${100 - pos}% 0 0)`;

  return (
    <div
      role="slider"
      aria-label={isRtl ? "مقارنة قبل وبعد" : "Before / After comparison"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          const delta = e.key === "ArrowLeft" ? -5 : 5;
          setPos((p) => Math.min(92, Math.max(8, p + (isRtl ? -delta : delta))));
          setTouched(true);
          onInteract?.();
        }
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        setTouched(true);
        onInteract?.();
        updateFromPointer(e.clientX, e.currentTarget);
      }}
      onPointerMove={(e) => {
        if (dragging) updateFromPointer(e.clientX, e.currentTarget);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      style={{ touchAction: "pan-y" }}
      className={cn("relative overflow-hidden select-none cursor-ew-resize", className)}
    >
      {/* After (base layer) */}
      <div className="absolute inset-0">
        <ResolvedImage
          storageId={afterId}
          alt={afterAlt}
          imgClassName="w-full h-full object-cover"
          lazy={!eager}
        />
      </div>

      {/* Before (clipped to the before side) */}
      <div className="absolute inset-0 pointer-events-none" style={{ clipPath: beforeClip }}>
        <ResolvedImage
          storageId={beforeId}
          alt={beforeAlt}
          imgClassName="w-full h-full object-cover"
          lazy={!eager}
        />
      </div>

      {/* Labels pinned to their real sides */}
      <div className={cn("absolute top-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm z-10 pointer-events-none", isRtl ? "right-3" : "left-3")}>
        {beforeLabel}
      </div>
      <div className={cn("absolute top-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm z-10 pointer-events-none", isRtl ? "left-3" : "right-3")}>
        {afterLabel}
      </div>

      {/* Divider + drag handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-lg z-10 pointer-events-none"
        style={isRtl ? { right: `${pos}%` } : { left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white shadow-lg border border-black/10 flex items-center justify-center">
          {!touched && !dragging && (
            <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" aria-hidden="true" />
          )}
          <ArrowLeftRight className="relative h-4 w-4 text-foreground" />
        </div>
      </div>
    </div>
  );
}
