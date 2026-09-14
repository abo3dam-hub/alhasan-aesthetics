import type { FC, ReactNode, SVGProps } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import {
  Syringe,
  Droplet,
  Droplets,
  BicepsFlexed,
  PersonStanding,
  Bandage,
  Ear,
  Sparkles,
} from "lucide-react";
import {
  PROCEDURE_ICON_KEYS,
  type ProcedureIconKey,
  resolveIconKey,
} from "@/convex/procedureIconDefaults";

/**
 * Expressive procedure icon set.
 *
 * Lucide already has clear medical glyphs for injections, eyelid/ear, body
 * shaping and scar care. For the anatomical gaps (nose, breast, waist and a
 * lifted face/eyelid) we ship small hand-drawn SVGs that follow Lucide's
 * stroke conventions so the whole set reads as one system.
 */

type ProcedureIconType = FC<LucideProps>;

/* ── Shared SVG shell (Lucide-compatible stroke style) ─────────────────── */
const Svg = ({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

/** Nose (rhinoplasty) — front-facing nose: bridge, tip, columella. */
const NoseIcon: ProcedureIconType = (props) => (
  <Svg {...props}>
    <path d="M12 4v3.5" />
    <path d="M12 7.5c3 1.8 4.8 4.6 4 7.2C15.4 17.1 13.9 18.2 12 18.2c-1.9 0-3.4-1.1-4-3.5-.8-2.6 1-5.4 4-7.2z" />
    <path d="M12 13.4v4" />
  </Svg>
);

/** Face & neck lift — head + shoulders with an upward lifting arrow. */
const FaceLiftIcon: ProcedureIconType = (props) => (
  <Svg {...props}>
    <circle cx={12} cy={9.8} r={4.6} />
    <path d="M12 14.4v3" />
    <path d="M7.6 20.6c1.2 1 2.8 1.4 4.4 1.4s3.2-.4 4.4-1.4" />
    <path d="M12 5v2.4" />
    <path d="M10.7 6.1l1.3-1.3 1.3 1.3" />
  </Svg>
);

/** Waist / abdomen contour (tummy tuck) — waist hourglass + navel. */
const WaistIcon: ProcedureIconType = (props) => (
  <Svg {...props}>
    <path d="M7 3c3 2.5 4.3 5 4.3 7.4S9.8 13.9 8.3 15.2c1.7 1.2 2.8 3 2.8 5.3" />
    <path d="M17 3c-3 2.5-4.3 5-4.3 7.4s.9 3.5 2.4 4.8c-1.7 1.2-2.8 3-2.8 5.3" />
    <circle cx={12} cy={12.8} r={0.7} fill="currentColor" stroke="none" />
  </Svg>
);

/** Eyelid lift — eye with an upward lifting arrow. */
const EyelidLiftIcon: ProcedureIconType = (props) => (
  <Svg {...props}>
    <path d="M3 12c2.7 3.4 5.6 5.1 9 5.1s6.3-1.7 9-5.1c-2.7-3.4-5.6-5.1-9-5.1S5.7 8.6 3 12z" />
    <circle cx={12} cy={12} r={2.3} />
    <path d="M12 3.5v2" />
    <path d="M10.8 4.7 12 3.5l1.2 1.2" />
  </Svg>
);

/** Breast — soft dome over a bust line with an optional badge. */
type BreastModifier = "plus" | "minus" | "lift" | "liftPlus";
const BreastBase = ({ modifier, ...props }: LucideProps & { modifier: BreastModifier }) => (
  <Svg {...props}>
    <path d="M5 12.5h14" />
    <path d="M5 12.5a7 7 0 0 0 14 0" />
    {modifier === "plus" && (
      <path d="M10.5 15.3h3M12 13.8v3" />
    )}
    {modifier === "minus" && <path d="M10.5 15.3h3" />}
    {modifier === "lift" && (
      <path d="M12 16.9V14.4M10.7 15.7l1.3-1.3 1.3 1.3" />
    )}
    {modifier === "liftPlus" && (
      <>
        <path d="M12 16.9V14.4M10.7 15.7l1.3-1.3 1.3 1.3" />
        <path d="M14.8 15.3h1.6M15.6 14.5v1.6" />
      </>
    )}
  </Svg>
);

const BreastAugmentationIcon: ProcedureIconType = (props) => <BreastBase modifier="plus" {...props} />;
const BreastReductionIcon: ProcedureIconType = (props) => <BreastBase modifier="minus" {...props} />;
const BreastLiftIcon: ProcedureIconType = (props) => <BreastBase modifier="lift" {...props} />;
const BreastLiftImplantsIcon: ProcedureIconType = (props) => <BreastBase modifier="liftPlus" {...props} />;

/* ── Registry: semantic key → renderable icon ───────────────────────────── */
export const PROCEDURE_ICON_MAP: Record<ProcedureIconKey, ProcedureIconType | LucideIcon> = {
  EyelidLift: EyelidLiftIcon,
  FaceLift: FaceLiftIcon,
  Rhinoplasty: NoseIcon,
  Liposuction: Droplets,
  TummyTuck: WaistIcon,
  Botox: Syringe,
  Fillers: Droplet,
  ArmLift: BicepsFlexed,
  ThighLift: PersonStanding,
  BreastAugmentation: BreastAugmentationIcon,
  BreastReduction: BreastReductionIcon,
  BreastLift: BreastLiftIcon,
  BreastLiftImplants: BreastLiftImplantsIcon,
  ScarCorrection: Bandage,
  EarCorrection: Ear,
  General: Sparkles,
};

/** Short bilingual labels for the admin icon picker. */
export const PROCEDURE_ICON_LABELS: Record<ProcedureIconKey, { ar: string; en: string }> = {
  EyelidLift: { ar: "شدّ الجفون", en: "Eyelid Lift" },
  FaceLift: { ar: "شدّ الوجه والرقبة", en: "Face & Neck Lift" },
  Rhinoplasty: { ar: "تجميل الأنف", en: "Rhinoplasty" },
  Liposuction: { ar: "شفط الدهون", en: "Liposuction" },
  TummyTuck: { ar: "شدّ البطن", en: "Tummy Tuck" },
  Botox: { ar: "البوتوكس", en: "Botox" },
  Fillers: { ar: "الفيلر", en: "Fillers" },
  ArmLift: { ar: "شدّ الذراعين", en: "Arm Lift" },
  ThighLift: { ar: "شدّ الفخذين", en: "Thigh Lift" },
  BreastAugmentation: { ar: "تكبير الثدي", en: "Breast Augmentation" },
  BreastReduction: { ar: "تصغير الثدي وشدّه", en: "Breast Reduction" },
  BreastLift: { ar: "شدّ الثدي", en: "Breast Lift" },
  BreastLiftImplants: { ar: "زرعات الثدي", en: "Breast Lift + Implants" },
  ScarCorrection: { ar: "علاج الندوب", en: "Scar Correction" },
  EarCorrection: { ar: "تصحيح الأذن", en: "Ear Correction" },
  General: { ar: "عام", en: "General" },
};

/** Ordered options for the dashboard picker (curated, expressive set). */
export const PROCEDURE_ICON_OPTIONS: ProcedureIconKey[] = [...PROCEDURE_ICON_KEYS];

/** Resolve the icon component for a procedure (slug → stored icon fallback). */
export function getProcedureIcon(slug?: string, storedIcon?: string): ProcedureIconType {
  const key = resolveIconKey(slug, storedIcon);
  return (PROCEDURE_ICON_MAP[key] ?? Sparkles) as ProcedureIconType;
}

/** Normalize any stored icon string to its semantic key. */
export function normalizeStoredIcon(slug: string, storedIcon: string): ProcedureIconKey {
  return resolveIconKey(slug, storedIcon);
}