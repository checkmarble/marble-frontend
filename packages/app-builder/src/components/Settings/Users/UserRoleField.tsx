import { Nudge } from '@app-builder/components/Nudge';
import { tKeyForUserRole } from '@app-builder/models';
import { type OrganizationGrantRole } from '@app-builder/schemas/settings';
import { isAccessible } from '@app-builder/services/feature-access';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useTranslation } from 'react-i18next';
import { cn, SelectV2 } from 'ui-design-system';

interface UserRoleFieldProps {
  value: string | null;
  onChange: (role: OrganizationGrantRole) => void;
  userRoles: readonly [string, ...string[]];
  access: FeatureAccessLevelDto;
  disabled?: boolean;
}

// Role granted to a user on the organization. Locked when the organization cannot assign roles.
export function UserRoleField({ value, onChange, userRoles, access, disabled = false }: UserRoleFieldProps) {
  const { t } = useTranslation(['settings']);

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
          if (role) onChange(role as OrganizationGrantRole);
        }}
        disabled={disabled || !isAccessible(access)}
        placeholder={t('settings:users.role')}
        aria-label={t('settings:users.role')}
        options={userRoles.map((userRole) => ({
          label: t(tKeyForUserRole(userRole)),
          value: userRole as OrganizationGrantRole,
        }))}
      />
    </div>
  );
}
