import { i18nConfig, supportedLngs } from '@app-builder/services/i18n/i18n-config';
import { useLngSession } from '@app-builder/services/i18n/lng-session.server';
import { resources } from '@app-builder/services/i18n/resources/resources';
import { createInstance, type FlatNamespace, type i18n, type TFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ALL_NAMESPACES } from './all-namespaces';

/**
 * Detect the user's preferred locale from the request.
 * Priority: lng session cookie → Accept-Language header → fallback 'en-GB'.
 */
export async function getLocale(request: Request): Promise<string> {
  const session = await useLngSession();
  const sessionLng = session.data.lng;
  if (sessionLng && (supportedLngs as readonly string[]).includes(sessionLng)) {
    return sessionLng;
  }

  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    for (const entry of acceptLanguage.split(',')) {
      const lang = entry.trim().split(';')[0]?.trim() ?? '';
      if ((supportedLngs as readonly string[]).includes(lang)) {
        return lang;
      }
      // Try language prefix: "en" → "en-GB"
      const prefix = lang.split('-')[0] ?? '';
      const match = supportedLngs.find((s) => s === prefix || s.startsWith(prefix + '-'));
      if (match) return match;
    }
  }

  return i18nConfig.fallbackLng as string;
}

/**
 * Create a fresh i18next instance for SSR with all bundled namespaces.
 * Uses initAsync: false for synchronous initialization (resources are in memory).
 */
export function makeI18nextServerInstance(locale: string): i18n {
  const instance = createInstance();
  instance.use(initReactI18next).init({
    ...i18nConfig,
    resources,
    lng: locale,
    ns: ALL_NAMESPACES,
    initAsync: false,
  });
  return instance;
}

export async function getFixedT<N extends FlatNamespace | readonly [FlatNamespace, ...FlatNamespace[]]>(
  request: Request,
  namespaces: N,
): Promise<TFunction<N>> {
  const locale = await getLocale(request);
  return makeI18nextServerInstance(locale).getFixedT(locale, namespaces);
}

export async function setLanguage(language: string) {
  const session = await useLngSession();
  await session.update({ lng: language });
}
