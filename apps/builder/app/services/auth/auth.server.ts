import { HttpError } from 'oazapfts';

import { getServerAuth } from './firebase.server';
import { sessionStorage } from './session.server';

const authErrors = ['NoAccount', 'Unknown'] as const;
export type AuthErrors = (typeof authErrors)[number];

export function getAuthErrors(error: unknown): AuthErrors {
  if (
    error instanceof HttpError &&
    error.status === 401 &&
    typeof error.data === 'string' &&
    error.data?.includes('unknown user')
  )
    return 'NoAccount';

  return 'Unknown';
}

export type User = {
  firebaseSessionCookie: string;
};

export const authenticator = getServerAuth({
  sessionStorage,
});
