import { type SessionStorageRepositoryOptions } from './SessionStorageRepository';
import { createSignedCookie } from './signed-cookie';

export function getCsrfCookie({ maxAge, secrets, secure }: SessionStorageRepositoryOptions) {
  return createSignedCookie({
    name: 'csrf',
    maxAge,
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets,
    secure,
  });
}

export type CsrfCookie = ReturnType<typeof getCsrfCookie>;
