import { sign } from '@app-builder/repositories/SessionStorageRepositories/signed-cookie';
import type { SsoTestCookieData } from '@app-builder/services/auth/sso-test.server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT_ID = 'dd3f4dae-8d90-45ac-892d-e9c1a64d59a2';
const tokens = { sub: 'sub', accessToken: 'access', refreshToken: 'refresh', idToken: 'id', expiredAt: 0 };

const authenticateOidc = vi.fn();
const exchangeTenantOidcCode = vi.fn();
let cookie: Record<string, string | boolean | undefined> = {};

vi.mock('@app-builder/services/init.server', () => ({
  initServerServices: () => ({
    appConfigRepository: { getAppConfig: vi.fn() },
    authService: { authenticateOidc },
    i18nextService: { getFixedT: async () => (key: string) => key },
  }),
}));
const updateAuthSession = vi.fn();
vi.mock('@app-builder/services/auth/auth-session.server', () => ({
  useAuthSession: async () => ({ update: updateAuthSession }),
}));
const setToast = vi.fn();
vi.mock('@app-builder/services/toast.server', () => ({ setToast }));
vi.mock('@app-builder/utils/environment', () => ({ getServerEnv: () => 'secret' }));
vi.mock('../../services/auth/oidc.server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services/auth/oidc.server')>()),
  getOauth2Cookie: () => ({ parse: async () => JSON.stringify(cookie), serialize: async () => 'oauth2=; Max-Age=0' }),
  exchangeTenantOidcCode,
  makeOidcService: vi.fn(),
}));

const callback = async (search = 'code=the-code&state=the-state', headers: Record<string, string> = {}) => {
  const { Route } = await import('./callback');
  const { GET } = Route.options.server!.handlers as { GET: (ctx: { request: Request }) => Promise<Response> };
  return GET({ request: new Request(`http://localhost:3000/oidc/callback?${search}`, { headers }) });
};

