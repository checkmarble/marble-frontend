import { createCookie } from '@remix-run/node';

import { type SessionStorageRepositoryOptions } from './SessionStorageRepository';

export function getCsrfCookie({ maxAge, secrets, secure }: SessionStorageRepositoryOptions) {
  return createCookie('csrf', {
    maxAge,
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true,
    secrets,
    secure,
  });
}

export type CsrfCookie = ReturnType<typeof getCsrfCookie>;
