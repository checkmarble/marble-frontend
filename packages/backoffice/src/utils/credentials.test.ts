import { describe, expect, it } from 'vitest';
import { isMarbleAdmin } from './credentials';

describe('isMarbleAdmin', () => {
  it('reads multi-role credentials', () => {
    expect(isMarbleAdmin({ roles: ['MARBLE_ADMIN'] })).toBe(true);
    expect(isMarbleAdmin({ roles: ['ADMIN'] })).toBe(false);
  });

  it('falls back to the legacy single role', () => {
    expect(isMarbleAdmin({ role: 'MARBLE_ADMIN' })).toBe(true);
    expect(isMarbleAdmin({ role: 'VIEWER' })).toBe(false);
  });

  it('is false without any role', () => {
    expect(isMarbleAdmin({})).toBe(false);
  });
});
