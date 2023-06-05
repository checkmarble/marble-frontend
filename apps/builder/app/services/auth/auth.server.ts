import { getServerAuth } from './firebase.server';
import { sessionStorage } from './session.server';

const authErrors = ['NoAccount', 'Unknown'] as const;
export type AuthErrors = (typeof authErrors)[number];

export function isAuthErrors(error: string): error is AuthErrors {
  return authErrors.includes(error as AuthErrors);
}

export class AuthError extends Error {
  constructor(message: AuthErrors) {
    super(message);
    this.name = 'AuthError';
  }
}

export type User = {
  firebaseSessionCookie: string;
};

export const authenticator = getServerAuth({
  sessionStorage,
});
