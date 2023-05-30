import { getServerEnv } from '@marble-front/builder/utils/environment.server';
import { createCookie, createCookieSessionStorage } from '@remix-run/node';

export const userSessionMaxAge = Number(getServerEnv('SESSION_MAX_AGE'));

const sessionCookie = createCookie('user_session', {
  maxAge: userSessionMaxAge,
  sameSite: 'lax', // this helps with CSRF
  path: '/', // remember to add this so the cookie will work in all routes
  httpOnly: true,
  secrets: [getServerEnv('SESSION_SECRET')],
  secure: getServerEnv('NODE_ENV') !== 'development',
});

// export the whole sessionStorage object
export const sessionStorage = createCookieSessionStorage({
  cookie: sessionCookie,
});

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = sessionStorage;
