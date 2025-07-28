import 'cronstrue/locales/en.js';
import 'cronstrue/locales/fr.js';

import { type Locale } from 'date-fns/locale';
import { ar } from 'date-fns/locale/ar';
import { enGB } from 'date-fns/locale/en-GB';
import { fr } from 'date-fns/locale/fr';
import { type InitOptions } from 'i18next';

export const defaultNS = 'common';

// When adding a new supported lng, add corresponding cronstrue locale above too
export const supportedLngs = ['en', 'fr', 'ar'] as const;
export const languageNames: Record<
  (typeof supportedLngs)[number],
  { dir: 'ltr' | 'rtl'; name: string }
> = {
  en: { dir: 'ltr', name: 'English' },
  fr: { dir: 'ltr', name: 'Français' },
  ar: { dir: 'rtl', name: 'العربية' },
};
const fallbackLng = 'en';

export const i18nConfig = {
  interpolation: {
    escapeValue: false, // not needed for react
  },
  defaultNS,
  // This is the list of languages your application supports
  supportedLngs: [...supportedLngs],
  // This is the language you want to use in case
  // if the user language is not in the supportedLngs
  fallbackLng,
  // Disabling suspense is recommended
  react: { useSuspense: false },
} satisfies InitOptions;

const dateFnsLocales = {
  en: enGB,
  fr: fr,
  ar: ar,
} satisfies Record<(typeof supportedLngs)[number], Locale>;

export function getDateFnsLocale(locale: string): Locale {
  // Extract language code (e.g., "fr" from "fr-FR")
  const lang = locale.split('-')[0];
  const supportedLocale = supportedLngs.find((lng) => lang === lng) ?? fallbackLng;
  return dateFnsLocales[supportedLocale];
}

/** Dates and hours formats */
export const dateFormatsLocales = {
  en: 'en-GB',
  fr: 'fr-FR',
  ar: 'ar-SA',
} satisfies Record<(typeof supportedLngs)[number], string>;

export const sampleDateFormats = {
  'dd/MM/yyyy': { value: 'dd/MM/yyyy', displayName: 'European (DD/MM/YYYY)' },
  'MM/dd/yyyy': { value: 'MM/dd/yyyy', displayName: 'US (MM/DD/YYYY)' },
  'yyyy-MM-dd': { value: 'yyyy-MM-dd', displayName: 'ISO (YYYY-MM-DD)' },
} as const;

export const sampleHoursFormats = {
  'HH:mm': { value: 'HH:mm', displayName: '24 hours' },
  'hh:mm': { value: 'hh:mm', displayName: '12 hours' },
} as const;
