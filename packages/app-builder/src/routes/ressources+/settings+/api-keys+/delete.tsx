import { type ApiKey } from '@app-builder/models/api-keys';
import { serverServices } from '@app-builder/services/init.server';
import { parseForm } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useNavigation } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const deleteApiKeyFormSchema = z.object({
  apiKeyId: z.string().uuid(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { apiKey } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await parseForm(request, deleteApiKeyFormSchema);

  await apiKey.deleteApiKey(formData);
  return redirect(getRoute('/settings/api-keys'));
}

export function DeleteApiKey({ apiKey }: { apiKey: ApiKey }) {
  const { t } = useTranslation(['settings']);

  const [open, setOpen] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon
          icon="delete"
          className="size-6 shrink-0"
          aria-label={t('settings:api_keys.delete')}
        />
      </Modal.Trigger>
      <Modal.Content>
        <DeleteApiKeyContent apiKey={apiKey} />
      </Modal.Content>
    </Modal.Root>
  );
}

function DeleteApiKeyContent({ apiKey }: { apiKey: ApiKey }) {
  const { t } = useTranslation(['settings', 'common']);

  return (
    <Form action={getRoute('/ressources/settings/api-keys/delete')} method="DELETE">
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
          <Button color="red" className="flex-1" variant="primary" type="submit" name="delete">
            <Icon icon="delete" className="size-6" />
            {t('common:delete')}
          </Button>
        </div>
      </div>
    </Form>
  );
}
