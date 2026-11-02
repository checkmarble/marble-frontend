import { describe, expect, it, vi } from 'vitest';
import { saveCustomRole } from './custom-role-creation';

describe('saveCustomRole', () => {
  const role = { slug: 'org/analyst', name: 'Analyst', permissions: ['CASE_READ_WRITE'] as const };

  it('creates the role before applying the selected permissions', async () => {
    const create = vi.fn().mockResolvedValue({ success: true });
    const updatePermissions = vi.fn().mockResolvedValue(undefined);
    await expect(
      saveCustomRole({ ...role, permissions: [...role.permissions] }, false, { create, updatePermissions }),
    ).resolves.toBe('success');
    expect(create).toHaveBeenCalledWith({ slug: role.slug, name: role.name });
    expect(updatePermissions).toHaveBeenCalledWith({ role: role.slug, permissions: ['CASE_READ_WRITE'] });
    expect(create.mock.invocationCallOrder[0]).toBeLessThan(updatePermissions.mock.invocationCallOrder[0]!);
  });

  it('does not update permissions after a duplicate or when none were selected', async () => {
    const create = vi.fn().mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true });
    const updatePermissions = vi.fn();
    expect(
      await saveCustomRole({ ...role, permissions: [...role.permissions] }, false, { create, updatePermissions }),
    ).toBe('duplicate');
    expect(await saveCustomRole({ ...role, permissions: [] }, false, { create, updatePermissions })).toBe('success');
    expect(updatePermissions).not.toHaveBeenCalled();
  });

  it('retries a failed permission update without creating the role twice', async () => {
    const create = vi.fn().mockResolvedValue({ success: true });
    const updatePermissions = vi.fn().mockRejectedValueOnce(new Error('Forbidden')).mockResolvedValueOnce(undefined);
    const input = { ...role, permissions: [...role.permissions] };
    expect(await saveCustomRole(input, false, { create, updatePermissions })).toBe('permissions_failed');
    expect(await saveCustomRole(input, true, { create, updatePermissions })).toBe('success');
    expect(create).toHaveBeenCalledTimes(1);
    expect(updatePermissions).toHaveBeenCalledTimes(2);
  });

  it('replaces permissions with an empty list on retry when the first outcome is unknown', async () => {
    const create = vi.fn();
    const updatePermissions = vi.fn().mockResolvedValue(undefined);
    expect(await saveCustomRole({ ...role, permissions: [] }, true, { create, updatePermissions })).toBe('success');
    expect(updatePermissions).toHaveBeenCalledWith({ role: role.slug, permissions: [] });
    expect(create).not.toHaveBeenCalled();
  });
});
