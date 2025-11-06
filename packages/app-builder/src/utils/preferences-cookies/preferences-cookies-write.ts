import Cookie from 'js-cookie';

import { COOKIE_NAME, type PreferencesCookie, PreferencesCookieSchema } from './config';

export function setPreferencesCookie<K extends keyof PreferencesCookie>(key: K, value: PreferencesCookie[K]) {
  let current: Partial<Record<keyof PreferencesCookie, string | number>> = {};
  try {
    const raw = Cookie.get(COOKIE_NAME);
    if (raw) {
      current = JSON.parse(raw);
    }
  } catch {
    // ignore parse errors
  }

  const parsed = PreferencesCookieSchema.partial().safeParse({
    [key]: value,
  } as Partial<PreferencesCookie>);
  if (!parsed.success) {
    throw new Error('Invalid preferences cookie value');
  }

  switch (typeof value) {
    case 'boolean':
      current[key] = value ? 1 : 0;
      break;
    case 'string':
      current[key] = value;
      break;
    case 'number':
      current[key] = (value as number).toString();
      break;
    default:
      current[key] = JSON.stringify(value);
      break;
  }

  Cookie.set(COOKIE_NAME, JSON.stringify(current), {
    expires: 365,
    sameSite: 'strict',
  });
}
