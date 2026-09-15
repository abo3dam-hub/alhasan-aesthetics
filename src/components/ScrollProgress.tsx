"use client";
import { useEffect, useState } from "react";

/**
 * ScrollProgress — thin champagne bar at the very top that fills as the page
 * scrolls. Framermotion-free (rAF scroll listener) so it stays out of the
 * entry bundle; purely decorative with pointer-events disabled.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="scroll-progress-bar fixed top-0 left-0 right-0 h-[3px] z-[70] pointer-events-none"
      style={{ width: `${progress * 100}%` }}
      aria-hidden="true"
    />
  );
}