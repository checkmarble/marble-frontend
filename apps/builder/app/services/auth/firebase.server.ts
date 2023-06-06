import { marbleApi, type Token } from '@marble-front/api/marble';
import { getServerEnv } from '@marble-front/builder/utils/environment.server';
import { parseForm } from '@marble-front/builder/utils/input-validation';
import { redirect, type SessionStorage } from '@remix-run/node';
import { verifyAuthenticityToken } from 'remix-utils';
import * as z from 'zod';

import { logger } from '../logger';
import { getMarbleAPIClient, type MarbleApi } from '../marble-api/init.server';
import { getRoute } from '../routes';

export interface FirebaseStrategyOptions {
  sessionStorage: SessionStorage;
}

const marbleTokenKey = 'auth:token';
const authErrorKey = 'auth:error';

interface AuthenticatedInfo {
  apiClient: MarbleApi;
}

export function getServerAuth({ sessionStorage }: FirebaseStrategyOptions) {
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

      const marbleToken = await marbleApi.postToken(
        {
          authorization: `Bearer ${idToken}`,
        },
        { baseUrl: getServerEnv('MARBLE_API_DOMAIN') }
      );

      session.set(marbleTokenKey, marbleToken);
      redirectUrl = options.successRedirect;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : 'Unknown error';

      logger.error(message);

      session.flash(authErrorKey, { message });

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

    const marbleToken: Token | null = session.get(marbleTokenKey) ?? null;
    if (!marbleToken || marbleToken.expires_in > new Date().toISOString()) {
      if (options.failureRedirect) throw redirect(options.failureRedirect);
      else return null;
    }

    if (options.successRedirect) throw redirect(options.successRedirect);

    const apiClient = getMarbleAPIClient({
      tokenService: {
        getToken: () => Promise.resolve(marbleToken.access_token),
        refreshToken: async () => {
          // We don't handle refresh for now, force a logout when 401 is returned instead
          throw redirect(getRoute('/ressources/auth/logout'));
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
    sessionErrorKey: authErrorKey,
  };
}
