import { type UserResponse } from '@marble-front/api/marble';
import { getServerEnv } from '@marble-front/builder/utils/environment';
import { Authenticator } from 'remix-auth';

import { usersApi } from '../marble-api';
import { sessionStorage } from './session.server';
import { type GoogleProfile, GoogleStrategy } from './strategies';

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

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<GoogleProfile>(sessionStorage);

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
        // const user = await usersApi.getUsersByUserEmail({
        //   // userEmail: profile.emails[0].value,
        //   userEmail: 'alice.vance@fintech.com',
        // });

        // // Save profile picture from SSO if no existing profile picture
        // if (!user.profilePictureUrl && profile.photos[0].value) {
        //   await usersApi.putUsersUserId({
        //     userId: user.id,
        //     userPreferences: {
        //       ...user,
        //       profilePictureUrl: profile.photos[0].value,
        //     },
        //   });
        // }

        return profile;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  )
);
