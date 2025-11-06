import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type ApiKey } from '@app-builder/models/api-keys';
import { useDeleteApiKeyMutation } from '@app-builder/queries/settings/api-keys/delete-api-key';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeleteApiKey({ apiKey }: { apiKey: ApiKey }) {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon icon="delete" className="size-6 shrink-0" aria-label={t('settings:api_keys.delete')} />
      </Modal.Trigger>
      <Modal.Content>
        <DeleteApiKeyContent apiKey={apiKey} onSuccess={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}

function DeleteApiKeyContent({ apiKey, onSuccess }: { apiKey: ApiKey; onSuccess: () => void }) {
  const { t } = useTranslation(['settings', 'common']);
  const deleteApiKeyMutation = useDeleteApiKeyMutation();
  const revalidate = useLoaderRevalidator();

  const handleDeleteApiKey = () => {
    deleteApiKeyMutation.mutateAsync({ apiKeyId: apiKey.id }).then((res) => {
      if (!res) {
        onSuccess();
      }
      revalidate();
    });
  };

  return (
    <>
      <Modal.Title>{t('settings:api_keys.delete')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-1 flex-col gap-4">
          <input name="apiKeyId" value={apiKey.id} type="hidden" />
          <p className="text-center">{t('settings:api_keys.delete.content')}</p>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button color="red" className="flex-1" variant="primary" name="delete" onClick={handleDeleteApiKey}>
            <Icon icon="delete" className="size-6" />
            {t('common:delete')}
          </Button>
        </div>
      </div>
    </>
  );
}
