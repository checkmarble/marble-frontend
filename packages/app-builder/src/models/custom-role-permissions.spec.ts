import ar from '@app-builder/locales/ar/settings.json';
import en from '@app-builder/locales/en/settings.json';
import fr from '@app-builder/locales/fr/settings.json';
import { describe, expect, it } from 'vitest';
import { CUSTOM_ROLE_PERMISSIONS } from './custom-role-permissions';

describe('custom role permission descriptions', () => {
  it.each([
    ['en', en],
    ['fr', fr],
    ['ar', ar],
  ])('describes every grantable permission in %s', (_, translations: Record<string, string>) => {
    const missing = CUSTOM_ROLE_PERMISSIONS.filter(
      (permission) => !translations[`custom_roles.permission_description.${permission}`],
    );
    expect(missing).toEqual([]);
  });
});
