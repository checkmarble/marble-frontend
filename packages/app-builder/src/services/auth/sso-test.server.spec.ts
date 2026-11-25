import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checkDiscovery,
  checkIdToken,
  finishSsoTest,
  parseSsoTestCookie,
  readEmail,
  type SsoTestCookieData,
  startSsoTest,
} from './sso-test.server';

vi.mock('@app-builder/utils/environment', () => ({ getServerEnv: () => 'secret' }));

const ISSUER = 'https://idp.example.com';
const discovery = {
  issuer: ISSUER,
  authorization_endpoint: `${ISSUER}/authorize`,
  token_endpoint: `${ISSUER}/token`,
  jwks_uri: `${ISSUER}/keys`,
};
const pending: SsoTestCookieData = {
  state: 'state',
  codeVerifier: 'verifier',
  nonce: 'nonce',
  issuer: ISSUER,
  clientId: 'client',
  redirectUri: 'https://app.example.com/oidc/callback',
  tokenEndpoint: `${ISSUER}/token`,
  signingAlgs: ['RS256'],
  startedAt: Date.now(),
};
const validClaims = { iss: ISSUER, aud: 'client', nonce: 'nonce', sub: 'user-1' };
const base64url = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
const jwt = (claims: object) => `${base64url({ alg: 'RS256' })}.${base64url(claims)}.signature`;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('parseSsoTestCookie', () => {
  it('reads a pending test', () => {
    expect(parseSsoTestCookie(JSON.stringify(pending))).toEqual(pending);
  });

  it.each([
    ['no cookie', null],
    ['malformed JSON', '{'],
    ['a missing field', JSON.stringify({ ...pending, nonce: undefined })],
    ['an expired test', JSON.stringify({ ...pending, startedAt: Date.now() - 5 * 60 * 1000 - 1 })],
  ])('rejects %s', (_, raw) => {
    expect(parseSsoTestCookie(raw)).toBeNull();
  });
});

describe('checkDiscovery', () => {
  it('returns the endpoints of a valid document', () => {
    expect(checkDiscovery(ISSUER, discovery, false)).toEqual({
      ok: true,
      authorizationEndpoint: discovery.authorization_endpoint,
      tokenEndpoint: discovery.token_endpoint,
      userinfoEndpoint: undefined,
      signingAlgs: ['RS256'],
    });
  });

  it.each([
    ['the supported algorithms it lists', ['HS256', 'ES256', 'RS256'], ['ES256', 'RS256']],
    ['RS256 when it lists no supported algorithm', ['HS256'], ['RS256']],
  ])('verifies signatures with %s', (_, listed, signingAlgs) => {
    expect(
      checkDiscovery(ISSUER, { ...discovery, id_token_signing_alg_values_supported: listed }, false),
    ).toMatchObject({ ok: true, signingAlgs });
  });

  it.each([
    ['a trailing slash', { ...discovery, issuer: `${ISSUER}/` }],
    ['another host', { ...discovery, issuer: 'https://other.example.com' }],
  ])('requires the exact issuer, not one with %s', (_, document) => {
    expect(checkDiscovery(ISSUER, document, false)).toEqual({ ok: false, error: 'issuer_mismatch' });
  });

  it.each(['authorization_endpoint', 'token_endpoint', 'jwks_uri'])('requires %s', (key) => {
    expect(checkDiscovery(ISSUER, { ...discovery, [key]: undefined }, false)).toEqual({
      ok: false,
      error: 'invalid_discovery',
    });
  });

  it('rejects a document that is not an object', () => {
    expect(checkDiscovery(ISSUER, null, false)).toEqual({ ok: false, error: 'invalid_discovery' });
  });

  it.each([
    ['an http endpoint', { token_endpoint: 'http://idp.example.com/token' }],
    ['an http userinfo endpoint', { userinfo_endpoint: 'http://idp.example.com/userinfo' }],
    ['credentials in an endpoint', { jwks_uri: 'https://user:pass@idp.example.com/keys' }],
  ])('rejects %s', (_, override) => {
    expect(checkDiscovery(ISSUER, { ...discovery, ...override }, false)).toEqual({
      ok: false,
      error: 'insecure_url',
    });
  });

  it('accepts http only in development', () => {
    const httpIssuer = 'http://localhost:8080/realms/marble';
    const document = {
      issuer: httpIssuer,
      authorization_endpoint: `${httpIssuer}/auth`,
      token_endpoint: `${httpIssuer}/token`,
      jwks_uri: `${httpIssuer}/certs`,
    };
    expect(checkDiscovery(httpIssuer, document, true)).toMatchObject({ ok: true });
    expect(checkDiscovery(httpIssuer, document, false)).toEqual({ ok: false, error: 'insecure_url' });
  });
});

