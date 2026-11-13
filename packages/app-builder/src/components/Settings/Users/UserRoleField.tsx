import { Nudge } from '@app-builder/components/Nudge';
import { type UserRoleOption } from '@app-builder/components/Settings/Users/UserRoleSelector';
import { tKeyForUserRole } from '@app-builder/models';
import { organizationGrantRoleSchema } from '@app-builder/schemas/settings';
import { isAccessible } from '@app-builder/services/feature-access';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useTranslation } from 'react-i18next';
import { cn, SelectV2 } from 'ui-design-system';

interface UserRoleFieldProps {
  value: string | null;
  onChange: (role: string) => void;
  userRoles: readonly UserRoleOption[];
  access: FeatureAccessLevelDto;
  disabled?: boolean;
  selectedLabel?: string;
}

// Role granted to a user on the organization. Locked when the organization cannot assign roles.
export function UserRoleField({
  value,
  onChange,
  userRoles,
  access,
  disabled = false,
  selectedLabel,
}: UserRoleFieldProps) {
  const { t } = useTranslation(['settings']);
  const options =
    value && !userRoles.some((role) => role.value === value)
      ? [
          ...userRoles,
          {
            value,
            label:
              selectedLabel ??
              (organizationGrantRoleSchema.safeParse(value).success ? t(tKeyForUserRole(value)) : value),
          },
        ]
      : [...userRoles];

  return (
    <div className="flex flex-col gap-xs">
      <span className="text-s text-grey-secondary flex flex-row gap-sm">
        <span className={cn(access === 'restricted' && 'text-grey-disabled')}>{t('settings:users.role')}</span>
        {access === 'allowed' ? null : (
          <Nudge content={t('settings:users.role.nudge')} className="size-6" kind={access} />
        )}
      </span>
      <SelectV2<string | null>
        value={value}
        onChange={(role) => {
          if (role) onChange(role);
        }}
        disabled={disabled || !isAccessible(access)}
        placeholder={t('settings:users.role')}
        aria-label={t('settings:users.role')}
        options={options}
      />
    </div>
  );
}
