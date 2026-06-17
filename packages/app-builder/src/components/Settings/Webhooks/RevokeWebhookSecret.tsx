import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useRevokeWebhookSecretMutation } from '@app-builder/queries/settings/webhooks/revoke-webhook-secret';
import { type ReactElement, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

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
    revokeMutation
      .mutateAsync({ webhookId, secretId })
      .then(() => {
        onSuccess();
        revalidate();
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
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
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('settings:webhooks.revoke_secret')}
          type="submit"
          onClick={handleRevoke}
          disabled={revokeMutation.isPending}
          leadingIcon="delete"
        />
      </Modal.Footer>
    </>
  );
}
