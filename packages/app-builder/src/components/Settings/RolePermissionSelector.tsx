import { CUSTOM_ROLE_PERMISSIONS } from '@app-builder/models/custom-role-permissions';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from 'ui-design-system';

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
        className="flex max-h-[calc(10*(var(--text-s--line-height)+2*var(--spacing-md))+2px)] flex-col overflow-y-auto rounded-md border border-grey-border"
      >
        {permissions.map((permission) => {
          const id = `${idPrefix}-${permission}`;
          return (
            <label
              key={permission}
              htmlFor={id}
              className="flex shrink-0 cursor-pointer items-center gap-sm p-md text-s"
            >
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
          );
        })}
      </div>
    </div>
  );
}
