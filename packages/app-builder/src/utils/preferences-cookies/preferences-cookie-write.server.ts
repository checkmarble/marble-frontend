import { type PreferencesCookie, PreferencesCookieSchema } from './types';

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
    .filter(([key]) => key === 'preferences')[0]?.[1];

  console.log('Raw cookie value:', rawValue);
  if (!rawValue) return undefined;

  let parsedObj: Record<string, unknown> = {};
  try {
    let json = rawValue;
    try {
      parsedObj = JSON.parse(json);
    } catch {
      // Fix unquoted keys: {menuExpanded:1} -> {"menuExpanded":1}
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