describe('/oidc/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    exchangeTenantOidcCode.mockResolvedValue(tokens);
    authenticateOidc.mockRejectedValue(new Response(null, { status: 302, headers: { Location: '/app-router' } }));
  });

  it('signs in against the tenant that started the sign-in', async () => {
    cookie = { state: 'the-state', codeVerifier: 'the-verifier', tenantId: TENANT_ID };

    const response = await callback();

    expect(exchangeTenantOidcCode).toHaveBeenCalledWith(TENANT_ID, 'the-code', 'the-verifier');
    expect(authenticateOidc).toHaveBeenCalledWith(
      expect.any(Request),
      tokens,
      expect.objectContaining({ tenantId: TENANT_ID }),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/app-router');
    expect(response.headers.get('Set-Cookie')).toBe('oauth2=; Max-Age=0');
  });

  it('opens the organization an organization switch asked for', async () => {
    const organizationId = '7c1f6a2e-3c0b-4a51-9f27-2b8e4a7d9c10';
    cookie = { state: 'the-state', codeVerifier: 'the-verifier', tenantId: TENANT_ID, organizationId };

    await callback();

    expect(authenticateOidc).toHaveBeenCalledWith(
      expect.any(Request),
      tokens,
      expect.objectContaining({
        organizationId,
        failureRedirect: '/app-router',
        failureToast: 'navigation:organization_change.switch_error',
      }),
    );
  });

  describe('when an organization switch fails', () => {
    const pendingSwitch = {
      state: 'the-state',
      codeVerifier: 'the-verifier',
      tenantId: TENANT_ID,
      organizationId: '7c1f6a2e-3c0b-4a51-9f27-2b8e4a7d9c10',
    };
    const switchError = { type: 'error', message: 'navigation:organization_change.switch_error' };

    it('returns to the app with a toast when the identity provider refuses', async () => {
      cookie = pendingSwitch;

      const response = await callback('error=access_denied&state=the-state');

      expect(setToast).toHaveBeenCalledWith(switchError);
      expect(updateAuthSession).not.toHaveBeenCalled();
      expect(response.headers.get('Location')).toBe('http://localhost:3000/app-router');
    });

    it('returns to the app with a toast when the code exchange fails', async () => {
      cookie = pendingSwitch;
      exchangeTenantOidcCode.mockRejectedValue(new Error('exchange failed'));

      const response = await callback();

      expect(setToast).toHaveBeenCalledWith(switchError);
      expect(response.headers.get('Location')).toBe('http://localhost:3000/app-router');
    });
  });

  it('keeps a signed-out tab signed out when Marble rejects the sign-in', async () => {
    cookie = { state: 'the-state', codeVerifier: 'the-verifier', tenantId: TENANT_ID, signedOut: true };

    await callback();

    expect(authenticateOidc).toHaveBeenCalledWith(
      expect.any(Request),
      tokens,
      expect.objectContaining({ failureRedirect: '/sign-in?signedOut=1' }),
    );
  });

  describe.each([
    { name: 'sign-in', data: {}, destination: '/sign-in' },
    { name: 'signed-out sign-in', data: { signedOut: true }, destination: '/sign-in?signedOut=1' },
    {
      name: 'organization switch',
      data: { organizationId: '7c1f6a2e-3c0b-4a51-9f27-2b8e4a7d9c10' },
      destination: '/app-router',
    },
  ])('with a pending $name', ({ data, destination }) => {
    it.each([
      { search: '', status: 302 },
      { search: 'code=the-code', status: 302 },
      { search: 'state=the-state', status: 302 },
      { search: 'code=the-code&state=forged', status: 400 },
    ])('preserves the pending attempt for an unverified callback: $search', async ({ search, status }) => {
      cookie = { state: 'the-state', codeVerifier: 'the-verifier', tenantId: TENANT_ID, ...data };

      const response = await callback(search);

      expect(response.status).toBe(status);
      if (status === 302) {
        expect(response.headers.get('Location')).toBe(`http://localhost:3000${destination}`);
      }
      expect(response.headers.get('Set-Cookie')).toBeNull();
      expect(exchangeTenantOidcCode).not.toHaveBeenCalled();
      expect(authenticateOidc).not.toHaveBeenCalled();
      expect(updateAuthSession).not.toHaveBeenCalled();
      expect(setToast).not.toHaveBeenCalled();
    });
  });

  describe('when the identity provider returns an error', () => {
    const pendingSignIn = { state: 'the-state', codeVerifier: 'the-verifier', tenantId: TENANT_ID };

    it('reports the refusal and ends the sign-in when the state matches', async () => {
      cookie = pendingSignIn;

      const response = await callback('error=access_denied&state=the-state');

      expect(updateAuthSession).toHaveBeenCalledWith({ authError: { message: 'SsoRefused' } });
      expect(response.headers.get('Location')).toBe('http://localhost:3000/sign-in');
      expect(response.headers.get('Set-Cookie')).toBe('oauth2=; Max-Age=0');
    });

    it('keeps a signed-out tab signed out', async () => {
      cookie = { ...pendingSignIn, signedOut: true };

      const response = await callback('error=access_denied&state=the-state');

      expect(response.headers.get('Location')).toBe('http://localhost:3000/sign-in?signedOut=1');
    });

    it.each(['error=access_denied&state=forged', 'error=access_denied'])('changes nothing for %s', async (search) => {
      cookie = pendingSignIn;

      const response = await callback(search);

      expect(updateAuthSession).not.toHaveBeenCalled();
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('http://localhost:3000/sign-in');
      expect(response.headers.get('Set-Cookie')).toBeNull();
    });
  });

  describe('with a pending SSO test sign-in', () => {
    const ssoTest: SsoTestCookieData = {
      state: 'test-state',
      codeVerifier: 'test-verifier',
      nonce: 'test-nonce',
      issuer: 'https://idp.example.com',
      clientId: 'client',
      redirectUri: 'http://localhost:3000/oidc/callback',
      tokenEndpoint: 'https://idp.example.com/token',
      signingAlgs: ['RS256'],
      startedAt: Date.now(),
    };
    const ssoTestCookie = (data: object, secret = 'secret') =>
      `sso_test=${encodeURIComponent(sign(JSON.stringify(data), secret))}`;
    const storedTest = async (response: Response) => {
      const { readSsoTestCookie } = await import('@app-builder/services/auth/sso-test.server');
      return readSsoTestCookie(
        new Request('http://localhost:3000/', { headers: { cookie: response.headers.get('Set-Cookie') ?? '' } }),
      );
    };

    beforeEach(() => {
      cookie = { state: 'the-state', codeVerifier: 'the-verifier', tenantId: TENANT_ID };
    });

    it.each([
      { search: 'code=test-code&state=test-state', stored: { code: 'test-code' } },
      {
        search: 'error=access_denied&error_description=Denied&state=test-state',
        stored: { error: 'access_denied', errorDescription: 'Denied' },
      },
    ])('stores the result for $search and leaves the sign-in alone', async ({ search, stored }) => {
      const response = await callback(search, { cookie: ssoTestCookie(ssoTest) });

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('http://localhost:3000/sso-test-complete');
      expect(await storedTest(response)).toEqual({ ...ssoTest, ...stored });
      expect(response.headers.get('Set-Cookie')).not.toContain('oauth2=');
      expect(exchangeTenantOidcCode).not.toHaveBeenCalled();
      expect(authenticateOidc).not.toHaveBeenCalled();
      expect(updateAuthSession).not.toHaveBeenCalled();
      expect(setToast).not.toHaveBeenCalled();
    });

    it.each([
      { name: 'its state differs', testCookie: ssoTestCookie(ssoTest) },
      { name: 'its signature is wrong', testCookie: ssoTestCookie({ ...ssoTest, state: 'the-state' }, 'forged') },
      { name: 'it expired', testCookie: ssoTestCookie({ ...ssoTest, state: 'the-state', startedAt: 0 }) },
      { name: 'it is not URI-encoded', testCookie: 'sso_test=%E0%A4%A' },
    ])('runs the regular sign-in when $name', async ({ testCookie }) => {
      const response = await callback('code=the-code&state=the-state', { cookie: testCookie });

      expect(exchangeTenantOidcCode).toHaveBeenCalledWith(TENANT_ID, 'the-code', 'the-verifier');
      expect(authenticateOidc).toHaveBeenCalled();
      expect(response.headers.get('Location')).toBe('/app-router');
      expect(response.headers.get('Set-Cookie')).toBe('oauth2=; Max-Age=0');
    });
  });
});
