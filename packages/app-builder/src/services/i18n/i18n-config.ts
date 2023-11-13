import 'cronstrue/locales/en';

import { enGB } from 'date-fns/locale';
import { type InitOptions } from 'i18next';

export const defaultNS = 'common';

// When adding a new supported lng, add corresponding cronstrue locale above too
export const supportedLngs = ['en-GB', 'en'] as const;
const fallbackLng = 'en-GB';

export const i18nConfig = {
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
  'en-GB': enGB,
  en: enGB,
} satisfies Record<(typeof supportedLngs)[number], Locale>;

export function getDateFnsLocale(locale: string): Locale {
  const supportedLocale =
    supportedLngs.find((lng) => locale === lng) ?? fallbackLng;
  return dateFnsLocales[supportedLocale];
}
