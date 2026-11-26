import { useDeleteInboxMutation } from '@app-builder/queries/settings/inboxes/delete-inbox';
import { useRouter } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

export const DeleteInboxContent = ({
  inboxId,
  onDeleted,
  onSettled,
}: {
  inboxId: string;
  onDeleted: () => void;
  onSettled: () => void;
}) => {
  const { t } = useTranslation(['common', 'settings']);
  const deleteInboxMutation = useDeleteInboxMutation();
  const router = useRouter();

  const handleDeleteInbox = () => {
    deleteInboxMutation
      .mutateAsync({ inboxId })
      .then(() => {
        onDeleted();
        router.invalidate();
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(onSettled);
  };

  return (
    <>
      <Modal.Title>{t('settings:inboxes.delete_inbox')}</Modal.Title>
      <div className="bg-surface-card flex flex-col gap-lg p-lg">
        <div className="text-s flex flex-1 flex-col gap-md">
          <p className="text-center">{t('settings:inboxes.delete_inbox.content')}</p>
        </div>
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('common:delete')}
          variant="destructive"
          onClick={handleDeleteInbox}
          disabled={deleteInboxMutation.isPending}
          leadingIcon="delete"
        />
      </Modal.Footer>
    </>
  );
};
