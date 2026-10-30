import { beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT_ID = 'dd3f4dae-8d90-45ac-892d-e9c1a64d59a2';
const tokens = { sub: 'sub', accessToken: 'access', refreshToken: 'refresh', idToken: 'id', expiredAt: 0 };

const authenticateOidc = vi.fn();
const exchangeTenantOidcCode = vi.fn();
let cookie: Record<string, string> = {};

vi.mock('@app-builder/services/init.server', () => ({
  initServerServices: () => ({ appConfigRepository: { getAppConfig: vi.fn() }, authService: { authenticateOidc } }),
}));
vi.mock('@app-builder/services/auth/auth-session.server', () => ({ useAuthSession: vi.fn() }));
vi.mock('@app-builder/services/toast.server', () => ({ setToast: vi.fn() }));
vi.mock('@app-builder/utils/environment', () => ({ getServerEnv: () => 'secret' }));
vi.mock('../../services/auth/oidc.server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services/auth/oidc.server')>()),
  getOauth2Cookie: () => ({ parse: async () => JSON.stringify(cookie), serialize: async () => 'oauth2=; Max-Age=0' }),
  exchangeTenantOidcCode,
  makeOidcService: vi.fn(),
}));

const callback = async () => {
  const { Route } = await import('./callback');
  const { GET } = Route.options.server!.handlers as { GET: (ctx: { request: Request }) => Promise<Response> };
  return GET({ request: new Request('http://localhost:3000/oidc/callback?code=the-code&state=the-state') });
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
  });
});
