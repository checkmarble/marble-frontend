import i18next from 'i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import Fetch from 'i18next-fetch-backend';
import { initReactI18next } from 'react-i18next';
import { getInitialNamespaces } from 'remix-i18next/client';

import { i18nConfig } from './i18n-config';

export function makeI18nextClientService() {
  async function getI18nextClientInstance() {
    await i18next
      .use(initReactI18next)
      .use(Fetch)
      .use(I18nextBrowserLanguageDetector)
      .init({
        ...i18nConfig,
        // This function detects the namespaces your routes rendered while SSR use
        ns: getInitialNamespaces(),
        detection: {
          // Here only enable htmlTag detection, we'll detect the language only
          // server-side with remix-i18next, by using the `<html lang>` attribute
          // we can communicate to the client the language detected server-side
          order: ['htmlTag'],
          // Because we only use htmlTag, there's no reason to cache the language
          // on the browser, so we disable it
          caches: [],
        },
        backend: {
          // We will configure the backend to fetch the translations from the
          // resource route /api/locales and pass the lng and ns as search params
          loadPath: '/ressources/locales?lng={{lng}}&ns={{ns}}',
        },
      });

    return i18next;
  }

  return {
    getI18nextClientInstance,
  };
}

export type I18nextClientService = ReturnType<typeof makeI18nextClientService>;
