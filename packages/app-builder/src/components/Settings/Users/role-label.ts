import { tKeyForUserRole } from '@app-builder/models/user';
import { type TFunction } from 'i18next';

// Custom roles (org/…) have no translation: show their name when known, else their slug.
export function roleLabel(role: string, t: TFunction<['settings']>, customRoleNames?: ReadonlyMap<string, string>) {
  return customRoleNames?.get(role) ?? (role.startsWith('org/') ? role : t(tKeyForUserRole(role)));
}
