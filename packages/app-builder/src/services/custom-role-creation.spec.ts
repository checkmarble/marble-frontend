import { sectionsVisibility } from '@app-builder/models/custom-role-sections';
import { describe, expect, it, vi } from 'vitest';
import { saveCustomRole } from './custom-role-creation';

describe('saveCustomRole', () => {
  const role = {
    slug: 'org/analyst',
    name: 'Analyst',
    permissions: ['CASE_READ_WRITE'] as const,
    sections: sectionsVisibility(),
  };

  it('creates the role before applying the selected permissions', async () => {
    const create = vi.fn().mockResolvedValue({ success: true });
    const updatePermissions = vi.fn().mockResolvedValue(undefined);
    await expect(
      saveCustomRole({ ...role, permissions: [...role.permissions] }, false, {
        create,
        updatePermissions,
        updateSections: vi.fn(),
      }),
    ).resolves.toBe('success');
    expect(create).toHaveBeenCalledWith({ slug: role.slug, name: role.name });
    expect(updatePermissions).toHaveBeenCalledWith({ role: role.slug, permissions: ['CASE_READ_WRITE'] });
    expect(create.mock.invocationCallOrder[0]).toBeLessThan(updatePermissions.mock.invocationCallOrder[0]!);
  });

  it('does not update permissions after a duplicate or when none were selected', async () => {
    const create = vi.fn().mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true });
    const updatePermissions = vi.fn();
    expect(
      await saveCustomRole({ ...role, permissions: [...role.permissions] }, false, {
        create,
        updatePermissions,
        updateSections: vi.fn(),
      }),
    ).toBe('duplicate');
    expect(
      await saveCustomRole({ ...role, permissions: [] }, false, { create, updatePermissions, updateSections: vi.fn() }),
    ).toBe('success');
    expect(updatePermissions).not.toHaveBeenCalled();
  });

  it('retries a failed permission update without creating the role twice', async () => {
    const create = vi.fn().mockResolvedValue({ success: true });
    const updatePermissions = vi.fn().mockRejectedValueOnce(new Error('Forbidden')).mockResolvedValueOnce(undefined);
    const input = { ...role, permissions: [...role.permissions] };
    expect(await saveCustomRole(input, false, { create, updatePermissions, updateSections: vi.fn() })).toBe(
      'access_failed',
    );
    expect(await saveCustomRole(input, true, { create, updatePermissions, updateSections: vi.fn() })).toBe('success');
    expect(create).toHaveBeenCalledTimes(1);
    expect(updatePermissions).toHaveBeenCalledTimes(2);
  });

  it('replaces permissions with an empty list on retry when the first outcome is unknown', async () => {
    const create = vi.fn();
    const updatePermissions = vi.fn().mockResolvedValue(undefined);
    expect(
      await saveCustomRole({ ...role, permissions: [] }, true, { create, updatePermissions, updateSections: vi.fn() }),
    ).toBe('success');
    expect(updatePermissions).toHaveBeenCalledWith({ role: role.slug, permissions: [] });
    expect(create).not.toHaveBeenCalled();
  });

  const hidden = sectionsVisibility({ settings: false, data_model: false });

  it('hides sections after creating the role and skips the request when all sections stay visible', async () => {
    const create = vi.fn().mockResolvedValue({ success: true });
    const updatePermissions = vi.fn().mockResolvedValue(undefined);
    const updateSections = vi.fn().mockResolvedValue(undefined);
    const api = { create, updatePermissions, updateSections };
    expect(await saveCustomRole({ ...role, permissions: [], sections: hidden }, false, api)).toBe('success');
    expect(updateSections).toHaveBeenCalledWith({ role: role.slug, sections: hidden });
    expect(create.mock.invocationCallOrder[0]).toBeLessThan(updateSections.mock.invocationCallOrder[0]!);
    updateSections.mockClear();
    expect(await saveCustomRole({ ...role, permissions: [] }, false, api)).toBe('success');
    expect(updateSections).not.toHaveBeenCalled();
  });

  it('always replaces sections when editing an existing role', async () => {
    const updateSections = vi.fn().mockResolvedValue(undefined);
    const api = { create: vi.fn(), updatePermissions: vi.fn().mockResolvedValue(undefined), updateSections };
    expect(await saveCustomRole({ ...role, permissions: [] }, true, api)).toBe('success');
    expect(updateSections).toHaveBeenCalledWith({ role: role.slug, sections: sectionsVisibility() });
  });

  it('reports a failed section update and retries it without creating the role twice', async () => {
    const create = vi.fn().mockResolvedValue({ success: true });
    const updatePermissions = vi.fn().mockResolvedValue(undefined);
    const updateSections = vi.fn().mockRejectedValueOnce(new Error('Forbidden')).mockResolvedValueOnce(undefined);
    const api = { create, updatePermissions, updateSections };
    const input = { ...role, permissions: [], sections: hidden };
    expect(await saveCustomRole(input, false, api)).toBe('access_failed');
    expect(await saveCustomRole(input, true, api)).toBe('success');
    expect(create).toHaveBeenCalledTimes(1);
    expect(updateSections).toHaveBeenCalledTimes(2);
  });

  it('sends only what changed from the saved role', async () => {
    const updatePermissions = vi.fn().mockResolvedValue(undefined);
    const updateSections = vi.fn().mockResolvedValue(undefined);
    const api = { create: vi.fn(), updatePermissions, updateSections };
    const saved = { permissions: ['CASE_READ_WRITE', 'MANAGE_ROLES'], sections: { settings: false } };

    const unchanged = {
      ...role,
      permissions: ['MANAGE_ROLES', 'CASE_READ_WRITE'],
      sections: sectionsVisibility(saved.sections),
    };
    expect(await saveCustomRole(unchanged, true, api, saved)).toBe('success');
    expect(updatePermissions).not.toHaveBeenCalled();
    expect(updateSections).not.toHaveBeenCalled();

    expect(await saveCustomRole({ ...unchanged, sections: sectionsVisibility() }, true, api, saved)).toBe('success');
    expect(updatePermissions).not.toHaveBeenCalled();
    expect(updateSections).toHaveBeenCalledTimes(1);
  });
});
