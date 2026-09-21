import { useI18n } from "../i18n";
import type { Locale } from "../i18n/types";
import arAdmin from "../locales/ar.json";
import enAdmin from "../locales/en.json";

const adminTexts: Record<Locale, typeof arAdmin.admin> = {
  ar: arAdmin.admin,
  en: enAdmin.admin,
};

export function useAdminText() {
  const { locale } = useI18n();
  return adminTexts[locale];
}