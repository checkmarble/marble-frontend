import type { AppConfig } from '@app-builder/models/app-config';
import { isNotFoundHttpError } from '@app-builder/models/http-errors';
import { createSignedCookie, sign } from '@app-builder/repositories/SessionStorageRepositories/signed-cookie';
import { getServerEnv } from '@app-builder/utils/environment';
import { setCookie } from '@tanstack/react-start/server';
import { CodeChallengeMethod, generateCodeVerifier, generateState, OAuth2Client, OAuth2Tokens } from 'arctic';
import { marblecoreApi } from 'marble-api';
import * as z from 'zod/v4';
import type { Tokens } from '../../routes/oidc/auth';

export type OidcClientConfig = AppConfig['auth']['oidc'];

const oidcDiscoverySchema = z.object({
  authorization_endpoint: z.url(),
});
type OidcDiscovery = z.infer<typeof oidcDiscoverySchema>;

const discoveryCache = new Map<string, OidcDiscovery>();

async function getOidcDiscovery(issuer: string): Promise<OidcDiscovery> {
  const cached = discoveryCache.get(issuer);
  if (cached) return cached;

  const wellKnownUrl = new URL('.well-known/openid-configuration', issuer.endsWith('/') ? issuer : `${issuer}/`);
  const res = await fetch(wellKnownUrl);
  if (!res.ok) {
    throw new Error(`OIDC discovery for ${issuer} failed with status ${res.status}`);
  }
  const discovery = oidcDiscoverySchema.parse(await res.json());
  discoveryCache.set(issuer, discovery);
  return discovery;
}

// `extra_params` are admin-controlled and applied last: they must not override the PKCE/OAuth parameters.
const RESERVED_AUTHORIZATION_PARAMS = new Set([
  'state',
  'code_challenge',
  'code_challenge_method',
  'redirect_uri',
  'client_id',
  'response_type',
]);

