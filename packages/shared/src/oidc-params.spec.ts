import { describe, expect, it } from 'vitest';
import { isClientSecretRequired, parseExtraParams, parseScopes } from './oidc-params';

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

describe('isClientSecretRequired', () => {
  const saved = { issuer: 'https://login.example.com', clientId: 'marble' };

  it('requires a secret for a new configuration', () => {
    expect(isClientSecretRequired(null, saved)).toBe(true);
  });

  it('keeps the stored secret while the trimmed issuer and client ID are unchanged', () => {
    expect(isClientSecretRequired(saved, { issuer: ' https://login.example.com ', clientId: 'marble ' })).toBe(false);
  });

  it('requires the secret again when the issuer or client ID changes', () => {
    expect(isClientSecretRequired(saved, { ...saved, issuer: 'https://other.example.com' })).toBe(true);
    expect(isClientSecretRequired(saved, { ...saved, clientId: 'other' })).toBe(true);
  });
});
