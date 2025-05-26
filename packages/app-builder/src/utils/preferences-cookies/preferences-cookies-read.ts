import Cookie from 'js-cookie';

import { type PreferencesCookie, PreferencesCookieSchema } from './types';

const COOKIE_NAME = 'preferences';

export function setPreferencesCookie<K extends keyof PreferencesCookie>(
  key: K,
  value: PreferencesCookie[K],
) {
  // Read current cookie value
  let current: Partial<Record<keyof PreferencesCookie, string>> = {};
  try {
    const raw = Cookie.get(COOKIE_NAME);
    if (raw) {
      current = JSON.parse(raw);
    }
  } catch {
    // ignore parse errors
  }

  // Validate and coerce the input using the schema
  const parsed = PreferencesCookieSchema.partial().safeParse({
    [key]: value,
  } as Partial<PreferencesCookie>);
  if (!parsed.success) {
    throw new Error('Invalid preferences cookie value');
  }

  current[key] = value ? '1' : '0';

  Cookie.set(COOKIE_NAME, JSON.stringify(current), {
    expires: 365,
    sameSite: 'lax',
  });
}
