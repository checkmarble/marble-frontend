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
    let json = rawValue;
    try {
      parsedObj = JSON.parse(json);
    } catch {
      // Fix unquoted keys: {key:1} -> {"key":1}
      json = json.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
      parsedObj = JSON.parse(json);
    }
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
