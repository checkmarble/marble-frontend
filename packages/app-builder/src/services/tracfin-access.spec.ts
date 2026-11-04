import { type CurrentUser, NewPermissions } from '@app-builder/models';
import { isRedirect } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { assertTracfinConfigurationAccess } from './tracfin-access';

const userWith = (canUpdateOrganization: boolean): CurrentUser => ({
  organizationId: 'org',
  roles: ['ADMIN'],
  actorIdentity: {},
  permissions: { ...NewPermissions(), canUpdateOrganization },
});

describe('assertTracfinConfigurationAccess', () => {
  it('redirects to the home page without the permission to update the organization', () => {
    let thrown: unknown;
    try {
      assertTracfinConfigurationAccess(userWith(false));
    } catch (error) {
      thrown = error;
    }

    expect(isRedirect(thrown)).toBe(true);
    expect((thrown as { options: { to: string } }).options.to).toBe('/');
  });

  it('lets a user who can update the organization through', () => {
    expect(() => assertTracfinConfigurationAccess(userWith(true))).not.toThrow();
  });

  it('does not take a role for the permission', () => {
    const adminWithoutPermission = userWith(false);
    expect(adminWithoutPermission.roles).toContain('ADMIN');
    expect(() => assertTracfinConfigurationAccess(adminWithoutPermission)).toThrow();
  });
});
