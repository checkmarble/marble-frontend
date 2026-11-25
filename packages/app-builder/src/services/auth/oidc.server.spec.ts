import { beforeEach, describe, expect, it, vi } from 'vitest';

const { setCookie } = vi.hoisted(() => ({ setCookie: vi.fn() }));

vi.mock('@tanstack/react-start/server', () => ({ setCookie }));
vi.mock('@app-builder/utils/environment', () => ({ getServerEnv: () => 'secret' }));

describe('setOauth2Cookie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['a TLS-terminating proxy', 'http://app:3000/', { 'x-forwarded-proto': 'https' }, true],
    ['a direct https request', 'https://app.example/', {}, true],
    ['a proxy forwarding http', 'https://app.example/', { 'x-forwarded-proto': 'http' }, false],
    ['a direct http request', 'http://localhost:3000/', {}, false],
  ])('sets Secure correctly behind %s', async (_, url, headers, secure) => {
    const { setOauth2Cookie } = await import('./oidc.server');

    setOauth2Cookie(new Request(url, { headers }), { state: 'state', codeVerifier: 'verifier' });

    expect(setCookie.mock.calls[0]?.[2]).toMatchObject({ secure });
  });
});

describe('makeOidcService().buildAuthorizationUrl', () => {
  it('sends the login hint and keeps admin extra params away from the PKCE parameters', async () => {
    const issuer = 'https://build-url.idp.example.com';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ authorization_endpoint: `${issuer}/authorize` })),
    );
    const { makeOidcService } = await import('./oidc.server');
    const oidc = await makeOidcService({
      issuer,
      client_id: 'client',
      redirect_uri: 'https://app.example.com/oidc/callback',
      scopes: ['openid', 'email'],
      extra_params: { prompt: 'login', state: 'forced', login_hint: 'admin@example.com' },
    });

    const { url, state } = await oidc.buildAuthorizationUrl({ loginHint: 'ada@example.com' });

    expect(Object.fromEntries(new URL(url).searchParams)).toEqual({
      response_type: 'code',
      client_id: 'client',
      redirect_uri: 'https://app.example.com/oidc/callback',
      state,
      code_challenge_method: 'S256',
      code_challenge: expect.any(String),
      scope: 'openid email',
      prompt: 'login',
      login_hint: 'ada@example.com',
    });
    vi.unstubAllGlobals();
  });
});
