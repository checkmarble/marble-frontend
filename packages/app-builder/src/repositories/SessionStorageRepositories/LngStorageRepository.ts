import { createCookie, createCookieSessionStorage } from '@remix-run/node';

import { type SessionStorageRepositoryOptions } from './SessionStorageRepository';

export function getUserPreferencesStorageRepository({
  secrets,
  secure,
}: Omit<SessionStorageRepositoryOptions, 'maxAge'>) {
  const userPreferencesCookie = createCookie('user-preferences', {
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true,
    secrets,
    secure,
  });

  // export the whole sessionStorage object
  const userPreferencesStorage = createCookieSessionStorage<{
    lng: string;
    dateFormat?: string;
    hoursFormat?: string;
  }>({
    cookie: userPreferencesCookie,
  });

  return { userPreferencesStorage };
}

export type UserPreferencesStorageRepository = ReturnType<
  typeof getUserPreferencesStorageRepository
>;

// Legacy export for backward compatibility
export const getLngStorageRepository = getUserPreferencesStorageRepository;
export type LngStorageRepository = UserPreferencesStorageRepository;
