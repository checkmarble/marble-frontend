import { createCookie, createCookieSessionStorage } from '@remix-run/node';

import { type SessionStorageRepositoryOptions } from './SessionStorageRepository';

export function getLngStorageRepository({ secrets, secure }: Omit<SessionStorageRepositoryOptions, 'maxAge'>) {
  const lngCookie = createCookie('lng', {
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true,
    secrets,
    secure,
  });

  // export the whole sessionStorage object
  const lngStorage = createCookieSessionStorage<{
    lng: string;
  }>({
    cookie: lngCookie,
  });

  return { lngStorage };
}

export type LngStorageRepository = ReturnType<typeof getLngStorageRepository>;
