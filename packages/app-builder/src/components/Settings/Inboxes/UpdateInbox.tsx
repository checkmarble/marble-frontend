import { InboxFormFields, useInboxForm } from '@app-builder/components/Settings/Inboxes/InboxFormFields';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type Inbox, type InboxMetadata } from '@app-builder/models/inbox';
import { createInboxRedirectRouteOptions } from '@app-builder/queries/settings/inboxes/create-inbox';
import { useUpdateInboxMutation } from '@app-builder/queries/settings/inboxes/update-inbox';
import { handleSubmit } from '@app-builder/utils/form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function UpdateInbox({
  inbox,
  escalationInboxes,
  redirectRoutePath,
  isAutoAssignmentAvailable = false,
}: {
  inbox: Inbox;
  escalationInboxes: InboxMetadata[];
  redirectRoutePath: (typeof createInboxRedirectRouteOptions)[number];
  isAutoAssignmentAvailable: boolean;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  const handleOnSuccess = () => {
    setOpen(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild onClick={(e) => e.stopPropagation()}>
        <Button className="w-fit whitespace-nowrap">
          <Icon icon="edit-square" className="size-5" />
          {t('settings:inboxes.update_inbox')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <UpdateInboxContent
          inbox={inbox}
          escalationInboxes={escalationInboxes}
          redirectRoutePath={redirectRoutePath}
          isAutoAssignmentAvailable={isAutoAssignmentAvailable}
          onSuccess={handleOnSuccess}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

export function UpdateInboxContent({
  inbox,
  escalationInboxes,
  redirectRoutePath,
  isAutoAssignmentAvailable = false,
  onSuccess,
}: {
  inbox: Inbox;
  escalationInboxes: InboxMetadata[];
  redirectRoutePath: (typeof createInboxRedirectRouteOptions)[number];
  isAutoAssignmentAvailable: boolean;
  onSuccess: () => void;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const updateInboxMutation = useUpdateInboxMutation();
  const revalidate = useLoaderRevalidator();

  const form = useInboxForm({
    inbox,
    onSubmit: (value) => {
      updateInboxMutation
        .mutateAsync({ ...value, id: inbox.id, redirectRoute: redirectRoutePath })
        .then(() => {
          onSuccess();
          revalidate();
        })
        .catch(() => {
          toast.error(t('common:errors.unknown'));
        });
    },
  });

  return (
    <form onSubmit={handleSubmit(form)}>
      <Modal.Title>{t('settings:inboxes.update_inbox')}</Modal.Title>
      <div className="bg-surface-card flex flex-col gap-lg p-lg">
        <InboxFormFields
          form={form}
          inboxId={inbox.id}
          escalationInboxes={escalationInboxes}
          isAutoAssignmentAvailable={isAutoAssignmentAvailable}
        />
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('common:save')}
          type="submit"
          name="update"
          disabled={updateInboxMutation.isPending}
        />
      </Modal.Footer>
    </form>
  );
}
