import { LoadingIcon } from '@app-builder/components/Spinner';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteWebhookMutation } from '@app-builder/queries/settings/webhooks/delete-webhook';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2 } from 'ui-design-system';

export function DeleteWebhook({ webhookId, children }: { webhookId: string; children: React.ReactElement }) {
  const [open, setOpen] = React.useState(false);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content onClick={(e) => e.stopPropagation()}>
        <DeleteWebhookContent webhookId={webhookId} onSuccess={() => setOpen(false)} />
      </ModalV2.Content>
    </ModalV2.Root>
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
      <ModalV2.Title>{t('settings:webhooks.delete_webhook.title')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-1 flex-col gap-4">
          <input name="webhookId" value={webhookId} type="hidden" />
          <p className="text-center">{t('settings:webhooks.delete_webhook.content')}</p>
        </div>

        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>{t('common:cancel')}</ModalV2.Close>
          <Button
            className="flex-1"
            variant="primary"
            color="red"
            type="submit"
            name="create"
            onClick={handleDeleteWebhook}
            disabled={deleteWebhookMutation.isPending}
          >
            <LoadingIcon icon="delete" className="size-5" loading={deleteWebhookMutation.isPending} />
            {t('common:delete')}
          </Button>
        </div>
      </div>
    </>
  );
}
