import { LoadingIcon } from '@app-builder/components/Spinner';
import { serverServices } from '@app-builder/services/init.server';
import { parseForm } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useNavigation } from '@remix-run/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2 } from 'ui-design-system';
import { z } from 'zod';

const deleteWebhookFormSchema = z.object({
  webhookId: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { webhookRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await parseForm(request, deleteWebhookFormSchema);

  await webhookRepository.deleteWebhook({ webhookId: formData.webhookId });
  return redirect(getRoute('/settings/webhooks'));
}

export function DeleteWebhook({
  webhookId,
  children,
}: {
  webhookId: string;
  children: React.ReactElement;
}) {
  const [open, setOpen] = React.useState(false);

  const navigation = useNavigation();
  React.useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content onClick={(e) => e.stopPropagation()}>
        <DeleteWebhookContent webhookId={webhookId} />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function DeleteWebhookContent({ webhookId }: { webhookId: string }) {
  const { t } = useTranslation(['common', 'settings']);

  const navigation = useNavigation();

  return (
    <Form
      action={getRoute('/ressources/settings/webhooks/delete')}
      method="DELETE"
    >
      <ModalV2.Title>
        {t('settings:webhooks.delete_webhook.title')}
      </ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-1 flex-col gap-4">
          <input name="webhookId" value={webhookId} type="hidden" />
          <p className="text-center">
            {t('settings:webhooks.delete_webhook.content')}
          </p>
        </div>

        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close
            render={<Button className="flex-1" variant="secondary" />}
          >
            {t('common:cancel')}
          </ModalV2.Close>
          <Button
            className="flex-1"
            variant="primary"
            color="red"
            type="submit"
            name="create"
          >
            <LoadingIcon
              icon="delete"
              className="size-5"
              loading={navigation.state === 'submitting'}
            />
            {t('common:delete')}
          </Button>
        </div>
      </div>
    </Form>
  );
}
