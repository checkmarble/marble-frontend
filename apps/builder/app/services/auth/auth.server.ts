import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from './strategies';
import { sessionStorage } from './session.server';
import { getServerEnv } from '@marble-front/builder/utils/environment';
import type { UserForFront } from '@marble-front/api/marble';
import { usersApi } from '../marble-api';

/**
 * TODO(auth): when provided, use real data model from API
 * - extends UserForFront
 * - remove eventual data transformation in GoogleStrategy
 * - look for other TS issues (e.g. in screens)
 */
export interface User extends Pick<UserForFront, 'id' | 'email'> {
  firstName: string;
  lastName: string;
  photo?: string;
  locale?: string;
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
      /**
       * TODO(auth): get the real userId from Marble API
       * - use the google user email to get data from marble
       * - look with the product to see which update we want to save (if there is some diff between Google data and marble one, what do we want to do ?)
       * - conditionnal error throwing (eg: throw new AuthError('NoAccount'))
       */
      try {
        const user = await usersApi.getUsersByUserEmail({
          // userEmail: profile.emails[0].value,
          userEmail: 'alice.vance@fintech.com',
        });
        return {
          id: user.id,
          email: user.email,
          firstName: 'alice',
          lastName: 'vance',
          photo: profile.photos?.[0].value,
          locale: 'en',
        };
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  )
);
