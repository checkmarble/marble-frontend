import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from './strategies';
import { sessionStorage } from './session.server';
import { getServerEnv } from '@marble-front/builder/utils/environment';

export interface User {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: [{ value: string }];
  photos: [{ value: string }];
}

const authErrors = ['NoAccount', 'Unknown'] as const;
export type AuthErrors = typeof authErrors[number];

export function isAuthErrors(error: string): error is AuthErrors {
  return authErrors.includes(error as AuthErrors);
}

export class AuthError extends Error {
  constructor(message: AuthErrors) {
    super(message);
    this.name = 'AuthError';
  }
}

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
  new GoogleStrategy(
    {
      clientID: getServerEnv('GOOGLE_CLIENT_ID'),
      clientSecret: getServerEnv('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${getServerEnv('APP_DOMAIN')}/auth/google/callback`,
    },
    async ({ profile }) => {
      //TODO(auth): get the real userId from Marble API
      // throw new AuthError('NoAccount');
      return profile;
    }
  )
);
