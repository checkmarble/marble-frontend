import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from './strategies';
import { sessionStorage } from './session.server';
import { getServerEnv } from '@marble-front/builder/utils/environment';

export interface User {
  userId?: string;
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
      return { userId: profile.id };
    }
  )
);
