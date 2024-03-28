import 'cronstrue/locales/en.js';

import { type Locale } from 'date-fns/locale';
import { enGB } from 'date-fns/locale/en-GB';
import { type InitOptions } from 'i18next';

export const defaultNS = 'common';

// When adding a new supported lng, add corresponding cronstrue locale above too
export const supportedLngs = ['en'] as const;
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
} satisfies Record<(typeof supportedLngs)[number], Locale>;

export function getDateFnsLocale(locale: string): Locale {
  const supportedLocale =
    supportedLngs.find((lng) => locale === lng) ?? fallbackLng;
  return dateFnsLocales[supportedLocale];
}
