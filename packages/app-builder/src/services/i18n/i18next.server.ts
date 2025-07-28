import { type UserPreferencesStorageRepository } from '@app-builder/repositories/SessionStorageRepositories/LngStorageRepository';
import { type EntryContext } from '@remix-run/node';
import { createInstance, type FlatNamespace, type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { RemixI18Next } from 'remix-i18next/server';

import { i18nConfig } from './i18n-config';
import { resources } from './resources/resources.server';

export function makeI18nextServerService({
  userPreferencesStorage,
}: UserPreferencesStorageRepository) {
  const remixI18next = new RemixI18Next({
    detection: {
      supportedLanguages: i18nConfig.supportedLngs,
      fallbackLanguage: i18nConfig.fallbackLng,
      sessionStorage: userPreferencesStorage,
    },
    // This is the configuration for i18next used
    // when translating messages server-side only
    i18next: {
      ...i18nConfig,
      resources,
    },
  });

  async function getI18nextServerInstance(request: Request, remixContext: EntryContext) {
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
    const session = await userPreferencesStorage.getSession(request.headers.get('cookie'));
    session.set('lng', language);
    const cookie = await userPreferencesStorage.commitSession(session);
    return { cookie };
  }

  async function setDateFormat(request: Request, dateFormat: string) {
    const session = await userPreferencesStorage.getSession(request.headers.get('cookie'));
    session.set('dateFormat', dateFormat);
    const cookie = await userPreferencesStorage.commitSession(session);
    return { cookie };
  }

  async function setHoursFormat(request: Request, hoursFormat: string) {
    const session = await userPreferencesStorage.getSession(request.headers.get('cookie'));
    session.set('hoursFormat', hoursFormat);
    const cookie = await userPreferencesStorage.commitSession(session);
    return { cookie };
  }

  async function getDateFormat(request: Request): Promise<string | undefined> {
    const session = await userPreferencesStorage.getSession(request.headers.get('cookie'));
    return session.get('dateFormat');
  }

  async function getHoursFormat(request: Request): Promise<string | undefined> {
    const session = await userPreferencesStorage.getSession(request.headers.get('cookie'));
    return session.get('hoursFormat');
  }

  async function getUserPreferences(request: Request) {
    const session = await userPreferencesStorage.getSession(request.headers.get('cookie'));
    return {
      language: await remixI18next.getLocale(request),
      dateFormat: session.get('dateFormat'),
      hoursFormat: session.get('hoursFormat'),
    };
  }

  return {
    getLocale: (request: Request) => remixI18next.getLocale(request),
    getFixedT: <N extends FlatNamespace | readonly [FlatNamespace, ...FlatNamespace[]]>(
      request: Request,
      namespaces: N,
      options?: Omit<InitOptions, 'react'>,
    ) => remixI18next.getFixedT(request, namespaces, options),
    getI18nextServerInstance,
    setLanguage,
    setDateFormat,
    setHoursFormat,
    getDateFormat,
    getHoursFormat,
    getUserPreferences,
  };
}

export type SessionService = ReturnType<typeof makeI18nextServerService>;
