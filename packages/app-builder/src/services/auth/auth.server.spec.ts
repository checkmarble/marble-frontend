import { beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT_ID = 'dd3f4dae-8d90-45ac-892d-e9c1a64d59a2';
const OTHER_TENANT_ID = '1b2f0c5e-6a7d-4e8f-9a0b-1c2d3e4f5a6b';
const ORGANIZATION_ID = '7c1f6a2e-3c0b-4a51-9f27-2b8e4a7d9c10';
const LEGACY_CONFIG = { issuer: 'https://legacy.example' };
const DISCOVERY = {
  tenant_id: TENANT_ID,
  issuer: 'https://tenant.example',
  client_id: 'client',
  redirect_uri: 'https://app.example/oidc/callback',
  scopes: ['openid'],
};

const { discoverTenantOidc, postToken, refreshTenantOidcToken, setOauth2Cookie, setToast, session, updateSession } =
  vi.hoisted(() => {
    const session: { data: { refreshToken?: string; authError?: unknown; [key: string]: unknown } } = { data: {} };
    return {
      session,
      updateSession: vi.fn(async (update: Record<string, unknown>) => {
        Object.assign(session.data, update);
      }),
      discoverTenantOidc: vi.fn(),
      postToken: vi.fn(),
      refreshTenantOidcToken: vi.fn(),
      setOauth2Cookie: vi.fn(),
      setToast: vi.fn(),
    };
  });

vi.mock('@app-builder/services/auth/auth-session.server', () => ({
  useAuthSession: async () => ({ data: session.data, update: updateSession }),
}));
vi.mock('@app-builder/services/toast.server', () => ({ setToast }));
vi.mock('@app-builder/utils/csrf.server', () => ({ CsrfError: class extends Error {}, validateCsrf: vi.fn() }));
vi.mock('@app-builder/utils/environment', () => ({ getServerEnv: () => 'http://api' }));
vi.mock('./oidc.server', () => ({
  discoverTenantOidc,
  refreshTenantOidcToken,
  setOauth2Cookie,
  tenantOidcClientConfig: (discovery: { issuer: string }) => ({ issuer: discovery.issuer }),
}));
vi.mock('marble-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('marble-api')>()),
  marblecoreApi: { postToken, listMyOrganizations: vi.fn(async () => ({ organizations: [] })) },
}));

const buildAuthorizationUrl = vi.fn(async () => ({
  url: 'https://idp.example/authorize',
  state: 'state',
  codeVerifier: 'verifier',
}));
const makeOidcService = vi.fn(async (_config: unknown) => ({ buildAuthorizationUrl }));

const marbleToken = (email: string) => ({
  access_token: `h.${Buffer.from(JSON.stringify({ credentials: { actor_identity: { email } } })).toString('base64url')}.s`,
  token_type: 'Bearer',
  expires_at: '2100-01-01T00:00:00Z',
});

const authService = async () => {
  const { makeAuthenticationServerService } = await import('./auth.server');
  return makeAuthenticationServerService({
    makeOidcService,
    getAppConfigRepository: () => ({ getAppConfig: async () => ({ auth: { oidc: LEGACY_CONFIG } }) }),
  } as never);
};

const request = new Request('https://app.example/');
const switchOrganization = async () =>
  (await authService()).changeOrganization(request, { csrf: 'csrf', newOrganizationId: ORGANIZATION_ID });

