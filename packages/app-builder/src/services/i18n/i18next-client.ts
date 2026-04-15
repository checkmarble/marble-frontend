import { i18nConfig } from '@app-builder/services/i18n/i18n-config';
import i18next from 'i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import Fetch from 'i18next-fetch-backend';
import { initReactI18next } from 'react-i18next';
import { ALL_NAMESPACES } from './all-namespaces';

export function makeI18nextClientService() {
  async function getI18nextClientInstance() {
    await i18next
      .use(initReactI18next)
      .use(Fetch)
      .use(I18nextBrowserLanguageDetector)
      .init({
        ...i18nConfig,
        // Load all namespaces statically on both server and client.
        ns: ALL_NAMESPACES,
        detection: {
          // Server communicates the detected language via the <html lang> attribute.
          order: ['htmlTag'],
          caches: [],
        },
        backend: {
          loadPath: '/ressources/locales?lng={{lng}}&ns={{ns}}',
        },
      });

    return i18next;
  }

  return { getI18nextClientInstance };
}

export type I18nextClientService = ReturnType<typeof makeI18nextClientService>;
