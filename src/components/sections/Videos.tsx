import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  Clapperboard,
  X,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export interface ReelVideo {
  id: string;
  storageId: string;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  poster?: string;
  isActive: boolean;
  showOnHome: boolean;
  uploadedAt?: number;
  uploadedBy?: string;
  fileName?: string;
  size?: number;
  mimeType?: string;
  url: string;
  posterUrl: string;
}

/**
 * Homepage video section (Reels-style). Vertical 9:16 clip cards that mirror the
 * clinic's design language. Clicking a card starts playback in place — no route
 * change. A separate, always-visible expand button opens the clip large with
 * native controls (volume / seek / fullscreen), suitable for mobile.
 */
export default function Videos() {
  const { t, dir, locale } = useI18n();
  const isArabic = locale === "ar";
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const videoCMS = useQuery(api.videos.getVideos);
  const sectionCMS = useQuery(api.homepageSettings.getSectionContent, { key: "videoSection" });

  const badge = isArabic ? sectionCMS?.badgeAr || t.videos.badge : sectionCMS?.badgeEn || t.videos.badge;
  const title = isArabic ? sectionCMS?.titleAr || t.videos.title : sectionCMS?.titleEn || t.videos.title;
  const titleHighlight = isArabic
    ? sectionCMS?.titleHighlightAr || t.videos.titleHighlight
    : sectionCMS?.titleHighlightEn || t.videos.titleHighlight;
  const subtitle = isArabic ? sectionCMS?.subtitleAr || t.videos.subtitle : sectionCMS?.subtitleEn || t.videos.subtitle;

  const videos = (videoCMS ?? []) as ReelVideo[];

  return (
    <section id="videos" className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
          dir={dir}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-medium tracking-[0.06em] text-muted-foreground mb-6">
            <Clapperboard className="h-3.5 w-3.5 text-primary" />
            {badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-foreground">{title}</span>{" "}
            <span className="font-serif-luxury text-primary">{titleHighlight}</span>
          </h2>
          <span className="title-line mt-5" aria-hidden="true" />
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty">
            {subtitle}
          </p>
        </motion.div>

        {/* Reel cards */}
        {videos.length === 0 ? (
          <p className="text-center text-muted-foreground/70 text-sm">{t.videos.noVideos}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 justify-items-center" dir={dir}>
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={{
                  ...fadeInUp,
                  visible: {
                    ...fadeInUp.visible,
                    transition: { duration: 0.5, delay: 0.06 * i },
                  },
                }}
                className="w-full max-w-[300px]"
              >
                <ReelCard video={video} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ReelCard({ video }: { video: ReelVideo }) {
  const { t, locale } = useI18n();
  const isArabic = locale === "ar";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [cardRef, inView] = useInView({ threshold: 0.5, triggerOnce: false });

  const title = isArabic ? video.titleAr || video.titleEn || t.videos.title : video.titleEn || video.titleAr || t.videos.title;
  const description = isArabic ? video.descriptionAr || video.descriptionEn || "" : video.descriptionEn || video.descriptionAr || "";

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  }, []);

  const playFromButton = useCallback(() => {
    void videoRef.current?.play();
  }, []);

  // Auto-play (with sound) when scrolled into view, pause when scrolled past.
  // Some browsers block unmuted autoplay until a user gesture — fall back to
  // muted playback in that case, then the sound control stays user-toggleable.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (inView && !playing) {
      // `muted` state is synced with the element inside the promise callbacks
      // below — React's `muted` prop doesn't reliably update the underlying
      // media property, so the DOM write must happen before play() for the
      // browser's autoplay policy check.
      el.muted = false;
      void el
        .play()
        .then(() => setMuted(false))
        .catch(() => {
          // Browser blocked unmuted autoplay — fall back to muted playback.
          el.muted = true;
          setMuted(true);
          void el.play().catch(() => {
            // Autoplay fully blocked — wait for user gesture
          });
        });
    } else if (!inView && playing) {
      el.pause();
    }
  }, [inView, playing]);

  return (
    <figure ref={cardRef} className="glass-card rounded-[2rem] overflow-hidden glow-champagne card-glow">
      <div className="p-2">
        {/* Player (9:16) — click to play in place, no route change */}
        <div
          className="relative aspect-[9/16] rounded-[1.5rem] overflow-hidden bg-[#1E1E1E] select-none"
          onClick={togglePlay}
          role="button"
          tabIndex={0}
          aria-label={t.videos.playLabel}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              togglePlay();
            }
          }}
        >
          {video.url ? (
            <video
              ref={videoRef}
              src={video.url}
              poster={video.posterUrl || undefined}
              preload="none"
              playsInline
              loop
              muted={muted}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={() => setPlaying(false)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6">
                <Clapperboard className="h-10 w-10 text-secondary/70 mx-auto mb-3" />
                <p className="text-xs text-white/50">{t.videos.noVideos}</p>
              </div>
            </div>
          )}

          {/* Soft gradient for control legibility */}
          <div className={`absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent pointer-events-none transition-opacity ${playing ? "opacity-100" : "opacity-70"}`} />

          {/* Center play affordance (poster state) */}
          {!playing && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playFromButton();
              }}
              aria-label={t.videos.playLabel}
              className="absolute inset-0 m-auto h-16 w-16 rounded-full glass-strong flex items-center justify-center text-primary hover:scale-105 active:scale-95 transition-transform shadow-lg"
            >
              <Play className="h-7 w-7 ms-0.5 rtl:-scale-x-100" fill="currentColor" />
            </button>
          )}

          {/* Bottom controls — custom, always visible so mobile users can control playback */}
          <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                aria-label={playing ? t.videos.pauseLabel : t.videos.playLabel}
                className="p-2 rounded-full glass-strong text-white hover:bg-white/20 transition-colors"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ms-0.5 rtl:-scale-x-100" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = !muted;
                  setMuted(next);
                  if (videoRef.current) videoRef.current.muted = next;
                }}
                aria-label={muted ? t.videos.unmuteLabel : t.videos.muteLabel}
                title={muted ? t.videos.unmuteLabel : t.videos.muteLabel}
                className="p-2 rounded-full glass-strong text-white hover:bg-white/20 transition-colors"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>

            {/* Prominent, independent expand / open button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
              }}
              aria-label={t.videos.expandLabel}
              title={t.videos.expandLabel}
              className="p-2.5 rounded-full glass-strong text-white hover:bg-white/20 transition-colors"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Caption */}
        {(title || description) && (
          <figcaption className="px-3 pb-3 pt-3 text-center">
            {title && <h3 className="text-sm sm:text-base font-semibold text-foreground">{title}</h3>}
            {description && <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>}
          </figcaption>
        )}
      </div>

      {expanded && <ReelsExpand video={video} onClose={() => setExpanded(false)} />}
    </figure>
  );
}

/** Large viewer with native controls — opened from the expand button. */
function ReelsExpand({ video, onClose }: { video: ReelVideo; onClose: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t.videos.closeLabel}
        className="absolute top-4 end-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        {video.url ? (
          <video
            src={video.url}
            poster={video.posterUrl || undefined}
            controls
            autoPlay
            playsInline
            loop
            className="w-full max-h-[92vh] rounded-2xl bg-black shadow-2xl"
          />
        ) : (
          <div className="aspect-[9/16] w-full max-w-sm mx-auto rounded-2xl bg-black/40 flex items-center justify-center text-white/60">
            {t.videos.noVideos}
          </div>
        )}
      </div>
    </div>
  );
}