describe('checkIdToken', () => {
  const header = { alg: 'RS256' };
  const expected = { issuer: ISSUER, clientId: 'client', nonce: 'nonce', signingAlgs: ['RS256'] };

  it.each([
    ['a string audience', validClaims],
    ['an audience list', { ...validClaims, aud: ['other', 'client'] }],
    ['a null optional claim', { ...validClaims, email_verified: null }],
  ])('accepts %s', (_, claims) => {
    expect(checkIdToken(header, claims, expected)).toBeNull();
  });

  it.each([
    ['another issuer', { ...validClaims, iss: `${ISSUER}/` }, 'issuer_mismatch'],
    ['another audience', { ...validClaims, aud: ['other'] }, 'audience'],
    ['another nonce', { ...validClaims, nonce: 'replayed' }, 'nonce'],
    ['no nonce', { ...validClaims, nonce: undefined }, 'nonce'],
    ['no subject', { ...validClaims, sub: '' }, 'no_subject'],
    ['a string email_verified', { ...validClaims, email_verified: 'true' }, 'claim_type'],
    ['a non-string given_name', { ...validClaims, given_name: ['Ada'] }, 'claim_type'],
  ])('rejects %s', (_, claims, reason) => {
    expect(checkIdToken(header, claims, expected)).toMatchObject({ reason });
  });

  it('rejects a signing algorithm the backend does not verify', () => {
    expect(checkIdToken({ alg: 'HS256' }, validClaims, expected)).toEqual({ reason: 'signing_alg', value: 'HS256' });
  });
});

describe('readEmail', () => {
  it.each([
    ['a verified email', { email: 'ada@example.com', email_verified: true }, '', 'ada@example.com'],
    ['an unverified email', { email: 'ada@example.com', email_verified: false }, '', null],
    ['a string email_verified', { email: 'ada@example.com', email_verified: 'true' }, '', null],
    ['no email', {}, '', null],
    ['an unverified custom claim', { upn: 'ada@example.com' }, 'upn', 'ada@example.com'],
    ['a missing custom claim', { email: 'ada@example.com', email_verified: true }, 'upn', null],
  ])('reads %s', (_, claims, emailClaim, email) => {
    expect(readEmail(claims, emailClaim)).toBe(email);
  });
});

