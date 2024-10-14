import { type LngStorageRepository } from '@app-builder/repositories/SessionStorageRepositories/LngStorageRepository';
import { type EntryContext } from '@remix-run/node';
import { createInstance, type FlatNamespace, type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { RemixI18Next } from 'remix-i18next/server';

import { i18nConfig } from './i18n-config';
import { resources } from './resources/resources.server';

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
      resources,
    },
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

    await instance.use(initReactI18next).init({
      ...i18nConfig,
      resources,
      lng,
      ns,
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
