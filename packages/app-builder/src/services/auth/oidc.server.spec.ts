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
