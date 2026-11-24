import { type TenantOidcConfiguration } from '@app-builder/models/tenant-oidc';
import { describe, expect, it } from 'vitest';
import {
  canEnableSso,
  hasOfflineAccess,
  isEmailDomainVerified,
  isRecoveryKeyRequired,
  toSsoConnection,
  toSsoFormValues,
} from './sso-form';

const saved: TenantOidcConfiguration = {
  issuer: 'https://idp.example.com',
  clientId: 'client-1',
  scopes: ['openid', 'profile', 'email'],
  extraParams: { prompt: 'login', hd: 'example.com' },
  emailClaim: '',
  ssoEnabled: true,
};

describe('canEnableSso', () => {
  it('needs a test sign-in for a new configuration', () => {
    const values = { ...toSsoFormValues(null), issuer: 'https://idp.example.com', clientId: 'c', clientSecret: 's' };
    expect(canEnableSso({ values, configuration: null, testedConnection: null, recoveryKeyRequired: false })).toBe(
      false,
    );
    expect(
      canEnableSso({
        values,
        configuration: null,
        testedConnection: toSsoConnection(values),
        recoveryKeyRequired: false,
      }),
    ).toBe(true);
  });

  it('drops the pass when a connection field changes after the test', () => {
    const tested = { ...toSsoFormValues(null), issuer: 'https://idp.example.com', clientId: 'c', clientSecret: 's' };
    const testedConnection = toSsoConnection(tested);

    for (const edit of [
      { issuer: 'https://other.example.com' },
      { clientSecret: 's2' },
      { scopes: 'openid profile email offline_access' },
      { extraParams: 'prompt=login' },
      { emailClaim: 'upn' },
    ]) {
      expect(
        canEnableSso({
          values: { ...tested, ...edit },
          configuration: null,
          testedConnection,
          recoveryKeyRequired: false,
        }),
      ).toBe(false);
    }
    expect(
      canEnableSso({
        values: { ...tested, ssoEnabled: true },
        configuration: null,
        testedConnection,
        recoveryKeyRequired: false,
      }),
    ).toBe(true);
  });

  it('keeps an enabled saved configuration enabled only while its connection is unchanged', () => {
    const values = toSsoFormValues(saved);
    expect(canEnableSso({ values, configuration: saved, testedConnection: null, recoveryKeyRequired: false })).toBe(
      true,
    );
    // A typed secret is not the stored one until a test proves it works.
    expect(
      canEnableSso({
        values: { ...values, clientSecret: 'new' },
        configuration: saved,
        testedConnection: null,
        recoveryKeyRequired: false,
      }),
    ).toBe(false);
    expect(
      canEnableSso({
        values: { ...values, emailClaim: 'upn' },
        configuration: saved,
        testedConnection: null,
        recoveryKeyRequired: false,
      }),
    ).toBe(false);
    expect(
      canEnableSso({
        values,
        configuration: { ...saved, ssoEnabled: false },
        testedConnection: null,
        recoveryKeyRequired: false,
      }),
    ).toBe(false);
  });

  it('stays locked while a recovery key is required, even for a tested or enabled connection', () => {
    const values = toSsoFormValues(saved);
    const testedConnection = toSsoConnection(values);
    expect(canEnableSso({ values, configuration: saved, testedConnection, recoveryKeyRequired: true })).toBe(false);
  });

  it('reads empty scopes as the default scopes and ignores extra parameter order', () => {
    const values = { ...toSsoFormValues(saved), scopes: '', extraParams: 'hd=example.com\nprompt=login' };
    expect(canEnableSso({ values, configuration: saved, testedConnection: null, recoveryKeyRequired: false })).toBe(
      true,
    );
  });
});

describe('isRecoveryKeyRequired', () => {
  const off = { ...saved, ssoEnabled: false };

  it('blocks turning SSO on only while the readable key list is empty', () => {
    expect(isRecoveryKeyRequired({ recoveryKeys: [], canCreateRecoveryKey: true, configuration: off })).toBe(true);
    expect(isRecoveryKeyRequired({ recoveryKeys: [], canCreateRecoveryKey: true, configuration: null })).toBe(true);
    expect(isRecoveryKeyRequired({ recoveryKeys: [{}], canCreateRecoveryKey: true, configuration: off })).toBe(false);
  });

  it('never blocks a configuration already on, a list it could not read, or a user who cannot create keys', () => {
    expect(isRecoveryKeyRequired({ recoveryKeys: [], canCreateRecoveryKey: true, configuration: saved })).toBe(false);
    expect(isRecoveryKeyRequired({ recoveryKeys: null, canCreateRecoveryKey: true, configuration: off })).toBe(false);
    expect(isRecoveryKeyRequired({ recoveryKeys: [], canCreateRecoveryKey: false, configuration: off })).toBe(false);
  });
});

describe('hasOfflineAccess', () => {
  it('matches the whole scope, not a scope that contains it', () => {
    expect(hasOfflineAccess('openid offline_access email')).toBe(true);
    expect(hasOfflineAccess('openid offline_access_x')).toBe(false);
    expect(hasOfflineAccess('')).toBe(false);
  });
});

describe('isEmailDomainVerified', () => {
  it.each([
    ['ada@Example.com', ['example.com'], true],
    ['ada@example.com', ['EXAMPLE.COM'], true],
    ['ada@sub.example.com', ['example.com'], false],
    ['ada@example.com', [], false],
    ['@example.com', ['example.com'], false],
  ])('%s in %j is %s', (email, domains, verified) => {
    expect(isEmailDomainVerified(email, domains)).toBe(verified);
  });
});
