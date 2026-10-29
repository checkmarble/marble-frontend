import { describe, expect, it } from 'vitest';
import { isMarbleAdmin } from './credentials';

describe('isMarbleAdmin', () => {
  it('reads multi-role credentials', () => {
    expect(isMarbleAdmin({ roles: ['ADMIN', 'MARBLE_ADMIN'] })).toBe(true);
    expect(isMarbleAdmin({ roles: ['ADMIN'] })).toBe(false);
  });

  it('is false without any role', () => {
    expect(isMarbleAdmin({})).toBe(false);
  });
});
