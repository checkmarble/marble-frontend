import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ALL_NAMESPACES } from './all-namespaces';
import { i18nConfig } from './i18n-config';
import { resources } from './resources/resources';

/**
 * Creates a synchronously-initialized i18next instance for the given locale.
 * Uses statically-bundled resources so init is immediate — safe to call during
 * both SSR and client rendering without async workarounds.
 */
export function makeI18nInstance(locale: string) {
  const instance = createInstance();
  instance.use(initReactI18next).init({
    ...i18nConfig,
    resources,
    lng: locale,
    ns: ALL_NAMESPACES,
    initImmediate: false,
  });
  return instance;
}
