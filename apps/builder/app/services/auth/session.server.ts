import { type Token } from '@marble-front/api/marble';
import { type ToastMessage } from '@marble-front/builder/components/MarbleToaster';
import { getServerEnv } from '@marble-front/builder/utils/environment.server';
import {
  createCookie,
  createCookieSessionStorage,
  type Session,
} from '@remix-run/node';

const sessionCookie = createCookie('user_session', {
  maxAge: getServerEnv('SESSION_MAX_AGE'),
  sameSite: 'lax', // this helps with CSRF
  path: '/', // remember to add this so the cookie will work in all routes
  httpOnly: true,
  secrets: [getServerEnv('SESSION_SECRET')],
  secure: getServerEnv('NODE_ENV') !== 'development',
});

export type SessionData = { authToken: Token; lng: string };
export type FlashData = {
  toastMessage: ToastMessage;
  authError: { message: string };
};
export type MarbleSession = Session<SessionData, FlashData>;

// export the whole sessionStorage object
export const sessionStorage = createCookieSessionStorage<
  SessionData,
  FlashData
>({
  cookie: sessionCookie,
});

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = sessionStorage;
