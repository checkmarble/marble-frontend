import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type CustomRole, groupPermissions } from '@app-builder/models/roles';
import { useUpdateRolePermissionsMutation } from '@app-builder/queries/settings/roles/update-role-permissions';
import { type Namespace } from 'i18next';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Checkbox, Modal, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function EditRolePermissions({
  role,
  availablePermissions,
}: {
  role: CustomRole;
  availablePermissions: string[];
}) {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon icon="edit-square" className="size-6 shrink-0" aria-label={t('settings:roles.edit_permissions')} />
      </Modal.Trigger>
      <Modal.Content>
        <EditRolePermissionsContent
          role={role}
          availablePermissions={availablePermissions}
          onSuccess={() => setOpen(false)}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

function EditRolePermissionsContent({
  role,
  availablePermissions,
  onSuccess,
}: {
  role: CustomRole;
  availablePermissions: string[];
  onSuccess: () => void;
}) {
  const { t } = useTranslation(['common', 'settings'] satisfies Namespace);
  const updateMutation = useUpdateRolePermissionsMutation();
  const revalidate = useLoaderRevalidator();

  const groups = useMemo(() => groupPermissions(availablePermissions), [availablePermissions]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(role.permissions));

  const toggle = (permission: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(permission);
      else next.delete(permission);
      return next;
    });
  };

  const toggleGroup = (permissions: string[], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      permissions.forEach((permission) => (checked ? next.add(permission) : next.delete(permission)));
      return next;
    });
  };

  const handleSave = () => {
    updateMutation
      .mutateAsync({ roleId: role.id, permissions: [...selected] })
      .then(() => {
        toast.success(t('common:success.save'));
        onSuccess();
        revalidate();
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
      });
  };

  return (
    <>
      <Modal.Title>{t('settings:roles.edit_permissions.title', { name: role.name })}</Modal.Title>
      <div className="flex max-h-[60vh] flex-col gap-lg overflow-y-auto p-lg">
        {groups.map((group) => {
          const selectedInGroup = group.permissions.filter((permission) => selected.has(permission)).length;
          const groupState =
            selectedInGroup === 0 ? false : selectedInGroup === group.permissions.length ? true : 'indeterminate';

          return (
            <div key={group.key} className="flex flex-col gap-sm">
              <label className="flex items-center gap-sm">
                <Checkbox
                  checked={groupState}
                  onCheckedChange={(checked) => toggleGroup(group.permissions, checked === true)}
                />
                <Typo variant="subtitle1">{t(`settings:roles.group.${group.key}` as const)}</Typo>
              </label>
              <div className="border-grey-border ml-lg flex flex-col gap-sm border-l ps-md">
                {group.permissions.map((permission) => (
                  <label key={permission} className="flex items-center gap-sm">
                    <Checkbox
                      size="small"
                      checked={selected.has(permission)}
                      onCheckedChange={(checked) => toggle(permission, checked === true)}
                    />
                    <span className="text-s">
                      {t(`settings:permissions.${permission}` as const, { defaultValue: permission })}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('common:save')}
          name="save"
          onClick={handleSave}
          isLoading={updateMutation.isPending}
        />
      </Modal.Footer>
    </>
  );
}
