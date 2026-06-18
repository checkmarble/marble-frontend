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
        <Button variant="destructive" name="delete" disabled={disabled} className="w-fit">
          <Icon icon="delete" className="size-5" aria-label={t('settings:inboxes.delete_inbox')} />
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
      <div className="bg-surface-card flex flex-col gap-lg p-lg">
        <div className="text-s flex flex-1 flex-col gap-md">
          <input name="inboxId" value={inboxId} type="hidden" />
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
