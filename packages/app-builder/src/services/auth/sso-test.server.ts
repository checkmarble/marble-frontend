import { type AppConfig } from '@app-builder/models/app-config';
import { createSignedCookie, sign } from '@app-builder/repositories/SessionStorageRepositories/signed-cookie';
import { getServerEnv } from '@app-builder/utils/environment';
import { DEFAULT_OIDC_SCOPES } from '@marble/shared';
import { setCookie } from '@tanstack/react-start/server';
import { generateState } from 'arctic';
import * as z from 'zod/v4';
import { buildOidcAuthorizationUrl, isHttpsRequest } from './oidc.server';

// The test sign-in mirrors the backend's tenant sign-in (marble-backend infra/oidc.go,
// repositories/idp/oidc.go, usecases/auth/verifier.go): a test that passes here must not fail there.

const SSO_TEST_COOKIE = 'sso_test';
const SSO_TEST_MAX_AGE = 60 * 5;
const SSO_TEST_COMPLETE_PATH = '/sso-test-complete';
const FETCH_TIMEOUT_MS = 5000;
const MAX_RESPONSE_BYTES = 1024 * 1024;
// go-oidc verifies the ID token signature only with these algorithms.
const SUPPORTED_SIGNING_ALGS = new Set([
  'RS256',
  'RS384',
  'RS512',
  'ES256',
  'ES384',
  'ES512',
  'PS256',
  'PS384',
  'PS512',
  'EdDSA',
]);

/** The only redirect URI the backend hands to identity providers, which the test reuses. */
export const ssoCallbackUrl = (appConfig: AppConfig) => `${appConfig.urls.marble}/oidc/callback`;

const ssoTestCookieSchema = z.object({
  state: z.string(),
  codeVerifier: z.string(),
  nonce: z.string(),
  issuer: z.string(),
  clientId: z.string(),
  redirectUri: z.string(),
  tokenEndpoint: z.string(),
  userinfoEndpoint: z.string().optional(),
  signingAlgs: z.array(z.string()),
  startedAt: z.number(),
  code: z.string().optional(),
  error: z.string().optional(),
  errorDescription: z.string().optional(),
});
export type SsoTestCookieData = z.infer<typeof ssoTestCookieSchema>;

/** Returns `null` for a missing, tampered, malformed or expired cookie. */
export function parseSsoTestCookie(raw: string | null): SsoTestCookieData | null {
  if (!raw) return null;
  try {
    const data = ssoTestCookieSchema.parse(JSON.parse(raw));
    return Date.now() - data.startedAt > SSO_TEST_MAX_AGE * 1000 ? null : data;
  } catch {
    return null;
  }
}

function ssoTestCookieOptions(request: Request) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: SSO_TEST_MAX_AGE,
    secure: isHttpsRequest(request),
  };
}

function getSsoTestCookie(request: Request) {
  return createSignedCookie({
    name: SSO_TEST_COOKIE,
    secrets: [getServerEnv('SESSION_SECRET')],
    ...ssoTestCookieOptions(request),
  });
}

/** Writes the `sso_test` cookie from a server function; `null` clears it. */
export function setSsoTestCookie(request: Request, data: SsoTestCookieData | null) {
  const options = ssoTestCookieOptions(request);
  if (data) setCookie(SSO_TEST_COOKIE, sign(JSON.stringify(data), getServerEnv('SESSION_SECRET')), options);
  else setCookie(SSO_TEST_COOKIE, '', { ...options, maxAge: 0 });
}

export async function readSsoTestCookie(request: Request): Promise<SsoTestCookieData | null> {
  // A malformed cookie must not break `/oidc/callback` for a real sign-in.
  const raw = await getSsoTestCookie(request)
    .parse(request.headers.get('cookie'))
    .catch(() => null);
  return parseSsoTestCookie(raw);
}

/**
 * The test reuses the only redirect URI registered at the identity provider, `/oidc/callback`.
 * Returns the response for a test callback, or `null` when the request belongs to a real sign-in.
 */
export async function handleSsoTestCallback(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const data = await readSsoTestCookie(request);
  if (!data || data.state !== url.searchParams.get('state')) return null;

  const code = url.searchParams.get('code');
  const idpError = url.searchParams.get('error');
  const next: SsoTestCookieData =
    code && !idpError
      ? { ...data, code }
      : {
          ...data,
          error: idpError || 'missing_code',
          errorDescription: url.searchParams.get('error_description') ?? undefined,
        };
  return new Response(null, {
    status: 302,
    headers: [
      ['Location', new URL(SSO_TEST_COMPLETE_PATH, request.url).toString()],
      ['Set-Cookie', await getSsoTestCookie(request).serialize(JSON.stringify(next))],
    ],
  });
}

