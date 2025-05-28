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
    .map(([key, value]) => [key, decodeURIComponent(value ?? '').replace(/"/g, '')])
    .filter(([key]) => key === COOKIE_NAME)[0]?.[1];

  if (!rawValue) return undefined;

  let parsedObj: Record<string, unknown> = {};
  try {
    parsedObj = JSON.parse(rawValue);
  } catch {
    parsedObj = { [name]: rawValue };
  }

  try {
    const parsed = PreferencesCookieSchema.partial().parse(parsedObj);
    return parsed[name];
  } catch {
    return undefined;
  }
}
