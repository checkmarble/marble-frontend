import 'cronstrue/locales/en';

import { type InitOptions } from 'i18next';

export const defaultNS = 'common';

// When adding a new supported lng, add corresponding cronstrue locale above too
export const supportedLngs = ['en-GB', 'en'] as const;

export const i18nConfig = {
  defaultNS,
  // This is the list of languages your application supports
  supportedLngs: [...supportedLngs],
  // This is the language you want to use in case
  // if the user language is not in the supportedLngs
  fallbackLng: 'en-GB',
  // Disabling suspense is recommended
  react: { useSuspense: false },
} satisfies InitOptions;