/** The backend's `ValidateTenantOIDCURL`: https only, http too when it runs in development. */
function isAllowedOidcUrl(raw: string, allowHttp: boolean): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (!url.host || url.username || url.password) return false;
  return url.protocol === 'https:' || (allowHttp && url.protocol === 'http:');
}

type DiscoveryError = 'invalid_discovery' | 'issuer_mismatch' | 'insecure_url';

export function checkDiscovery(
  issuer: string,
  document: unknown,
  allowHttp: boolean,
):
  | {
      ok: true;
      authorizationEndpoint: string;
      tokenEndpoint: string;
      userinfoEndpoint?: string;
      signingAlgs: string[];
    }
  | { ok: false; error: DiscoveryError } {
  if (typeof document !== 'object' || document === null) return { ok: false, error: 'invalid_discovery' };
  const doc = document as Record<string, unknown>;
  if (doc['issuer'] !== issuer) return { ok: false, error: 'issuer_mismatch' };

  const required = [doc['authorization_endpoint'], doc['token_endpoint'], doc['jwks_uri']];
  if (!required.every((endpoint): endpoint is string => typeof endpoint === 'string' && endpoint !== '')) {
    return { ok: false, error: 'invalid_discovery' };
  }
  const userinfoEndpoint = doc['userinfo_endpoint'];
  if (userinfoEndpoint !== undefined && typeof userinfoEndpoint !== 'string') {
    return { ok: false, error: 'invalid_discovery' };
  }
  const listedAlgs = doc['id_token_signing_alg_values_supported'] ?? [];
  if (!Array.isArray(listedAlgs)) return { ok: false, error: 'invalid_discovery' };
  const endpoints = userinfoEndpoint ? [...required, userinfoEndpoint] : required;
  if (!endpoints.every((endpoint) => isAllowedOidcUrl(endpoint, allowHttp))) {
    return { ok: false, error: 'insecure_url' };
  }

  const [authorizationEndpoint, tokenEndpoint] = required as [string, string];
  // Like go-oidc: the supported algorithms the provider lists, or RS256 when it lists none of them.
  const supportedAlgs = listedAlgs.filter((alg) => SUPPORTED_SIGNING_ALGS.has(alg));
  return {
    ok: true,
    authorizationEndpoint,
    tokenEndpoint,
    userinfoEndpoint: userinfoEndpoint || undefined,
    signingAlgs: supportedAlgs.length > 0 ? supportedAlgs : ['RS256'],
  };
}

type StartSsoTestInput = {
  issuer: string;
  clientId: string;
  scopes: string[];
  extraParams: Record<string, string>;
};
export type StartSsoTestResult =
  | { success: true; authorizationUrl: string }
  | { success: false; error: 'unreachable' | DiscoveryError };

export async function startSsoTest(
  input: StartSsoTestInput,
  { redirectUri, allowHttp }: { redirectUri: string; allowHttp: boolean },
): Promise<{ result: StartSsoTestResult; cookie?: SsoTestCookieData }> {
  if (!isAllowedOidcUrl(input.issuer, allowHttp)) return { result: { success: false, error: 'insecure_url' } };

  // ponytail: SSRF surface. The app server fetches the admin-supplied issuer, then the token and userinfo
  // endpoints its discovery document names (https only, no redirects, 5 s timeouts, bodies capped at
  // MAX_RESPONSE_BYTES), and returns the token endpoint's `error_description` or HTTP status to the admin.
  // Private and internal addresses are not blocked; add an IP check before the fetches if admins must not
  // reach the app's network.
  let response: Response;
  try {
    response = await idpFetch(`${input.issuer.replace(/\/$/, '')}/.well-known/openid-configuration`);
    if (!response.ok) {
      await response.body?.cancel();
      return { result: { success: false, error: 'unreachable' } };
    }
  } catch {
    return { result: { success: false, error: 'unreachable' } };
  }

  const discovery = checkDiscovery(input.issuer, await readJson(response), allowHttp);
  if (!discovery.ok) return { result: { success: false, error: discovery.error } };

  const nonce = generateState();
  const { url, state, codeVerifier } = buildOidcAuthorizationUrl(
    discovery.authorizationEndpoint,
    {
      client_id: input.clientId,
      redirect_uri: redirectUri,
      scopes: input.scopes.length > 0 ? input.scopes : DEFAULT_OIDC_SCOPES,
      extra_params: input.extraParams,
    },
    { nonce },
  );
  return {
    result: { success: true, authorizationUrl: url },
    cookie: {
      state,
      codeVerifier,
      nonce,
      issuer: input.issuer,
      clientId: input.clientId,
      redirectUri,
      tokenEndpoint: discovery.tokenEndpoint,
      userinfoEndpoint: discovery.userinfoEndpoint,
      signingAlgs: discovery.signingAlgs,
      startedAt: Date.now(),
    },
  };
}

