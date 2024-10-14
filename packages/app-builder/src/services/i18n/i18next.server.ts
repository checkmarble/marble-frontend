import { resolve } from 'node:path';

import { type LngStorageRepository } from '@app-builder/repositories/SessionStorageRepositories/LngStorageRepository';
import { type EntryContext } from '@remix-run/node';
import { createInstance, type FlatNamespace, type InitOptions } from 'i18next';
import Backend from 'i18next-fs-backend';
import { initReactI18next } from 'react-i18next';
import { RemixI18Next } from 'remix-i18next/server';

import { i18nConfig } from './i18n-config';

export function makeI18nextServerService({ lngStorage }: LngStorageRepository) {
  const remixI18next = new RemixI18Next({
    detection: {
      supportedLanguages: i18nConfig.supportedLngs,
      fallbackLanguage: i18nConfig.fallbackLng,
      sessionStorage: lngStorage,
    },
    // This is the configuration for i18next used
    // when translating messages server-side only
    i18next: {
      ...i18nConfig,
      backend: {
        loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json'),
      },
    },
    // The i18next plugins you want RemixI18next to use for `i18n.getFixedT` inside loaders and actions.
    // E.g. The Backend plugin for loading translations from the file system
    // Tip: You could pass `resources` to the `i18next` configuration and avoid a backend here
    plugins: [Backend],
  });

  async function getI18nextServerInstance(
    request: Request,
    remixContext: EntryContext,
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

  async function setLanguage(request: Request, language: string) {
    const session = await lngStorage.getSession(request.headers.get('cookie'));
    session.set('lng', language);
    const cookie = await lngStorage.commitSession(session);
    return { cookie };
  }

  return {
    getLocale: (request: Request) => remixI18next.getLocale(request),
    getFixedT: <
      N extends FlatNamespace | readonly [FlatNamespace, ...FlatNamespace[]],
    >(
      request: Request,
      namespaces: N,
      options?: Omit<InitOptions, 'react'>,
    ) => remixI18next.getFixedT(request, namespaces, options),
    getI18nextServerInstance,
    setLanguage,
  };
}

export type SessionService = ReturnType<typeof makeI18nextServerService>;
