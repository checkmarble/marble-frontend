import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type Inbox } from '@app-builder/models/inbox';
import { useDeleteInboxMutation } from '@app-builder/queries/settings/inboxes/delete-inbox';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeleteInbox({ inbox, disabled }: { inbox: Inbox; disabled?: boolean }) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  const handleOnSuccess = () => {
    setOpen(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button color="red" variant="primary" name="delete" disabled={disabled} className="w-fit">
          <Icon icon="delete" className="size-6" aria-label={t('settings:inboxes.delete_inbox')} />
          {t('settings:inboxes.delete_inbox')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <DeleteInboxContent inboxId={inbox.id} onSuccess={handleOnSuccess} />
      </Modal.Content>
    </Modal.Root>
  );
}

const DeleteInboxContent = ({ inboxId, onSuccess }: { inboxId: string; onSuccess: () => void }) => {
  const { t } = useTranslation(['common', 'settings']);
  const deleteInboxMutation = useDeleteInboxMutation();
  const revalidate = useLoaderRevalidator();

  const handleDeleteInbox = () => {
    deleteInboxMutation.mutateAsync({ inboxId }).then((res) => {
      if (!res) {
        onSuccess();
      }
      revalidate();
    });
  };

  return (
    <>
      <Modal.Title>{t('settings:inboxes.delete_inbox')}</Modal.Title>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <div className="text-s flex flex-1 flex-col gap-4">
          <input name="inboxId" value={inboxId} type="hidden" />
          <p className="text-center">{t('settings:inboxes.delete_inbox.content')}</p>
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
            onClick={handleDeleteInbox}
            disabled={deleteInboxMutation.isPending}
          >
            <Icon icon="delete" className="size-6" />
            {t('common:delete')}
          </Button>
        </div>
      </div>
    </>
  );
};