/** Decodes the JOSE header (segment 0) or the claims (segment 1) of a JWT, without checking its signature. */
function decodeJwtSegment(jwt: string, segment: 0 | 1): Record<string, unknown> | null {
  try {
    const decoded: unknown = JSON.parse(Buffer.from(jwt.split('.')[segment] ?? '', 'base64url').toString('utf8'));
    return typeof decoded === 'object' && decoded !== null && !Array.isArray(decoded)
      ? (decoded as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** Why the backend would reject a sign-in; the settings page translates it. */
type SsoTestProblem = {
  reason:
    | 'not_jwt'
    | 'signing_alg'
    | 'issuer_mismatch'
    | 'audience'
    | 'nonce'
    | 'no_subject'
    | 'claim_type'
    | 'no_id_token'
    | 'http_status'
    | 'claim_missing'
    | 'no_verified_email';
  /** The algorithm, issuer, claim or HTTP status the message names. */
  value?: string;
};

// The backend reads these claims into typed fields: a value of another type fails the sign-in. `null` is ignored.
const TYPED_CLAIMS = {
  email: 'string',
  email_verified: 'boolean',
  given_name: 'string',
  family_name: 'string',
  picture: 'string',
} as const;

const findMistypedClaim = (claims: Record<string, unknown>) =>
  Object.entries(TYPED_CLAIMS).find(([claim, type]) => claims[claim] != null && typeof claims[claim] !== type)?.[0];

/** Returns why the ID token would be rejected, or `null` when it is valid. */
export function checkIdToken(
  header: Record<string, unknown> | null,
  claims: Record<string, unknown> | null,
  expected: { issuer: string; clientId: string; nonce: string; signingAlgs: string[] },
): SsoTestProblem | null {
  if (!header || !claims) return { reason: 'not_jwt' };
  const alg = header['alg'];
  if (typeof alg !== 'string' || !expected.signingAlgs.includes(alg)) {
    return { reason: 'signing_alg', value: String(alg) };
  }
  if (claims['iss'] !== expected.issuer) return { reason: 'issuer_mismatch', value: String(claims['iss']) };
  const audience = claims['aud'];
  if (!(Array.isArray(audience) ? audience : [audience]).includes(expected.clientId)) return { reason: 'audience' };
  if (claims['nonce'] !== expected.nonce) return { reason: 'nonce' };
  if (typeof claims['sub'] !== 'string' || claims['sub'] === '') return { reason: 'no_subject' };
  const mistypedClaim = findMistypedClaim(claims);
  return mistypedClaim ? { reason: 'claim_type', value: mistypedClaim } : null;
}

/** A custom claim is trusted as is; the standard `email` claim only with `email_verified: true`. */
export function readEmail(claims: Record<string, unknown>, emailClaim: string): string | null {
  const email = claims[emailClaim || 'email'];
  if (typeof email !== 'string' || email === '') return null;
  return emailClaim || claims['email_verified'] === true ? email : null;
}

/** Go's `url.QueryEscape`, which the backend applies to the Basic credentials. */
function queryEscape(value: string): string {
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, '+');
}

function idpFetch(
  url: string,
  { headers, ...init }: { method?: string; headers?: Record<string, string>; body?: URLSearchParams } = {},
) {
  return fetch(url, {
    ...init,
    headers: { Accept: 'application/json', ...headers },
    redirect: 'manual',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
}

/** Parses a JSON body, or returns `null` when it is not JSON or is larger than `MAX_RESPONSE_BYTES`. */
async function readJson(response: Response): Promise<unknown> {
  try {
    const reader = response.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
      size += chunk.value.byteLength;
      if (size > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(chunk.value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

type TokenResponse = { ok: boolean; data: Record<string, unknown> | null; status: number };

async function postForm(
  url: string,
  body: URLSearchParams,
  headers: Record<string, string> = {},
): Promise<TokenResponse> {
  try {
    const response = await idpFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
      body,
    });
    const data = await readJson(response);
    return {
      ok: response.ok,
      status: response.status,
      data: typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : null,
    };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

async function fetchUserinfoEmail(endpoint: string, accessToken: string, subject: unknown): Promise<string | null> {
  try {
    const response = await idpFetch(endpoint, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) {
      await response.body?.cancel();
      return null;
    }
    const claims = await readJson(response);
    if (typeof claims !== 'object' || claims === null) return null;
    const userinfo = claims as Record<string, unknown>;
    return userinfo['sub'] === subject && !findMistypedClaim(userinfo) ? readEmail(userinfo, '') : null;
  } catch {
    return null;
  }
}

type FinishSsoTestInput = { clientSecret: string; emailClaim: string };
export type FinishSsoTestResult =
  | { status: 'pending' }
  | { status: 'success'; email: string; testedAt: string }
  | ({
      status: 'error';
      error:
        | 'expired'
        | 'idp_error'
        | 'token_exchange_failed'
        | 'invalid_client'
        | 'invalid_id_token'
        | 'missing_email';
      /** Shown as is: the identity provider's own description or OAuth error code. */
      detail?: string;
    } & Partial<SsoTestProblem>);

export async function finishSsoTest(
  data: SsoTestCookieData | null,
  { clientSecret, emailClaim }: FinishSsoTestInput,
): Promise<FinishSsoTestResult> {
  if (!data) return { status: 'error', error: 'expired' };
  if (data.error) {
    return { status: 'error', error: 'idp_error', detail: data.errorDescription ?? data.error };
  }
  if (!data.code) return { status: 'pending' };

  const grant = {
    grant_type: 'authorization_code',
    code: data.code,
    redirect_uri: data.redirectUri,
    code_verifier: data.codeVerifier,
  };
  const isTokenResponse = (response: TokenResponse) =>
    response.ok && typeof response.data?.['access_token'] === 'string';
  // The backend's golang.org/x/oauth2 tries HTTP Basic first, then the credentials in the body.
  const basic = Buffer.from(`${queryEscape(data.clientId)}:${queryEscape(clientSecret)}`).toString('base64');
  let response = await postForm(data.tokenEndpoint, new URLSearchParams(grant), { Authorization: `Basic ${basic}` });
  if (!isTokenResponse(response)) {
    const body = new URLSearchParams({ ...grant, client_id: data.clientId });
    if (clientSecret) body.set('client_secret', clientSecret);
    const basicError = response.data?.['error'];
    const bodyResponse = await postForm(data.tokenEndpoint, body);
    // A client that only accepts Basic answers `invalid_client` to the body attempt: its Basic error says more.
    const preferBasic =
      bodyResponse.data?.['error'] === 'invalid_client' && !!basicError && basicError !== 'invalid_client';
    response = preferBasic ? response : bodyResponse;
  }
  if (!isTokenResponse(response)) {
    const oauthError = response.data?.['error'];
    if (oauthError === 'invalid_client') return { status: 'error', error: 'invalid_client' };
    const description = response.data?.['error_description'] ?? oauthError;
    if (typeof description === 'string')
      return { status: 'error', error: 'token_exchange_failed', detail: description };
    // Status 0 is a network error or a timeout: there is no answer to name.
    return {
      status: 'error',
      error: 'token_exchange_failed',
      ...(response.status ? { reason: 'http_status', value: String(response.status) } : {}),
    };
  }

  const idToken = response.data?.['id_token'];
  if (typeof idToken !== 'string') return { status: 'error', error: 'invalid_id_token', reason: 'no_id_token' };
  const claims = decodeJwtSegment(idToken, 1);
  const problem = checkIdToken(decodeJwtSegment(idToken, 0), claims, data);
  if (problem || !claims) return { status: 'error', error: 'invalid_id_token', ...(problem ?? { reason: 'not_jwt' }) };

  let email = readEmail(claims, emailClaim);
  if (!email && !emailClaim && data.userinfoEndpoint) {
    email = await fetchUserinfoEmail(data.userinfoEndpoint, response.data?.['access_token'] as string, claims['sub']);
  }
  if (!email) {
    return {
      status: 'error',
      error: 'missing_email',
      ...(emailClaim ? { reason: 'claim_missing', value: emailClaim } : { reason: 'no_verified_email' }),
    };
  }
  return { status: 'success', email, testedAt: new Date().toISOString() };
}
