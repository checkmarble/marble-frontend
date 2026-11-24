import { describe, expect, it } from 'vitest';
import { buildSsoRecoveryCurl, buildSsoUpdateCurl } from './tenant-oidc';

describe('buildSsoRecoveryCurl', () => {
  it('never sends a client secret', () => {
    expect(buildSsoRecoveryCurl({ apiUrl: 'https://api.example.com', tenantId: 'tenant-1' })).not.toContain(
      'client_secret',
    );
  });

  it('exports the key on the first line only when one is given', () => {
    const withoutKey = buildSsoRecoveryCurl({ apiUrl: null, tenantId: 'tenant-1' });
    const withKey = buildSsoRecoveryCurl({ apiUrl: null, tenantId: 'tenant-1', apiKey: 'key-1' });

    expect(withoutKey).not.toContain('export');
    expect(withKey.split('\n')[0]).toBe(`export MARBLE_API_KEY='key-1'`);
    expect(withKey.split('\n').slice(1).join('\n')).toBe(withoutKey);
  });

  it('single-quotes the key so the shell expands nothing in it', () => {
    const curl = buildSsoRecoveryCurl({ apiUrl: null, tenantId: 'tenant-1', apiKey: `a'b$c` });

    expect(curl.split('\n')[0]).toBe(`export MARBLE_API_KEY='a'\\''b$c'`);
  });
});

describe('buildSsoUpdateCurl', () => {
  // The body is the single-quoted shell word after `-d`; `'\''` is how a quote is written inside it.
  const parseBody = (curl: string) => JSON.parse(curl.slice(curl.indexOf("-d '") + 4, -1).replaceAll(`'\\''`, "'"));

  it('writes the saved configuration back unchanged, sso_enabled explicit and client_secret left out to keep the stored one', () => {
    const curl = buildSsoUpdateCurl({
      apiUrl: 'https://api.example.com',
      tenantId: 'tenant-1',
      configuration: {
        issuer: 'https://idp.example.com',
        clientId: `it's "a" \\client`,
        scopes: ['openid', 'offline_access'],
        extraParams: { prompt: "o'clock" },
        emailClaim: 'upn',
        ssoEnabled: true,
      },
    });

    expect(parseBody(curl)).toEqual({
      issuer: 'https://idp.example.com',
      client_id: `it's "a" \\client`,
      scopes: ['openid', 'offline_access'],
      extra_params: { prompt: "o'clock" },
      email_claim: 'upn',
      sso_enabled: true,
    });
  });

  it('falls back to placeholders and keeps SSO off without a saved configuration', () => {
    const body = parseBody(buildSsoUpdateCurl({ apiUrl: null, tenantId: 'tenant-1', configuration: null }));

    expect(body).toEqual({
      issuer: 'https://your-idp.com/oauth2/default',
      client_id: 'your-client-id',
      client_secret: 'your-client-secret',
      scopes: ['openid', 'profile', 'email'],
      extra_params: {},
      email_claim: '',
      sso_enabled: false,
    });
  });
});
