import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteUserMutation } from '@app-builder/queries/settings/users/delete-user';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeleteUser({ userId, currentUserId }: { userId: string; currentUserId?: string }) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  const handleOnSuccess = () => {
    setOpen(false);
  };

  if (userId === currentUserId) {
    return (
      <Icon
        icon="delete"
        className="group-hover:text-grey-disabled size-6 shrink-0 cursor-not-allowed"
        aria-label={t('settings:users.delete_user')}
      />
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon icon="delete" className="size-6 shrink-0" aria-label={t('settings:users.delete_user')} />
      </Modal.Trigger>
      <Modal.Content>
        <DeleteUserContent userId={userId} onSuccess={handleOnSuccess} />
      </Modal.Content>
    </Modal.Root>
  );
}

const DeleteUserContent = ({ userId, onSuccess }: { userId: string; onSuccess: () => void }) => {
  const { t } = useTranslation(['common', 'settings']);
  const deleteUserMutation = useDeleteUserMutation();
  const revalidate = useLoaderRevalidator();

  const handleDeleteUser = () => {
    deleteUserMutation.mutateAsync({ userId }).then((res) => {
      onSuccess();

      revalidate();
    });
  };

  return (
    <>
      <Modal.Title>{t('settings:users.delete_user.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-1 flex-col gap-4">
          <input name="userId" value={userId} type="hidden" />
          <p className="text-center">{t('settings:users.delete_user.content')}</p>
        </div>
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('common:delete')}
          variant="destructive"
          onClick={handleDeleteUser}
          disabled={deleteUserMutation.isPending}
          leadingIcon="delete"
        />
      </Modal.Footer>
    </>
  );
};
