import type { ToastFlashData, ToastSessionData } from '@app-builder/models/toast-session';
import { createCookie, createCookieSessionStorage } from '@remix-run/node';

import type { SessionStorageRepositoryOptions } from './SessionStorageRepository';

export function getToastStorageRepository({
  maxAge,
  secrets,
  secure,
}: SessionStorageRepositoryOptions) {
  const toastCookie = createCookie('toast', {
    maxAge,
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true,
    secrets,
    secure,
  });

  // export the whole sessionStorage object
  const toastStorage = createCookieSessionStorage<ToastSessionData, ToastFlashData>({
    cookie: toastCookie,
  });

  return { toastStorage };
}

export type ToastStorageRepository = ReturnType<typeof getToastStorageRepository>;
