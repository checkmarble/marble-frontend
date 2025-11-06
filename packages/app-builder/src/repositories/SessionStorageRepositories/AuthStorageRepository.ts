import { type AuthData, type AuthFlashData } from '@app-builder/models/marble-session';
import { createCookie, createCookieSessionStorage } from '@remix-run/node';

import { type SessionStorageRepositoryOptions } from './SessionStorageRepository';

export function getAuthStorageRepository({ maxAge, secrets, secure }: SessionStorageRepositoryOptions) {
  const authCookie = createCookie('user_session', {
    maxAge,
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true,
    secrets,
    secure,
  });

  // export the whole sessionStorage object
  const authStorage = createCookieSessionStorage<AuthData, AuthFlashData>({
    cookie: authCookie,
  });

  return { authStorage };
}

export type AuthStorageRepository = ReturnType<typeof getAuthStorageRepository>;
