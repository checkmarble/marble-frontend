export const defaultNS = 'common';

export const supportedLngs = ['en', 'fr'] as const;

export const i18nConfig = {
  defaultNS,
  // This is the list of languages your application supports
  supportedLngs: [...supportedLngs],
  // This is the language you want to use in case
  // if the user language is not in the supportedLngs
  fallbackLng: 'en',
  // Disabling suspense is recommended
  react: { useSuspense: false },
};
