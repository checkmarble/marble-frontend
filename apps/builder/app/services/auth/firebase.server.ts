import { postToken } from '@marble-front/api/marble';
import { parseForm } from '@marble-front/builder/utils/input-validation';
import { redirect, type SessionStorage } from '@remix-run/node';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { verifyAuthenticityToken } from 'remix-utils';
import * as z from 'zod';

import { getMarbleAPIClient, type MarbleApi } from '../marble-api/init.server';

export interface FirebaseStrategyOptions {
  projectId: string;
  /**
   * The session cookie custom expiration in seconds. The minimum allowed is
   * 5 minutes and the maxium allowed is 2 weeks.
   */
  maxAge: number;
  sessionStorage: SessionStorage;
}

const firebaseSessionCookieKey = 'auth:token';
const firebaseAuthErrorKey = 'auth:error';

interface AuthenticatedInfo {
  apiClient: MarbleApi;
}

export function getServerAuth({
  projectId,
  maxAge,
  sessionStorage,
}: FirebaseStrategyOptions) {
  const app = getApps().length === 0 ? initializeApp({ projectId }) : getApp();
  const serverAuth = getAuth(app);

  async function authenticate(
    request: Request,
    options: {
      successRedirect: string;
      failureRedirect: string;
    }
  ) {
    const session = await sessionStorage.getSession(
      request.headers.get('Cookie')
    );

    let redirectUrl = options.failureRedirect;

    try {
      const { idToken } = await parseForm(
        request,
        z.object({
          idToken: z.string(),
        })
      );

      await verifyAuthenticityToken(request, session);

      await serverAuth.verifyIdToken(idToken);

      const firebaseSessionCookie = await serverAuth.createSessionCookie(
        idToken,
        {
          expiresIn: maxAge * 1000,
        }
      );

      session.set(firebaseSessionCookieKey, firebaseSessionCookie);
      redirectUrl = options.successRedirect;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : 'Unknown error';

      session.flash(firebaseAuthErrorKey, { message });

      redirectUrl = options.failureRedirect;
    }

    throw redirect(redirectUrl, {
      headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
    });
  }

  async function isAuthenticated(
    request: Request,
    options?: { successRedirect?: never; failureRedirect?: never }
  ): Promise<AuthenticatedInfo | null>;
  async function isAuthenticated(
    request: Request,
    options: { successRedirect: string; failureRedirect?: never }
  ): Promise<null>;
  async function isAuthenticated(
    request: Request,
    options: { successRedirect?: never; failureRedirect: string }
  ): Promise<AuthenticatedInfo>;
  async function isAuthenticated(
    request: Request,
    options: { successRedirect: string; failureRedirect: string }
  ): Promise<null>;
  async function isAuthenticated(
    request: Request,
    options:
      | { successRedirect?: never; failureRedirect?: never }
      | { successRedirect: string; failureRedirect?: never }
      | { successRedirect?: never; failureRedirect: string }
      | { successRedirect: string; failureRedirect: string } = {}
  ): Promise<AuthenticatedInfo | null> {
    const session = await sessionStorage.getSession(
      request.headers.get('Cookie')
    );

    const firebaseSessionCookie = session.get(firebaseSessionCookieKey) ?? null;
    try {
      await serverAuth.verifySessionCookie(firebaseSessionCookie);
    } catch (error) {
      if (options.failureRedirect) throw redirect(options.failureRedirect);
      else return null;
    }

    if (options.successRedirect) throw redirect(options.successRedirect);

    const apiClient = getMarbleAPIClient({
      tokenService: {
        getToken: () => session.get('marbleToken'),
        refreshToken: async () => {
          const { access_token } = await postToken({
            authorization: `Bearer ${firebaseSessionCookie}`,
          });
          session.set('marbleToken', access_token);
          return access_token;
        },
      },
    });

    return { apiClient };
  }

  async function logout(
    request: Request,
    options: { redirectTo: string }
  ): Promise<never> {
    const session = await sessionStorage.getSession(
      request.headers.get('Cookie')
    );

    throw redirect(options.redirectTo, {
      headers: {
        'Set-Cookie': await sessionStorage.destroySession(session),
      },
    });
  }

  return {
    authenticate,
    isAuthenticated,
    logout,
    sessionErrorKey: firebaseAuthErrorKey,
  };
}
