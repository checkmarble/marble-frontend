import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend, { type HttpBackendOptions } from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { getInitialNamespaces } from 'remix-i18next';

import { i18nConfig } from './i18n-config';

export function makeI18nextClientService() {
  async function getI18nextClientInstance() {
    // eslint-disable-next-line import/no-named-as-default-member
    await i18next
      .use(initReactI18next)
      .use(LanguageDetector)
      .use(Backend)
      .init<HttpBackendOptions>({
        ...i18nConfig,
        // This function detects the namespaces your routes rendered while SSR use
        ns: getInitialNamespaces(),
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        detection: {
          // Here only enable htmlTag detection, we'll detect the language only
          // server-side with remix-i18next, by using the `<html lang>` attribute
          // we can communicate to the client the language detected server-side
          order: ['htmlTag'],
          // Because we only use htmlTag, there's no reason to cache the language
          // on the browser, so we disable it
          caches: [],
        },
      });

    return i18next;
  }

  return {
    getI18nextClientInstance,
  };
}

export type I18nextClientService = ReturnType<typeof makeI18nextClientService>;
