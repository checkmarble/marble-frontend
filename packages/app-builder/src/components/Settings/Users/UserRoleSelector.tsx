import { tKeyForUserRole } from '@app-builder/models';
import { type RoleBinding } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { SelectV2 } from 'ui-design-system';

export function UserRoleSelector({
  roles,
  options,
  disabled,
  onChange,
}: {
  roles: RoleBinding[];
  options: readonly string[];
  disabled: boolean;
  onChange: (roles: RoleBinding[]) => void;
}) {
  const { t } = useTranslation(['settings']);
  const selected = roles[0];
  const availableRoles = [...new Set([...options, ...(selected ? [selected.role] : [])])];

  return (
    <SelectV2
      value={selected?.role ?? ''}
      onChange={(role) => onChange([selected?.role === role ? selected : { role }])}
      disabled={disabled}
      placeholder={t('settings:users.role')}
      options={availableRoles.map((role) => ({ label: t(tKeyForUserRole(role)), value: role }))}
    />
  );
}