async function requestTokens(tokenEndpoint: string, body: URLSearchParams): Promise<CompatOAuth2Tokens> {
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`OIDC token request failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  if (typeof data !== 'object' || data === null) {
    throw new Error('OIDC token response is invalid');
  }

  return new CompatOAuth2Tokens(data);
}

export const OAUTH2_COOKIE_MAX_AGE = 60 * 10;

export const oauth2CookieSchema = z.object({
  state: z.string(),
  codeVerifier: z.string(),
  tenantId: z.uuid().optional(),
  redirectTo: z.string().optional(),
});
export type OAuth2CookieData = z.infer<typeof oauth2CookieSchema>;

export function getOauth2Cookie({ secrets, secure }: { secrets: string[]; secure: boolean }) {
  return createSignedCookie({
    name: 'oauth2',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: OAUTH2_COOKIE_MAX_AGE,
    secrets,
    secure,
  });
}

/** Writes the `oauth2` cookie from a server function, where the response is not built by hand. */
export function setOauth2Cookie(request: Request, data: OAuth2CookieData) {
  const proto = request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol;
  setCookie('oauth2', sign(JSON.stringify(data), getServerEnv('SESSION_SECRET')), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: OAUTH2_COOKIE_MAX_AGE,
    secure: proto === 'https:',
  });
}

export type TenantOidcDiscovery = Awaited<ReturnType<typeof marblecoreApi.discoverTenantOidc>>;

/** Returns the OIDC configuration of the tenant owning `domain`, or `null` when no tenant claims it. */
export async function discoverTenantOidc(domain: string): Promise<TenantOidcDiscovery | null> {
  try {
    return await marblecoreApi.discoverTenantOidc({ domain }, { baseUrl: getServerEnv('MARBLE_API_URL') });
  } catch (error) {
    if (isNotFoundHttpError(error)) return null;
    throw error;
  }
}

export async function makeOidcService(config: OidcClientConfig) {
  const apiUrl = getServerEnv('MARBLE_API_URL');
  const { client_id, redirect_uri, scopes, issuer, extra_params } = config;

  // Override token endpoint to use marble API proxy (same as old service)
  const tokenEndpoint = `${apiUrl}/oidc/token`;
  const client = new OAuth2Client(client_id, null, redirect_uri);

  return {
    buildAuthorizationUrl: async ({
      loginHint,
    }: {
      loginHint?: string;
    } = {}): Promise<{
      url: string;
      state: string;
      codeVerifier: string;
    }> => {
      const discovery = await getOidcDiscovery(issuer);
      const state = generateState();
      const codeVerifier = generateCodeVerifier();
      const url = client.createAuthorizationURLWithPKCE(
        discovery.authorization_endpoint,
        state,
        CodeChallengeMethod.S256,
        codeVerifier,
        scopes,
      );
      for (const [key, value] of Object.entries(extra_params)) {
        if (RESERVED_AUTHORIZATION_PARAMS.has(key)) continue;
        url.searchParams.set(key, value);
      }
      if (loginHint) {
        url.searchParams.set('login_hint', loginHint);
      }
      return { url: url.toString(), state, codeVerifier };
    },

    refreshToken: async (refreshToken: string) => {
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id,
      });
      if (scopes.length > 0) {
        body.set('scope', scopes.join(' '));
      }
      return requestTokens(tokenEndpoint, body);
    },

    exchangeCode: async (code: string, codeVerifier: string): Promise<Tokens> => {
      const tokens = await requestTokens(
        tokenEndpoint,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri,
          code_verifier: codeVerifier,
          client_id,
        }),
      );
      return {
        sub: 'DOES NOT MATTER',
        accessToken: tokens.accessToken() ?? '',
        refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : '',
        idToken: tokens.idToken(),
        expiredAt: tokens.accessTokenExpiresAt().getTime() ?? 0,
      };
    },
  };
}

// The Marble API holds the tenant's client credentials and redirect URI: only the grant itself is sent.
async function requestTenantTokens(
  tenantId: string,
  body: Parameters<typeof marblecoreApi.exchangeOidcToken>[0],
): Promise<Tokens> {
  const tokens = await marblecoreApi.exchangeOidcToken(
    body,
    { xMarbleTenantId: tenantId },
    { baseUrl: getServerEnv('MARBLE_API_URL') },
  );
  if (!tokens.id_token) {
    throw new Error('OIDC token response is missing the id_token');
  }
  return {
    sub: 'DOES NOT MATTER',
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    idToken: tokens.id_token,
    expiredAt: Date.parse(tokens.expiry) || 0,
  };
}

export function exchangeTenantOidcCode(tenantId: string, code: string, codeVerifier: string): Promise<Tokens> {
  return requestTenantTokens(tenantId, { grant_type: 'authorization_code', code, code_verifier: codeVerifier });
}

export function refreshTenantOidcToken(tenantId: string, refreshToken: string): Promise<Tokens> {
  return requestTenantTokens(tenantId, { grant_type: 'refresh_token', refresh_token: refreshToken });
}

//
// Some OpenID Connect providers do not follow the specification. This class
// extends the one we receive from the IDP to implement more relaxed parsing
// methods in order to accept more kinds of responses.
//
class CompatOAuth2Tokens extends OAuth2Tokens {
  // Microsoft Azure's implementation of OpenID Connect sends the `expires_in`
  // field as a stringified integer, instead of a real integer. This breaks our
  // library, we therefore override their functions in order to parse it anyway.
  override accessTokenExpiresInSeconds(): number {
    if ('expires_in' in this.data) {
      if (typeof this.data.expires_in === 'number') {
        return this.data.expires_in;
      }

      if (typeof this.data.expires_in === 'string') {
        const n = parseInt(this.data.expires_in);
        if (!isNaN(n)) return n;
      }
    }

    throw new Error("Missing or invalid 'expires_in' field");
  }
}
