import type { i18n } from 'i18next';

/**
 * Per-locale cache of server-side i18next instances.
 *
 * Populated in the root loader's createServerFn handler before App() renders.
 * App() reads from this cache on the server; on the client it falls back to the
 * pre-initialized i18next global singleton (set up in app/client.tsx before
 * hydrateRoot).
 *
 * The cache is safe to share across concurrent requests because i18next instances
 * are read-only after init() completes. There are only 4 possible locale keys.
 */
const ssrInstanceCache = new Map<string, i18n>();

export function registerSSRInstance(locale: string, instance: i18n): void {
  ssrInstanceCache.set(locale, instance);
}

export function getSSRInstance(locale: string): i18n | undefined {
  return ssrInstanceCache.get(locale);
}
