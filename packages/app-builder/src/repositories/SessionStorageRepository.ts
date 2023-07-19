import {
  type MarbleFlashData,
  type MarbleSessionData,
} from '@app-builder/models/marble-session';
import { createCookie, createCookieSessionStorage } from '@remix-run/node';

export interface SessionStorageRepositoryOptions {
  maxAge: number;
  secrets: string[];
  secure: boolean;
}

export function getSessionStorageRepository({
  maxAge,
  secrets,
  secure,
}: SessionStorageRepositoryOptions) {
  const sessionCookie = createCookie('user_session', {
    maxAge,
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true,
    secrets,
    secure,
  });

  // export the whole sessionStorage object
  const sessionStorage = createCookieSessionStorage<
    MarbleSessionData,
    MarbleFlashData
  >({
    cookie: sessionCookie,
  });

  return { sessionStorage };
}

export type SessionStorageRepository = ReturnType<
  typeof getSessionStorageRepository
>;
