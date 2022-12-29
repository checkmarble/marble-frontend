import { getServerEnv } from '@marble-front/builder/utils/environment';
import { createCookieSessionStorage } from '@remix-run/node';

// export the whole sessionStorage object
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'user_session', // use any name you want here
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [getServerEnv('SESSION_SECRET')], // replace this with an actual secret
    secure: process.env.NODE_ENV !== 'development', // not enabled in dev so cookie get sent to server
  },
});

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = sessionStorage;
