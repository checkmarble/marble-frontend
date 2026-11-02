import { type RoleBinding } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { SelectV2 } from 'ui-design-system';

export interface UserRoleOption {
  value: string;
  label: string;
}

export function UserRoleSelector({
  roles,
  options,
  disabled,
  onChange,
}: {
  roles: RoleBinding[];
  options: readonly UserRoleOption[];
  disabled: boolean;
  onChange: (roles: RoleBinding[]) => void;
}) {
  const { t } = useTranslation(['settings']);
  const selected = roles[0];
  const availableRoles =
    selected && !options.some(({ value }) => value === selected.role)
      ? [...options, { value: selected.role, label: selected.role }]
      : [...options];

  return (
    <SelectV2
      value={selected?.role ?? ''}
      onChange={(role) => onChange([selected?.role === role ? selected : { role }])}
      disabled={disabled}
      placeholder={t('settings:users.role')}
      options={availableRoles}
    />
  );
}
