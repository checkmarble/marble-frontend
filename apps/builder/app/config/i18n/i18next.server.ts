import { resolve } from 'node:path';

import {
  type MarbleSession,
  sessionStorage,
} from '@marble-front/builder/services/auth/session.server';
import { type EntryContext } from '@remix-run/node';
import { createInstance } from 'i18next';
import Backend from 'i18next-fs-backend';
import { initReactI18next } from 'react-i18next';
import { RemixI18Next } from 'remix-i18next';

import { i18nConfig } from './i18n-config';

export const remixI18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18nConfig.supportedLngs,
    fallbackLanguage: i18nConfig.fallbackLng,
    sessionStorage,
  },
  // This is the configuration for i18next used
  // when translating messages server-side only
  i18next: {
    ...i18nConfig,
    backend: {
      loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json'),
    },
  },
  // The backend you want to use to load the translations
  // Tip: You could pass `resources` to the `i18next` configuration and avoid
  // a backend here
  backend: Backend,
});

export async function getI18nextServerInstance(
  request: Request,
  remixContext: EntryContext
) {
  // First, we create a new instance of i18next so every request will have a
  // completely unique instance and not share any state
  const instance = createInstance();

  // Then we could detect locale from the request
  const lng = await remixI18next.getLocale(request);
  // And here we detect what namespaces the routes about to render want to use
  const ns = remixI18next.getRouteNamespaces(remixContext);

  await instance
    .use(initReactI18next)
    .use(Backend)
    .init({
      ...i18nConfig,
      lng,
      ns,
      backend: {
        loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json'),
      },
    });

  return instance;
}

export async function setLanguage(session: MarbleSession, language: string) {
  session.set('lng', language);
}
