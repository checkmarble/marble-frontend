import { type CredentialsDto, type UserDto } from 'marble-api';
import { describe, expect, it } from 'vitest';

import {
  adaptCurrentUser,
  adaptUser,
  isAdmin,
  isAnalyst,
  isMarbleAdmin,
  isMarbleCoreUser,
  normalizeRoleBindings,
} from './user';

const credentials: CredentialsDto['credentials'] = {
  organization_id: 'organization-id',
  roles: ['ADMIN', 'TENANT_ADMIN'],
  actor_identity: { user_id: 'user-id', email: 'admin@example.com' },
  permissions: ['DATA_MODEL_WRITE', 'MARBLE_USER_CREATE'],
  used_second_factor: false,
};

describe('current user access', () => {
  it('preserves all roles from grant-based credentials and recognizes the organization admin', () => {
    const user = adaptCurrentUser({ credentials });

    expect(user.roles).toEqual(['ADMIN', 'TENANT_ADMIN']);
    expect(isAdmin(user)).toBe(true);
    expect(user.permissions.canEditDataModel).toBe(true);
    expect(user.permissions.canCreateUser).toBe(true);
    expect(user.permissions.canCreateApiKey).toBe(false);
  });

  it.each([
    { roles: ['TENANT_ADMIN', 'ADMIN'], admin: true, marbleAdmin: false, analyst: false, coreUser: true },
    { roles: ['TENANT_ADMIN'], admin: false, marbleAdmin: false, analyst: false, coreUser: false },
    { roles: ['TENANT_ADMIN', 'ANALYST'], admin: false, marbleAdmin: false, analyst: true, coreUser: true },
    { roles: ['MARBLE_ADMIN'], admin: false, marbleAdmin: true, analyst: false, coreUser: false },
    { roles: ['VIEWER'], admin: false, marbleAdmin: false, analyst: false, coreUser: true },
    { roles: [], admin: false, marbleAdmin: false, analyst: false, coreUser: false },
  ])('checks every granted role for $roles', ({ roles, admin, marbleAdmin, analyst, coreUser }) => {
    const user = adaptCurrentUser({ credentials: { ...credentials, roles } });

    expect(isAdmin(user)).toBe(admin);
    expect(isMarbleAdmin(user)).toBe(marbleAdmin);
    expect(isAnalyst(user)).toBe(analyst);
    expect(isMarbleCoreUser(user)).toBe(coreUser);
  });

  it('treats omitted roles as an empty list', () => {
    const { roles, ...credentialsWithoutRoles } = credentials;
    const user = adaptCurrentUser({ credentials: credentialsWithoutRoles });

    expect(user.roles).toEqual([]);
    expect(isAdmin(user)).toBe(false);
    expect(isMarbleCoreUser(user)).toBe(false);
  });

  it('hides only the sections the credentials mark hidden, including when the map is omitted', () => {
    const user = adaptCurrentUser({ credentials, sections: { case_manager: false, settings: true } });

    expect(user.sections.case_manager).toBe(false);
    expect(user.sections.settings).toBe(true);
    expect(user.sections.scenarios).toBe(true);
    expect(Object.values(adaptCurrentUser({ credentials }).sections).every(Boolean)).toBe(true);
  });
});

describe('adaptUser', () => {
  it('preserves all role bindings and their IDs', () => {
    const dto: UserDto = {
      user_id: 'user-id',
      email: 'user@example.com',
      first_name: 'First',
      last_name: 'Last',
      organization_id: 'org-id',
      roles: [{ id: 'binding-id', role: 'ADMIN', conditions: { used_second_factor: true } }, { role: 'ANALYST' }],
    };
    expect(adaptUser(dto).roles).toEqual(dto.roles);
  });
});

describe('normalizeRoleBindings', () => {
  it('treats null, undefined and absent conditions alike', () => {
    expect(
      normalizeRoleBindings([
        { id: 'a', role: 'ADMIN', conditions: { used_second_factor: true, day_of_week: undefined } },
        { role: 'VIEWER', conditions: { networks: null } as unknown as { networks?: string[] } },
        { role: 'ANALYST', conditions: {} },
      ]),
    ).toStrictEqual([
      { id: 'a', role: 'ADMIN', conditions: { used_second_factor: true } },
      { role: 'VIEWER' },
      { role: 'ANALYST' },
    ]);
  });
});
