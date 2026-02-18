import { LoadingIcon } from '@app-builder/components/Spinner';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useRevokeWebhookSecretMutation } from '@app-builder/queries/settings/webhooks/revoke-webhook-secret';
import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';

export function RevokeWebhookSecret({
  webhookId,
  secretId,
  children,
}: {
  webhookId: string;
  secretId: string;
  children: ReactElement;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <RevokeWebhookSecretContent webhookId={webhookId} secretId={secretId} onSuccess={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}

function RevokeWebhookSecretContent({
  webhookId,
  secretId,
  onSuccess,
}: {
  webhookId: string;
  secretId: string;
  onSuccess: () => void;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const revokeMutation = useRevokeWebhookSecretMutation();
  const revalidate = useLoaderRevalidator();

  const handleRevoke = () => {
    revokeMutation.mutateAsync({ webhookId, secretId }).then((res) => {
      if (res?.success) {
        onSuccess();
      }
      revalidate();
    });
  };

  return (
    <>
      <Modal.Title>{t('settings:webhooks.revoke_secret.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-1 flex-col gap-4">
          <p className="text-center">{t('settings:webhooks.revoke_secret.content')}</p>
        </div>
      </div>
      <Modal.Footer>
        <Modal.Close asChild>
          <Button variant="secondary" appearance="stroked">
            {t('common:cancel')}
          </Button>
        </Modal.Close>
        <Button variant="destructive" type="submit" onClick={handleRevoke} disabled={revokeMutation.isPending}>
          <LoadingIcon icon="delete" className="size-5" loading={revokeMutation.isPending} />
          {t('settings:webhooks.revoke_secret')}
        </Button>
      </Modal.Footer>
    </>
  );
}
