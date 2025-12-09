import * as Sentry from '@sentry/remix';

import { COOKIE_NAME, type PreferencesCookie, PreferencesCookieSchema } from './config';

type PreferencesCookieKey = keyof PreferencesCookie;

export function getPreferencesCookie<K extends PreferencesCookieKey>(
  request: Request,
  name: K,
): PreferencesCookie[K] | undefined {
  const rawValue = request.headers
    .get('Cookie')
    ?.split('; ')
    .map((cookie) => cookie.split('='))
    .map(([key, value]) => [key, decodeURIComponent(value ?? '')])
    .filter(([key]) => key === COOKIE_NAME)[0]?.[1];

  if (!rawValue) return undefined;

  let parsedObj: Record<string, K>;
  try {
    parsedObj = JSON.parse(rawValue);
  } catch (error) {
    Sentry.captureException(error);
    parsedObj = { [name]: rawValue as K };
  }

  try {
    const parsed = PreferencesCookieSchema.partial().parse(parsedObj);
    return parsed[name] as PreferencesCookie[K] | undefined;
  } catch {
    return undefined;
  }
}
