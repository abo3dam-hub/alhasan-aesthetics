/**
 * Single source of truth for procedure icon keys.
 *
 * The `procedures.icon` column stores one of these semantic keys (string).
 * Frontend (src/lib/procedureIcons.tsx) maps a key → Lucide/Custom SVG icon.
 * migration.ts normalizes legacy icon names to these keys.
 *
 * NOTE: This module is intentionally dependency-free (no lucide-react, no JSX)
 * so it can be imported from both the frontend and the Convex backend.
 */

export const PROCEDURE_ICON_KEYS = [
  "EyelidLift",
  "FaceLift",
  "Rhinoplasty",
  "Liposuction",
  "TummyTuck",
  "Botox",
  "Fillers",
  "ArmLift",
  "ThighLift",
  "BreastAugmentation",
  "BreastReduction",
  "BreastLift",
  "BreastLiftImplants",
  "ScarCorrection",
  "EarCorrection",
  "General",
] as const;

export type ProcedureIconKey = (typeof PROCEDURE_ICON_KEYS)[number];

/** Canonical semantic icon per procedure slug (specific defaults). */
export const ICON_KEY_BY_SLUG: Record<string, string> = {
  "upper-eyelid-lift": "EyelidLift",
  "lower-eyelid-lift": "EyelidLift",
  "upper-lower-eyelid-lift": "EyelidLift",
  "face-neck-lift": "FaceLift",
  rhinoplasty: "Rhinoplasty",
  "liposuction-fat-transfer": "Liposuction",
  "tummy-tuck": "TummyTuck",
  "botox-injections": "Botox",
  fillers: "Fillers",
  "arm-lift": "ArmLift",
  "arm-thigh-lift": "ThighLift",
  "thigh-lift": "ThighLift",
  "breast-augmentation": "BreastAugmentation",
  "breast-augmentation-reduction": "BreastReduction",
  "breast-reduction-and-lift": "BreastReduction",
  "breast-lift": "BreastLift",
  "breast-lift-with-implants": "BreastLiftImplants",
  "scar-deformity-correction": "ScarCorrection",
  "prominent-ear-correction": "EarCorrection",
};

/** Legacy lucide icon names still stored for old rows → semantic key. */
export const LEGACY_ICON_TO_KEY: Record<string, string> = {
  Eye: "EyelidLift",
  UserRound: "FaceLift",
  SmilePlus: "Rhinoplasty",
  Droplets: "Liposuction",
  Scissors: "TummyTuck",
  Sparkles: "General",
  Heart: "Fillers",
  ArrowUpDown: "ThighLift",
  Stethoscope: "BreastAugmentation",
  Ban: "ScarCorrection",
  Star: "General",
  Shield: "General",
  Zap: "General",
  Activity: "General",
  Sun: "General",
  Moon: "General",
};

/**
 * Resolve which semantic icon key a procedure should render.
 * Order: admin-chosen semantic key → slug-specific default → legacy name → General.
 */
export function resolveIconKey(slug?: string, storedIcon?: string): ProcedureIconKey {
  if (storedIcon && (PROCEDURE_ICON_KEYS as readonly string[]).includes(storedIcon)) {
    return storedIcon as ProcedureIconKey;
  }
  if (slug && ICON_KEY_BY_SLUG[slug]) {
    return ICON_KEY_BY_SLUG[slug] as ProcedureIconKey;
  }
  if (storedIcon && LEGACY_ICON_TO_KEY[storedIcon]) {
    return LEGACY_ICON_TO_KEY[storedIcon] as ProcedureIconKey;
  }
  return "General";
}