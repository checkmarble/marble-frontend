import { describe, expect, it } from 'vitest';
import { roleManagerOptionalList } from './roles-access';

describe('role manager shell data', () => {
  const forbidden = Object.assign(new Error('Forbidden'), { status: 403 });

  it('allows a role manager to continue when an unrelated list is forbidden', async () => {
    await expect(roleManagerOptionalList(Promise.reject(forbidden), true)).resolves.toEqual([]);
  });

  it('does not hide other errors or forbidden responses for other users', async () => {
    const failure = new Error('Network error');
    await expect(roleManagerOptionalList(Promise.reject(failure), true)).rejects.toBe(failure);
    await expect(roleManagerOptionalList(Promise.reject(forbidden), false)).rejects.toBe(forbidden);
  });
});
