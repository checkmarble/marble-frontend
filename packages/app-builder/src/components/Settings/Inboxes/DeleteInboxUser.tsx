import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type InboxUser } from '@app-builder/models/inbox';
import { useDeleteInboxUserMutation } from '@app-builder/queries/settings/inboxes/delete-inbox-user';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeleteInboxUser({ inboxUser }: { inboxUser: InboxUser }) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  const handleOnSuccess = () => {
    setOpen(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon
          icon="delete"
          className="size-6 shrink-0"
          aria-label={t('settings:inboxes.inbox_user.delete')}
        />
      </Modal.Trigger>
      <Modal.Content>
        <DeleteInboxUserContent inboxUser={inboxUser} onSuccess={handleOnSuccess} />
      </Modal.Content>
    </Modal.Root>
  );
}

const DeleteInboxUserContent = ({
  inboxUser,
  onSuccess,
}: {
  inboxUser: InboxUser;
  onSuccess: () => void;
}) => {
  const { t } = useTranslation(['common', 'settings']);
  const deleteInboxUserMutation = useDeleteInboxUserMutation();
  const revalidate = useLoaderRevalidator();

  const handleDeleteInboxUser = () => {
    deleteInboxUserMutation
      .mutateAsync({ inboxId: inboxUser.inboxId, inboxUserId: inboxUser.id })
      .then((res) => {
        if (!res) {
          onSuccess();
        }
        revalidate();
      });
  };

  return (
    <>
      <Modal.Title>{t('settings:inboxes.inbox_user.delete')}</Modal.Title>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <div className="text-s flex flex-1 flex-col gap-4">
          <input name="inboxUserId" value={inboxUser.id} type="hidden" />
          <input name="inboxId" value={inboxUser.inboxId} type="hidden" />
          <p className="text-center">{t('settings:inboxes.inbox_user.delete.content')}</p>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            color="red"
            className="flex-1"
            variant="primary"
            name="delete"
            onClick={handleDeleteInboxUser}
          >
            <Icon icon="delete" className="size-6" />
            {t('common:delete')}
          </Button>
        </div>
      </div>
    </>
  );
};
