import { describe, expect, it } from 'vitest';
import { getAuthMode } from './auth-mode';

describe('getAuthMode', () => {
  it('recognizes the three supported provider combinations', () => {
    expect(getAuthMode(['firebase'])).toBe('firebase');
    expect(getAuthMode(['oidc-legacy'])).toBe('oidc-legacy');
    expect(getAuthMode(['firebase', 'oidc'])).toBe('firebase-oidc');
  });

  it('ignores order and duplicates', () => {
    expect(getAuthMode(['oidc', 'firebase'])).toBe('firebase-oidc');
    expect(getAuthMode(['firebase', 'firebase'])).toBe('firebase');
  });

  it('rejects any other combination', () => {
    expect(getAuthMode([])).toBeNull();
    expect(getAuthMode(['oidc'])).toBeNull();
    expect(getAuthMode(['firebase', 'oidc-legacy'])).toBeNull();
    expect(getAuthMode(['oidc', 'oidc-legacy'])).toBeNull();
    expect(getAuthMode(['firebase', 'oidc', 'oidc-legacy'])).toBeNull();
  });
});
