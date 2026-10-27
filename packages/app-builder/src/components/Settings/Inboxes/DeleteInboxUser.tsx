import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type InboxUser } from '@app-builder/models/inbox';
import { useDeleteInboxUserMutation } from '@app-builder/queries/settings/inboxes/delete-inbox-user';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

export const DeleteInboxUserContent = ({ inboxUser, onSuccess }: { inboxUser: InboxUser; onSuccess: () => void }) => {
  const { t } = useTranslation(['common', 'settings']);
  const deleteInboxUserMutation = useDeleteInboxUserMutation();
  const revalidate = useLoaderRevalidator();

  const handleDeleteInboxUser = () => {
    deleteInboxUserMutation.mutateAsync({ inboxUserId: inboxUser.id }).then(() => {
      onSuccess();
      revalidate();
    });
  };

  return (
    <>
      <Modal.Title>{t('settings:inboxes.inbox_user.delete')}</Modal.Title>
      <div className="bg-surface-card flex flex-col gap-lg p-lg">
        <div className="text-s flex flex-1 flex-col gap-md">
          <p className="text-center">{t('settings:inboxes.inbox_user.delete.content')}</p>
        </div>
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('common:delete')}
          variant="destructive"
          onClick={handleDeleteInboxUser}
          disabled={deleteInboxUserMutation.isPending}
          leadingIcon="delete"
        />
      </Modal.Footer>
    </>
  );
};
