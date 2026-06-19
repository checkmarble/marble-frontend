import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteWebhookMutation } from '@app-builder/queries/settings/webhooks/delete-webhook';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

export function DeleteWebhook({ webhookId, children }: { webhookId: string; children: React.ReactElement }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <DeleteWebhookContent webhookId={webhookId} onSuccess={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}

function DeleteWebhookContent({ webhookId, onSuccess }: { webhookId: string; onSuccess: () => void }) {
  const { t } = useTranslation(['common', 'settings']);
  const deleteWebhookMutation = useDeleteWebhookMutation();
  const revalidate = useLoaderRevalidator();

  const handleDeleteWebhook = () => {
    deleteWebhookMutation.mutateAsync({ webhookId }).then((res) => {
      if (!res) {
        onSuccess();
      }
      revalidate();
    });
  };

  return (
    <>
      <Modal.Title>{t('settings:webhooks.delete_webhook.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-1 flex-col gap-4">
          <input name="webhookId" value={webhookId} type="hidden" />
          <p className="text-center">{t('settings:webhooks.delete_webhook.content')}</p>
        </div>
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('common:delete')}
          variant="destructive"
          type="submit"
          name="create"
          onClick={handleDeleteWebhook}
          disabled={deleteWebhookMutation.isPending}
          leadingIcon="delete"
        />
      </Modal.Footer>
    </>
  );
}
