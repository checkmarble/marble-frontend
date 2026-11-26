import { type AppConfig } from '@app-builder/models/app-config';
import { adaptCurrentUser } from '@app-builder/models/user';
import { describe, expect, it } from 'vitest';
import { getSettingsAccess } from './settings-access';

describe('custom roles settings access', () => {
  const config = { isManagedMarble: false } as AppConfig;
  const credentials = {
    organization_id: 'org',
    actor_identity: {},
    roles: ['ANALYST'],
    permissions: [] as string[],
    used_second_factor: false,
  };

  it('requires MANAGE_ROLES regardless of role name', () => {
    const without = adaptCurrentUser({ ...credentials, roles: ['ADMIN'] });
    const withPermission = adaptCurrentUser({ ...credentials, permissions: ['MANAGE_ROLES'] });

    expect(getSettingsAccess(without, config, []).custom_roles.settings).toEqual([]);
    const sections = getSettingsAccess(withPermission, config, []);
    expect(sections.custom_roles.settings).toEqual([{ title: 'custom_roles', to: '/settings/roles' }]);
    expect(sections.users.settings).toEqual([]);
  });
});
