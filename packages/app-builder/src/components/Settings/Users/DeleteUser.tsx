import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteUserMutation } from '@app-builder/queries/settings/users/delete-user';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal } from 'ui-design-system';
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
      if (res.success) {
        onSuccess();
      }
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
        <Modal.Close asChild>
          <ButtonV2 variant="secondary" appearance="stroked" name="cancel">
            {t('common:cancel')}
          </ButtonV2>
        </Modal.Close>
        <ButtonV2
          variant="destructive"
          type="submit"
          name="delete"
          onClick={handleDeleteUser}
          disabled={deleteUserMutation.isPending}
        >
          <Icon icon="delete" className="size-5" />
          {t('common:delete')}
        </ButtonV2>
      </Modal.Footer>
    </>
  );
};
