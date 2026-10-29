import type { TenantOidcConfiguration } from '@bo/data/tenants';
import { describe, expect, it } from 'vitest';
import {
  makeTenantOidcFormSchema,
  parseExtraParams,
  parseScopes,
  toPutTenantOidcConfigurationPayload,
  toTenantOidcFormValues,
} from './oidc-form';

const TENANT_ID = '01a139c0-e32d-76b2-a410-82f6eaa3ee98';

const config: TenantOidcConfiguration = {
  tenant_id: TENANT_ID,
  issuer: 'https://login.example.com',
  client_id: 'marble',
  client_secret_set: true,
  scopes: ['openid', 'email'],
  extra_params: { prompt: 'login' },
  email_claim: 'email',
  sso_enabled: false,
};

const clientSecretError = (schemaConfig: TenantOidcConfiguration | null, values = toTenantOidcFormValues(config)) => {
  const result = makeTenantOidcFormSchema(schemaConfig).safeParse(values);
  return result.error?.issues.find((issue) => issue.path[0] === 'clientSecret')?.message;
};

describe('toTenantOidcFormValues', () => {
  it('starts a new configuration empty, with sign-in enabled', () => {
    expect(toTenantOidcFormValues(null)).toEqual({
      issuer: '',
      clientId: '',
      clientSecret: '',
      scopes: '',
      extraParams: '',
      emailClaim: '',
      ssoEnabled: true,
    });
  });

  it('turns scopes and extra parameters into editable text, never filling the secret', () => {
    expect(toTenantOidcFormValues(config)).toMatchObject({
      clientSecret: '',
      scopes: 'openid email',
      extraParams: 'prompt=login',
      ssoEnabled: false,
    });
  });
});

describe('parseScopes', () => {
  it('splits on spaces and commas', () => {
    expect(parseScopes(' openid,profile  email ')).toEqual(['openid', 'profile', 'email']);
    expect(parseScopes('')).toEqual([]);
  });
});

describe('parseExtraParams', () => {
  it('reads one key=value per line, skipping blank lines', () => {
    expect(parseExtraParams('prompt = login\n\nhd=example.com=x')).toEqual({ prompt: 'login', hd: 'example.com=x' });
  });

  it('rejects lines without a key', () => {
    expect(parseExtraParams('prompt')).toBeNull();
    expect(parseExtraParams('=login')).toBeNull();
  });
});

describe('makeTenantOidcFormSchema', () => {
  it('requires a client secret for a new configuration', () => {
    expect(clientSecretError(null)).toBe('Enter the client secret');
  });

  it('keeps the stored secret while the issuer and client ID are unchanged', () => {
    expect(clientSecretError(config)).toBeUndefined();
  });

  it('requires the secret again when the identity provider changes', () => {
    const values = { ...toTenantOidcFormValues(config), clientId: 'other' };
    expect(clientSecretError(config, values)).toBe('Enter the client secret again: the issuer or client ID changed');
  });
});

describe('toPutTenantOidcConfigurationPayload', () => {
  it('omits a blank secret so the backend keeps the stored one', () => {
    expect(toPutTenantOidcConfigurationPayload(TENANT_ID, toTenantOidcFormValues(config))).toEqual({
      tenantId: TENANT_ID,
      issuer: 'https://login.example.com',
      client_id: 'marble',
      client_secret: undefined,
      scopes: ['openid', 'email'],
      extra_params: { prompt: 'login' },
      email_claim: 'email',
      sso_enabled: false,
    });
  });

  it('sends a typed secret', () => {
    const values = { ...toTenantOidcFormValues(config), clientSecret: 's3cret' };
    expect(toPutTenantOidcConfigurationPayload(TENANT_ID, values).client_secret).toBe('s3cret');
  });
});
