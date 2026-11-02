import { useDeleteCustomRoleMutation } from '@app-builder/queries/settings/roles/delete-custom-role';
import { useRouter } from '@tanstack/react-router';
import { type CustomRoleDto } from 'marble-api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeleteCustomRole({ role }: { role: CustomRoleDto }) {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Tooltip.Default content={t('settings:custom_roles.delete')}>
        <Modal.Trigger asChild>
          <Button
            type="button"
            variant="secondary"
            appearance="stroked"
            size="small"
            mode="icon"
            className="opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 [@media(hover:none)]:opacity-100"
            aria-label={t('settings:custom_roles.delete_for', { name: role.name })}
          >
            <Icon icon="delete" className="size-4" aria-hidden="true" />
          </Button>
        </Modal.Trigger>
      </Tooltip.Default>
      <Modal.Content>
        <DeleteCustomRoleContent role={role} onSuccess={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}

function DeleteCustomRoleContent({ role, onSuccess }: { role: CustomRoleDto; onSuccess: () => void }) {
  const { t } = useTranslation(['common', 'settings']);
  const router = useRouter();
  const deleteCustomRoleMutation = useDeleteCustomRoleMutation();

  const handleDelete = async () => {
    try {
      const result = await deleteCustomRoleMutation.mutateAsync({ slug: role.slug });
      if (!result.success) {
        toast.error(t('settings:custom_roles.delete_in_use'));
        return;
      }
      toast.success(t('settings:custom_roles.deleted'));
      onSuccess();
      void router.invalidate();
    } catch {
      toast.error(t('common:errors.unknown'));
    }
  };

  return (
    <>
      <Modal.Title>{t('settings:custom_roles.delete.title')}</Modal.Title>
      <div className="flex flex-col gap-lg p-lg">
        <p className="text-s text-center">{t('settings:custom_roles.delete.content', { name: role.name })}</p>
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('common:delete')}
          variant="destructive"
          onClick={handleDelete}
          isLoading={deleteCustomRoleMutation.isPending}
          disabled={deleteCustomRoleMutation.isPending}
          leadingIcon="delete"
        />
      </Modal.Footer>
    </>
  );
}
