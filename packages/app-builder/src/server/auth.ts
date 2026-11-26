import { createFeatureAccessApi } from '@app-builder/infra/feature-access-api';
import { createMarbleApi, type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { adaptAuthErrors, type CurrentUser } from '@app-builder/models';
import { AppConfig } from '@app-builder/models/app-config';
import { adaptFeatureAccesses, emptyFeatureAccesses, type FeatureAccesses } from '@app-builder/models/feature-access';
import { adaptCurrentUser } from '@app-builder/models/user';
import { Tokens } from '@app-builder/routes/oidc/auth';
import { getAppConfig } from '@app-builder/server/app-config';
import { readMyOrganizations } from '@app-builder/server/organization';
import { type AuthSessionData, useAuthSession } from '@app-builder/services/auth/auth-session.server';
import { refreshFirebaseIdToken } from '@app-builder/services/auth/firebase.server';
import {
  discoverTenantOidc,
  makeOidcService,
  refreshTenantOidcToken,
  setOauth2Cookie,
  tenantOidcClientConfig,
} from '@app-builder/services/auth/oidc.server';
import { getFixedT } from '@app-builder/services/i18n/i18next.server';
import { captureUnexpectedError } from '@app-builder/services/monitoring';
import { setToast } from '@app-builder/services/toast.server';
import { CsrfError, validateCsrf } from '@app-builder/utils/csrf.server';
import { getServerEnv } from '@app-builder/utils/environment';
import * as Sentry from '@sentry/node';
import { redirect } from '@tanstack/react-router';
import { BackendGlobalError, marblecoreApi, type Token, TokenService, TokenServiceUpdate } from 'marble-api';
import * as z from 'zod/v4';

// The router's redirect is a `Response` too, so resource routes can return it as is.
const authRedirect = (href: string) => redirect({ href, statusCode: 302 });

export interface AuthContext {
  provider: AuthSessionData['provider'];
  api: MarbleCoreApi;
  tokenService: TokenService<string>;
  user: CurrentUser;
  entitlements: FeatureAccesses;
}

// Sliding idle timeout: a session is logged out after this much inactivity,
// independently of the absolute lifetime enforced by the session cookie maxAge.
const DEFAULT_SESSION_IDLE_TIMEOUT = 60 * 60 * 24; // 24h, in seconds
// Throttle activity writes so we don't re-issue the session cookie on every request.
const SESSION_ACTIVITY_WRITE_THROTTLE_MS = 60 * 1000; // 1 min

const isMarbleTokenExpired = (token: Token): boolean => {
  return Date.parse(token.expires_at) < Date.now();
};

const schema = z.object({
  type: z.enum(['google', 'microsoft', 'email']),
  idToken: z.string(),
  refreshToken: z.string().optional(),
  csrf: z.string(),
});
export type AuthPayload = z.infer<typeof schema>;

/** `redirectTo` is the identity provider's sign-in page, which completes the switch on its way back. */
export type OrganizationChangeResult = { redirectTo: string } | undefined;

function expectedErrors(error: unknown) {
  return error instanceof CsrfError || error instanceof z.ZodError;
}

async function refreshOidcTokens(
  appConfig: AppConfig,
  refreshToken: string,
  tenantId: string | undefined,
): Promise<{ idToken: string; accessToken: string; refreshToken: string | null }> {
  if (tenantId) {
    const tokens = await refreshTenantOidcToken(tenantId, refreshToken);
    return { idToken: tokens.idToken, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken || null };
  }

  const oidc = await makeOidcService(appConfig.auth.oidc);
  const response = await oidc.refreshToken(refreshToken);
  return {
    idToken: response.idToken(),
    accessToken: response.accessToken(),
    refreshToken: response.hasRefreshToken() ? response.refreshToken() : null,
  };
}

/**
 * Exchange the provider refresh token (Firebase or OIDC) stored in the session
 * for a fresh Marble token. Returns a `status: false` update when no refresh is
 * possible (no stored refresh token, or unsupported provider).
 *
 * Used both proactively when an SSR request finds an expired Marble token (see
 * `isAuthenticated`) and reactively when the backend answers 401 (see the
 * authorization fetch middleware via `getTokenService`).
 */
async function refreshMarbleToken(request: Request): Promise<TokenServiceUpdate> {
  const authSession = await useAuthSession();
  const storedRefreshToken = authSession.data.refreshToken;
  const organizationId = organizationIdFromMarbleToken(authSession.data);

  if (!storedRefreshToken) {
    return { status: false, marbleToken: null, refreshToken: null };
  }
  const appConfig = await getAppConfig(request);

  if (authSession.data.provider === 'oidc') {
    const tenantId = authSession.data.oidcTenantId;
    const response = await refreshOidcTokens(appConfig, storedRefreshToken, tenantId);

    const marbleToken = await getToken({
      idToken: response.idToken,
      oldToken: response.accessToken,
      organizationId,
      tenantId,
    });

    return { status: true, marbleToken, refreshToken: response.refreshToken };
  }

  if (authSession.data.provider === 'firebase') {
    const { idToken, refreshToken } = await refreshFirebaseIdToken(appConfig, storedRefreshToken);

    const marbleToken = await getToken({ idToken, organizationId });

    return { status: true, marbleToken, refreshToken };
  }

  return { status: false, marbleToken: null, refreshToken: null };
}

function getTokenService(marbleAccessToken: string, request: Request): TokenService<string> {
  let update: { value: TokenServiceUpdate } = {
    value: { status: false, marbleToken: null, refreshToken: null },
  };

  return {
    getToken: () => Promise.resolve(update.value.marbleToken?.access_token ?? marbleAccessToken),
    getUpdate: () => update.value,
    get tokenUpdated() {
      return update.value.status;
    },
    refreshToken: async () => {
      const result = await refreshMarbleToken(request);
      if (result.status) {
        update.value = result;
        return result.marbleToken.access_token;
      }

      // No refresh possible — force a logout.
      const authSession = await useAuthSession();
      await authSession.clear();
      throw authRedirect('/sign-in');
    },
  };
}

export async function authenticate(
  request: Request,
  payload: { idToken: string; refreshToken?: string; csrf: string },
  options: {
    successRedirect: string;
    failureRedirect: string;
  },
): Promise<{ redirectTo: string }> {
  const authSession = await useAuthSession();
  const preferredOrganizationId = organizationIdFromMarbleToken(authSession.data);
  let redirectUrl = options.failureRedirect;

  try {
    await validateCsrf(request, payload.csrf);

    const marbleToken = await getToken({ idToken: payload.idToken, preferredOrganizationId });

    await authSession.update({
      authToken: marbleToken,
      provider: 'firebase',
      oidcTenantId: undefined,
      authError: undefined,
      // Lets the server mint a new Marble token during SSR, when no browser is there to refresh it.
      ...(payload.refreshToken ? { refreshToken: payload.refreshToken } : {}),
    });
    redirectUrl = options.successRedirect;
  } catch (error) {
    await authSession.update({ authError: { message: adaptAuthErrors(error) } });
    redirectUrl = options.failureRedirect;

    // Sign-in failures otherwise bounce the user back silently. Expected errors
    // (CSRF, validation) aren't reported to Sentry, so log the cause for observability.
    console.warn('[auth] sign-in failed', {
      cause: error instanceof Error ? `${error.constructor.name}: ${error.message}` : String(error),
    });

    if (!expectedErrors(error)) {
      captureUnexpectedError(error, 'server/auth@authenticate', request);
    }
  }

  return { redirectTo: redirectUrl };
}

export async function authenticateOidc(
  request: Request,
  tokens: Tokens,
  options: {
    successRedirect: string;
    failureRedirect: string;
    tenantId?: string;
    /** The organization to open, when this sign-in completes an organization switch. */
    organizationId?: string;
    /** Shown instead of a sign-in error, for a user who stays signed in and never sees the sign-in page. */
    failureToast?: string;
  },
): Promise<{ redirectTo: string }> {
  const authSession = await useAuthSession();
  const preferredOrganizationId = organizationIdFromMarbleToken(authSession.data);
  let redirectUrl = options.failureRedirect;

  try {
    const { idToken, accessToken, refreshToken } = tokens;
    const { tenantId } = options;

    const { organizationId } = options;
    const marbleToken = await getToken({
      idToken,
      oldToken: accessToken,
      organizationId,
      preferredOrganizationId,
      tenantId,
    });

    await authSession.update({
      authToken: marbleToken,
      provider: 'oidc',
      oidcTenantId: tenantId,
      authError: undefined,
      // A stored token may belong to another account or identity provider: never carry it over.
      refreshToken: refreshToken || undefined,
    });

    redirectUrl = options.successRedirect;
  } catch (error) {
    if (options.failureToast) {
      await setToast({ type: 'error', message: options.failureToast });
    } else {
      await authSession.update({ authError: { message: adaptAuthErrors(error) } });
    }
    redirectUrl = options.failureRedirect;

    if (!expectedErrors(error)) {
      captureUnexpectedError(error, 'server/auth@authenticateOidc', request);
    }
  }

  return { redirectTo: redirectUrl };
}

export async function refresh(
  request: Request,
  payload: { idToken: string; csrf: string; newOrganizationId?: string },
  options: {
    failureRedirect: string;
    preserveSessionOnFailure?: boolean;
  },
): Promise<void> {
  const authSession = await useAuthSession();
  const organizationId = payload.newOrganizationId ?? organizationIdFromMarbleToken(authSession?.data);
  try {
    await validateCsrf(request, payload.csrf);

    const marbleToken = await getToken({ idToken: payload.idToken, organizationId });

    await authSession.update({ authToken: marbleToken });
  } catch (error) {
    if (!expectedErrors(error)) {
      captureUnexpectedError(error, 'server/auth@refresh', request);
    }
    if (options.preserveSessionOnFailure) {
      throw error;
    }

    await authSession.clear();
    throw authRedirect(options.failureRedirect);
  }
}

export async function changeOrganization(
  request: Request,
  payload: { csrf: string; newOrganizationId: string; idToken?: string },
): Promise<OrganizationChangeResult> {
  const authSession = await useAuthSession();
  if (authSession.data.provider === 'firebase') {
    if (!payload.idToken) throw new Error('A Firebase ID token is required to switch organizations');
    await refresh(
      request,
      { ...payload, idToken: payload.idToken },
      {
        failureRedirect: '/sign-in',
        preserveSessionOnFailure: true,
      },
    );
    return undefined;
  }

  if (authSession.data.provider !== 'oidc') throw new Error('Unsupported authentication provider');
  await validateCsrf(request, payload.csrf);
  const appConfig = await getAppConfig(request);
  const tenantId = authSession.data.oidcTenantId;
  if (!authSession.data.refreshToken) {
    return { redirectTo: await startOrganizationSwitchSignIn(request, appConfig, authSession.data, payload) };
  }
  const response = await refreshOidcTokens(appConfig, authSession.data.refreshToken, tenantId);
  // Rotation may invalidate the old refresh token even if the target
  // organization exchange fails. Keep the active Marble token until success.
  if (response.refreshToken) {
    await authSession.update({ refreshToken: response.refreshToken });
  }
  const marbleToken = await getToken({
    idToken: response.idToken,
    oldToken: response.accessToken,
    organizationId: payload.newOrganizationId,
    tenantId,
  });
  await authSession.update({ authToken: marbleToken });
  return undefined;
}

/** Without a refresh token, only the identity provider can issue the tokens for another organization. */
async function startOrganizationSwitchSignIn(
  request: Request,
  appConfig: AppConfig,
  session: AuthSessionData,
  { newOrganizationId }: { newOrganizationId: string },
): Promise<string> {
  const tenantId = session.oidcTenantId;
  const email = emailFromMarbleToken(session);

  let config = appConfig.auth.oidc;
  if (tenantId) {
    const domain = email?.slice(email.lastIndexOf('@') + 1).toLowerCase();
    const discovery = domain ? await discoverTenantOidc(domain) : null;
    if (discovery?.tenant_id !== tenantId) throw new Error('The tenant identity provider cannot be found');
    config = tenantOidcClientConfig(discovery);
  }

  const oidc = await makeOidcService(config);
  const { url, state, codeVerifier } = await oidc.buildAuthorizationUrl({ loginHint: email });
  setOauth2Cookie(request, {
    state,
    codeVerifier,
    tenantId,
    organizationId: newOrganizationId,
    redirectTo: '/app-router',
  });
  return url;
}

/** The signed-in user's context, or null when there is no valid session. */
export async function isAuthenticated(request: Request): Promise<AuthContext | null> {
  const authSession = await useAuthSession();

  let marbleToken = authSession.data.authToken;

  const now = Date.now();
  const lastActivityAt = authSession.data.lastActivityAt;

  // Sliding idle timeout: log out after a period of inactivity, regardless of
  // the absolute session lifetime enforced by the cookie maxAge.
  const idleTimeoutMs = (Number(getServerEnv('SESSION_IDLE_TIMEOUT')) || DEFAULT_SESSION_IDLE_TIMEOUT) * 1000;
  if (marbleToken && lastActivityAt && now - lastActivityAt > idleTimeoutMs) {
    await authSession.clear();
    return null;
  }

  // The browser can't see the Marble token expiry under SSR, so an expired
  // token would otherwise log the user out after inactivity. If we hold a
  // provider refresh token, mint a fresh Marble token server-side first.
  if (marbleToken && isMarbleTokenExpired(marbleToken)) {
    const refreshed = await refreshMarbleToken(request).catch((error) => {
      console.warn(`SSR token refresh failed: ${error.message}`);

      return null;
    });
    if (refreshed?.status) {
      await authSession.update({
        authToken: refreshed.marbleToken,
        ...(refreshed.refreshToken ? { refreshToken: refreshed.refreshToken } : {}),
      });
      marbleToken = refreshed.marbleToken;
    }
  }

  if (!marbleToken || isMarbleTokenExpired(marbleToken)) {
    return null;
  }

  // Record activity for the idle timeout, throttled to avoid re-issuing the
  // session cookie on every request.
  if (!lastActivityAt || now - lastActivityAt > SESSION_ACTIVITY_WRITE_THROTTLE_MS) {
    await authSession.update({ lastActivityAt: now });
  }

  const tokenService = getTokenService(marbleToken.access_token, request);
  const api = createMarbleApi(request, tokenService);
  const featureAccessApi = createFeatureAccessApi(request, tokenService);

  let user: CurrentUser;
  let entitlements: FeatureAccesses;
  try {
    user = adaptCurrentUser((await api.getCredentials()).credentials);
    entitlements = user.organizationId
      ? adaptFeatureAccesses((await featureAccessApi.getEntitlements()).feature_access)
      : emptyFeatureAccesses();
  } catch (err) {
    if (err instanceof BackendGlobalError) {
      const t = await getFixedT(request, ['common']);
      const message =
        err.code === 'disallowed-network'
          ? t('common:errors.backend_global_error.disallowed-network')
          : t('common:errors.backend_global_error.unknown');
      await setToast({
        type: 'error',
        message,
      });
    }

    Sentry.captureException(err);
    return null;
  }

  return {
    provider: authSession.data.provider,
    api,
    tokenService,
    user,
    entitlements,
  };
}

export async function logout(_request: Request, options: { redirectTo: string }): Promise<{ redirectTo: string }> {
  const authSession = await useAuthSession();
  await authSession.clear();
  return { redirectTo: options.redirectTo };
}

async function getToken({
  idToken,
  oldToken,
  organizationId,
  preferredOrganizationId,
  tenantId,
}: {
  idToken: string;
  oldToken?: string;
  organizationId?: string;
  preferredOrganizationId?: string;
  tenantId?: string;
}) {
  // Refreshes and switches use an explicit organization. Sign-in first resolves
  // memberships for the incoming account before reusing a session preference.
  const token = await marblecoreApi.postToken(
    {
      authorization: `Bearer ${idToken}`,
      xOidcAccessToken: oldToken,
      xMarbleTenantId: tenantId,
      organizationId: organizationId,
    },
    { baseUrl: getServerEnv('MARBLE_API_URL') },
  );
  if (organizationId) return token;
  const organizations = await readMyOrganizations(() =>
    marblecoreApi.listMyOrganizations({
      headers: { authorization: `Bearer ${token.access_token}` },
      baseUrl: getServerEnv('MARBLE_API_URL'),
    }),
  );
  if (!organizations.length) return token;
  const selectedOrganization =
    organizations.find((org) => org.id === preferredOrganizationId) ??
    organizations.find((org) => org.environment === 'production') ??
    organizations[0]!;
  const tokenWithOrg = await marblecoreApi.postToken(
    {
      authorization: `Bearer ${idToken}`,
      xOidcAccessToken: oldToken,
      xMarbleTenantId: tenantId,
      organizationId: selectedOrganization.id,
    },
    { baseUrl: getServerEnv('MARBLE_API_URL') },
  );
  return tokenWithOrg;
}

const marbleTokenEmailClaimsSchema = z.object({
  credentials: z.object({ actor_identity: z.object({ email: z.string().optional() }).optional() }).optional(),
});

const marbleTokenOrganizationClaimsSchema = z.object({
  credentials: z.object({ organization_id: z.string().nullish() }).nullish(),
});

function marbleTokenPayload(authSessionData?: AuthSessionData): unknown {
  const payload = authSessionData?.authToken?.access_token.split('.')[1];
  return payload ? JSON.parse(Buffer.from(payload, 'base64url').toString()) : undefined;
}

/** Throws on a malformed email claim rather than starting a sign-in with it. */
function emailFromMarbleToken(authSessionData: AuthSessionData) {
  const payload = marbleTokenPayload(authSessionData);
  if (payload === undefined) return undefined;
  return marbleTokenEmailClaimsSchema.parse(payload).credentials?.actor_identity?.email;
}

function organizationIdFromMarbleToken(authSessionData?: AuthSessionData): string | undefined {
  const claims = marbleTokenOrganizationClaimsSchema.safeParse(marbleTokenPayload(authSessionData));
  const organizationId = claims.success ? claims.data.credentials?.organization_id : undefined;
  // Tokens issued without an org carry the nil UUID.
  if (!organizationId || organizationId === '00000000-0000-0000-0000-000000000000') return undefined;
  return organizationId;
}
