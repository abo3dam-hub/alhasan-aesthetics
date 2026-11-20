/**
 * One card in the public Before/After feed (`api.beforeAfter.listPublic`):
 * either a curated standalone case (`source: "case"`) or a case derived from
 * a procedure's own before/after pair (`source: "procedure"`, `_id` prefixed
 * with `proc:`). Mirrors the query's return shape in `src/convex/beforeAfter.ts`.
 */
export interface PublicBeforeAfterCase {
  _id: string;
  titleAr: string;
  titleEn: string;
  procedureType: string;
  beforeImage: string;
  afterImage: string;
  descriptionAr?: string;
  descriptionEn?: string;
  patientAge?: number;
  order: number;
  source: "case" | "procedure";
}
