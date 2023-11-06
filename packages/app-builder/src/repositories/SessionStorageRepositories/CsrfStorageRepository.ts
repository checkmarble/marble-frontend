import { createCookie, createCookieSessionStorage } from '@remix-run/node';

import { type SessionStorageRepositoryOptions } from './SessionStorageRepository';

export function getCsrfStorageRepository({
  maxAge,
  secrets,
  secure,
}: SessionStorageRepositoryOptions) {
  const csrfCookie = createCookie('csrf', {
    maxAge,
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true,
    secrets,
    secure,
  });

  // export the whole sessionStorage object
  const csrfStorage = createCookieSessionStorage({
    cookie: csrfCookie,
  });

  return { csrfStorage };
}

export type CsrfStorageRepository = ReturnType<typeof getCsrfStorageRepository>;
