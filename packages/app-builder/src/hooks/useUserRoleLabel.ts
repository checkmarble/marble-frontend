import { getCustomUserRoleName, isCustomUserRole, isKnownUserRole, tKeyForUserRole } from '@app-builder/models/user';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Returns a formatter for user role identifiers. Standard roles (ADMIN, VIEWER, ...) are translated,
 * custom organization roles (prefixed with `org/`) are displayed by their name, and any other role
 * returned by the backend is displayed by its raw identifier (never a generic "unknown" label).
 */
export function useUserRoleLabel() {
  const { t } = useTranslation(['settings']);

  return useCallback(
    (role: string) => {
      if (isCustomUserRole(role)) return getCustomUserRoleName(role);
      if (isKnownUserRole(role)) return t(tKeyForUserRole(role));
      return role;
    },
    [t],
  );
}