describe('with a stubbed identity provider', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('startSsoTest', () => {
    const options = { redirectUri: pending.redirectUri, allowHttp: false };

    it('builds the authorization request the real sign-in sends, with a nonce', async () => {
      fetchMock.mockResolvedValue(json(discovery));

      const { result, cookie } = await startSsoTest(
        { issuer: ISSUER, clientId: 'client', scopes: [], extraParams: { prompt: 'login', state: 'forced' } },
        options,
      );

      expect(fetchMock).toHaveBeenCalledWith(
        `${ISSUER}/.well-known/openid-configuration`,
        expect.objectContaining({ redirect: 'manual' }),
      );
      if (!result.success || !cookie) throw new Error('expected a started test');
      const url = new URL(result.authorizationUrl);
      expect(url.origin + url.pathname).toBe(discovery.authorization_endpoint);
      expect(Object.fromEntries(url.searchParams)).toMatchObject({
        client_id: 'client',
        redirect_uri: pending.redirectUri,
        scope: 'openid profile email',
        code_challenge_method: 'S256',
        prompt: 'login',
        state: cookie.state,
        nonce: cookie.nonce,
      });
      expect(cookie).toMatchObject({ issuer: ISSUER, clientId: 'client', tokenEndpoint: discovery.token_endpoint });
    });

    it('does not fetch an http issuer outside development', async () => {
      const { result } = await startSsoTest(
        { issuer: 'http://idp.example.com', clientId: 'client', scopes: [], extraParams: {} },
        options,
      );

      expect(result).toEqual({ success: false, error: 'insecure_url' });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([
      ['a network error', () => Promise.reject(new TypeError('fetch failed'))],
      ['a redirect', () => Promise.resolve(new Response(null, { status: 302 }))],
    ])('reports %s as unreachable', async (_, response) => {
      fetchMock.mockImplementation(response);

      const { result, cookie } = await startSsoTest(
        { issuer: ISSUER, clientId: 'client', scopes: ['openid'], extraParams: {} },
        options,
      );

      expect(result).toEqual({ success: false, error: 'unreachable' });
      expect(cookie).toBeUndefined();
    });

    it('stops reading a discovery document over 1 MB', async () => {
      fetchMock.mockResolvedValue(json({ ...discovery, padding: 'x'.repeat(1024 * 1024) }));

      const { result } = await startSsoTest(
        { issuer: ISSUER, clientId: 'client', scopes: ['openid'], extraParams: {} },
        options,
      );

      expect(result).toEqual({ success: false, error: 'invalid_discovery' });
    });
  });

  describe('finishSsoTest', () => {
    const input = { clientSecret: 's3cret', emailClaim: '' };
    const tokens = (claims: object) => json({ access_token: 'access', id_token: jwt(claims) });
    const withCode = { ...pending, code: 'the-code' };

    it.each([
      ['no test', null, { status: 'error', error: 'expired' }],
      ['no code yet', pending, { status: 'pending' }],
      [
        'an identity provider error',
        { ...pending, error: 'access_denied', errorDescription: 'Denied' },
        { status: 'error', error: 'idp_error', detail: 'Denied' },
      ],
    ])('reports %s without calling the provider', async (_, data, result) => {
      expect(await finishSsoTest(data, input)).toEqual(result);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('exchanges the code with HTTP Basic credentials', async () => {
      fetchMock.mockResolvedValue(tokens({ ...validClaims, email: 'ada@example.com', email_verified: true }));

      expect(await finishSsoTest(withCode, input)).toEqual({
        status: 'success',
        email: 'ada@example.com',
        testedAt: expect.any(String),
      });
      const [url, init] = fetchMock.mock.calls[0]!;
      expect(url).toBe(pending.tokenEndpoint);
      expect(new Headers(init?.headers).get('Authorization')).toBe(
        `Basic ${Buffer.from('client:s3cret').toString('base64')}`,
      );
      expect(Object.fromEntries(init?.body as URLSearchParams)).toEqual({
        grant_type: 'authorization_code',
        code: 'the-code',
        redirect_uri: pending.redirectUri,
        code_verifier: 'verifier',
      });
    });

    it('retries with the credentials in the body when Basic is refused', async () => {
      fetchMock
        .mockResolvedValueOnce(json({ error: 'invalid_client' }, 401))
        .mockResolvedValueOnce(tokens({ ...validClaims, email: 'ada@other.com', email_verified: true }));

      expect(await finishSsoTest(withCode, input)).toMatchObject({ status: 'success', email: 'ada@other.com' });
      expect(Object.fromEntries(fetchMock.mock.calls[1]?.[1]?.body as URLSearchParams)).toMatchObject({
        client_id: 'client',
        client_secret: 's3cret',
      });
    });

    it('form-encodes the Basic credentials as the backend does', async () => {
      fetchMock.mockResolvedValue(tokens({ ...validClaims, email: 'ada@example.com', email_verified: true }));

      await finishSsoTest(withCode, { ...input, clientSecret: "a b!*'()~" });

      expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Authorization')).toBe(
        `Basic ${Buffer.from('client:a+b%21%2A%27%28%29~').toString('base64')}`,
      );
    });

    it('reports the Basic error when the body attempt only says invalid_client', async () => {
      fetchMock
        .mockResolvedValueOnce(json({ error: 'invalid_grant', error_description: 'Code expired' }, 400))
        .mockResolvedValueOnce(json({ error: 'invalid_client' }, 401));

      expect(await finishSsoTest(withCode, input)).toEqual({
        status: 'error',
        error: 'token_exchange_failed',
        detail: 'Code expired',
      });
    });

    it.each([
      [{ error: 'invalid_client' }, { status: 'error', error: 'invalid_client' }],
      [
        { error: 'invalid_grant', error_description: 'Code expired' },
        { status: 'error', error: 'token_exchange_failed', detail: 'Code expired' },
      ],
      [{}, { status: 'error', error: 'token_exchange_failed', reason: 'http_status', value: '400' }],
    ])('reports a refused exchange: %j', async (body, result) => {
      fetchMock.mockImplementation(async () => json(body, 400));

      expect(await finishSsoTest(withCode, input)).toEqual(result);
    });

    it('rejects an ID token issued for another nonce', async () => {
      fetchMock.mockResolvedValue(tokens({ ...validClaims, nonce: 'other' }));

      expect(await finishSsoTest(withCode, input)).toEqual({
        status: 'error',
        error: 'invalid_id_token',
        reason: 'nonce',
      });
    });

    it('falls back to the userinfo endpoint like the backend', async () => {
      fetchMock
        .mockResolvedValueOnce(tokens(validClaims))
        .mockResolvedValueOnce(json({ sub: 'user-1', email: 'ada@example.com', email_verified: true }));

      expect(await finishSsoTest({ ...withCode, userinfoEndpoint: `${ISSUER}/userinfo` }, input)).toMatchObject({
        status: 'success',
        email: 'ada@example.com',
      });
      expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get('Authorization')).toBe('Bearer access');
    });

    it.each([
      ['no verified email and no userinfo endpoint', withCode, input],
      ['a missing custom claim', withCode, { ...input, emailClaim: 'upn' }],
      ['a userinfo response for another subject', { ...withCode, userinfoEndpoint: `${ISSUER}/userinfo` }, input],
    ])('reports a missing email for %s', async (_, data, finishInput) => {
      fetchMock
        .mockResolvedValueOnce(tokens({ ...validClaims, email: 'ada@example.com' }))
        .mockResolvedValueOnce(json({ sub: 'someone-else', email: 'ada@example.com', email_verified: true }));

      expect(await finishSsoTest(data, finishInput)).toMatchObject({ status: 'error', error: 'missing_email' });
    });
  });
});
