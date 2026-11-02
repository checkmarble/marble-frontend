import { CUSTOM_ROLE_PERMISSIONS, isKnownCustomRolePermission } from '@app-builder/models/custom-role-permissions';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function RolePermissionSelector({
  value,
  onChange,
  existingPermissions = [],
}: {
  value: string[];
  onChange: (permissions: string[]) => void;
  existingPermissions?: string[];
}) {
  const { t } = useTranslation(['settings']);
  const idPrefix = useId();
  const permissions = [...new Set([...CUSTOM_ROLE_PERMISSIONS, ...existingPermissions])];

  return (
    <div className="flex flex-col gap-sm">
      <label id={`${idPrefix}-label`}>{t('settings:custom_roles.permissions')}</label>
      <div
        role="group"
        aria-labelledby={`${idPrefix}-label`}
        className="relative flex max-h-[calc(10*(var(--text-s--line-height)+2*var(--spacing-md))+2px)] flex-col overflow-y-auto rounded-md border border-grey-border"
      >
        {permissions.map((permission) => {
          const id = `${idPrefix}-${permission}`;
          return (
            <div key={permission} className="flex shrink-0 items-center gap-sm pe-md">
              <label htmlFor={id} className="flex grow cursor-pointer items-center gap-sm p-md text-s">
                <Checkbox
                  id={id}
                  size="small"
                  checked={value.includes(permission)}
                  onCheckedChange={(checked) =>
                    onChange(
                      checked === true ? [...value, permission] : value.filter((selected) => selected !== permission),
                    )
                  }
                />
                {permission}
              </label>
              {isKnownCustomRolePermission(permission) ? (
                <Tooltip.Default
                  delayDuration={200}
                  className="max-w-80 text-s"
                  content={t(`settings:custom_roles.permission_description.${permission}`)}
                >
                  <button
                    type="button"
                    aria-label={t('settings:custom_roles.permission_description_for', { permission })}
                    className="shrink-0 rounded-sm text-purple-primary focus-visible:outline-2 focus-visible:outline-purple-primary"
                  >
                    <Icon icon="tip" className="size-4" aria-hidden="true" />
                  </button>
                </Tooltip.Default>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
