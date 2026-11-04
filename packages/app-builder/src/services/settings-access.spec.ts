import { type CurrentUser, NewPermissions } from '@app-builder/models';
import type { AppConfig } from '@app-builder/models/app-config';
import { describe, expect, it } from 'vitest';
import { getSettingsAccess } from './settings-access';

const appConfig = { isManagedMarble: false } as AppConfig;

const userWith = (canUpdateOrganization: boolean): CurrentUser => ({
  organizationId: 'org',
  roles: [],
  actorIdentity: {},
  permissions: { ...NewPermissions(), canUpdateOrganization },
});

describe('getSettingsAccess: TRACFIN entry', () => {
  it('is in the menu when the user can update the organization', () => {
    expect(getSettingsAccess(userWith(true), appConfig, []).tracfin.settings).toEqual([
      { title: 'tracfin', to: '/settings/tracfin' },
    ]);
  });

  it('is not in the menu without that permission', () => {
    expect(getSettingsAccess(userWith(false), appConfig, []).tracfin.settings).toEqual([]);
  });

  it('adds no entry to the other sections', () => {
    const sections = getSettingsAccess(userWith(true), appConfig, []);
    const entries = Object.entries(sections).flatMap(([key, section]) =>
      section.settings.map((setting) => [key, setting.to] as const),
    );
    expect(entries.filter(([, to]) => to === '/settings/tracfin')).toEqual([['tracfin', '/settings/tracfin']]);
  });
});
