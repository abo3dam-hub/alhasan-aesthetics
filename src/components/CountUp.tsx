import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

/**
 * CountUp — animates a numeric value from 0 to its target when scrolled into view.
 * Keeps any non-numeric suffix ("+", "%", "k", …) and formats big numbers.
 */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.4 });
  const [display, setDisplay] = useState("0");
  const startedRef = useRef(false);

  const match = value.match(/^([0-9][0-9.,]*)(.*)$/);
  const target = match ? parseFloat(match[1].replace(/,/g, "")) : NaN;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    if (!inView || startedRef.current || isNaN(target)) return;
    startedRef.current = true;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased).toLocaleString("en-US"));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  if (isNaN(target)) return <>{value}</>;
  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}