export const defaultNS = 'common';

export const i18nConfig = {
  defaultNS,
  // This is the list of languages your application supports
  supportedLngs: ['en', 'fr'],
  // This is the language you want to use in case
  // if the user language is not in the supportedLngs
  fallbackLng: 'en',
  // Disabling suspense is recommended
  react: { useSuspense: false },
};