describe('authenticateOidc', () => {
  const signIn = async (refreshToken: string) => {
    const tokens = { sub: 'sub', accessToken: 'access', refreshToken, idToken: 'id', expiredAt: 0 };
    await (await authService())
      .authenticateOidc(request, tokens, { successRedirect: '/app', failureRedirect: '/sign-in', tenantId: TENANT_ID })
      .catch((redirect: Response) => redirect);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    session.data = { provider: 'oidc', oidcTenantId: TENANT_ID, refreshToken: 'stored' };
    postToken.mockResolvedValue(marbleToken('ada@example.com'));
  });

  it('never carries a stored refresh token over to a sign-in that returned none', async () => {
    await signIn('');

    expect(updateSession).toHaveBeenCalledWith(expect.objectContaining({ refreshToken: undefined }));
    expect(session.data.refreshToken).toBeUndefined();
  });

  it('stores the refresh token the sign-in returned', async () => {
    await signIn('new');

    expect(session.data.refreshToken).toBe('new');
  });

  it('keeps the session unchanged when Marble rejects the sign-in', async () => {
    postToken.mockRejectedValue(new Error('rejected'));

    await signIn('');

    expect(session.data.refreshToken).toBe('stored');
  });

  it('shows a toast instead of a sign-in error when a switch is rejected', async () => {
    postToken.mockRejectedValue(new Error('rejected'));
    const tokens = { sub: 'sub', accessToken: 'access', refreshToken: 'new', idToken: 'id', expiredAt: 0 };

    const redirect = await (await authService())
      .authenticateOidc(request, tokens, {
        successRedirect: '/app-router',
        failureRedirect: '/app-router',
        organizationId: ORGANIZATION_ID,
        failureToast: 'failed',
      })
      .catch((response: Response) => response);

    expect(setToast).toHaveBeenCalledWith({ type: 'error', message: 'failed' });
    expect(session.data.authError).toBeUndefined();
    expect(session.data.refreshToken).toBe('stored');
    expect((redirect as Response).headers.get('Location')).toBe('/app-router');
  });
});

describe('changeOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    discoverTenantOidc.mockResolvedValue(DISCOVERY);
    postToken.mockResolvedValue(marbleToken('ada@example.com'));
  });

  it('refreshes and replaces the refresh token when one is stored', async () => {
    session.data = { provider: 'oidc', oidcTenantId: TENANT_ID, refreshToken: 'stored' };
    refreshTenantOidcToken.mockResolvedValue({ idToken: 'id', accessToken: 'access', refreshToken: 'rotated' });

    await expect(switchOrganization()).resolves.toBeUndefined();

    expect(refreshTenantOidcToken).toHaveBeenCalledWith(TENANT_ID, 'stored');
    expect(session.data.refreshToken).toBe('rotated');
    expect(buildAuthorizationUrl).not.toHaveBeenCalled();
  });

  describe('without a stored refresh token', () => {
    const noToken = { provider: 'oidc', authToken: marbleToken('Ada@Example.com') };

    it('sends a tenant user to their identity provider, remembering the organization', async () => {
      session.data = { ...noToken, oidcTenantId: TENANT_ID };

      await expect(switchOrganization()).resolves.toEqual({ redirectTo: 'https://idp.example/authorize' });

      expect(discoverTenantOidc).toHaveBeenCalledWith('example.com');
      expect(makeOidcService).toHaveBeenCalledWith({ issuer: DISCOVERY.issuer });
      expect(buildAuthorizationUrl).toHaveBeenCalledWith({ loginHint: 'Ada@Example.com' });
      expect(setOauth2Cookie).toHaveBeenCalledWith(
        request,
        expect.objectContaining({ tenantId: TENANT_ID, organizationId: ORGANIZATION_ID, redirectTo: '/app-router' }),
      );
    });

    it('sends a deployment-wide user to the deployment identity provider', async () => {
      session.data = noToken;

      await expect(switchOrganization()).resolves.toEqual({ redirectTo: 'https://idp.example/authorize' });

      expect(discoverTenantOidc).not.toHaveBeenCalled();
      expect(makeOidcService).toHaveBeenCalledWith(LEGACY_CONFIG);
    });

    it('fails when the email domain now belongs to another tenant', async () => {
      session.data = { ...noToken, oidcTenantId: OTHER_TENANT_ID };

      await expect(switchOrganization()).rejects.toThrow();

      expect(setOauth2Cookie).not.toHaveBeenCalled();
    });
  });
});
