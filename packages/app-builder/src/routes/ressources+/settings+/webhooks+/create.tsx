import { FormError } from '@app-builder/components/Form/FormError';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { eventTypes } from '@app-builder/models/webhook';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const createWebhookFormSchema = z.object({
  url: z.string().url(),
  eventTypes: z.array(z.enum(eventTypes)),
  httpTimeout: z.number().int().positive().optional(),
  rateLimit: z.number().int().positive().optional(),
  rateLimitDuration: z.number().int().positive().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { webhookRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: createWebhookFormSchema,
  });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    // TODO(webhook): implement a way to retrieve webhook secret frontend side
    await webhookRepository.createWebhook({
      webhookCreateBody: submission.value,
    });

    return json(submission.reply());
  } catch (error) {
    const session = await getSession(request);
    const t = await getFixedT(request, ['common']);

    const formError = t('common:errors.unknown');

    setToastMessage(session, {
      type: 'error',
      message: formError,
    });

    return json(submission.reply({ formErrors: [formError] }), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

export function CreateWebhook({ children }: { children: React.ReactElement }) {
  const [open, setOpen] = React.useState(false);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <CreateWebhookContent setOpen={setOpen} />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function CreateWebhookContent({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation(['common', 'settings']);

  const fetcher = useFetcher<typeof action>();
  React.useEffect(() => {
    if (fetcher?.data?.status === 'success') {
      setOpen(false);
    }
  }, [setOpen, fetcher?.data?.status]);

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue: {
      url: '',
      eventTypes: [],
      httpTimeout: 0,
      rateLimit: 0,
      rateLimitDuration: 0,
    },
    lastResult: fetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: createWebhookFormSchema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        method="post"
        action={getRoute('/ressources/settings/webhooks/create')}
        {...getFormProps(form)}
      >
        <ModalV2.Title>{t('settings:webhooks.new_webhook')}</ModalV2.Title>
        <div className="flex flex-col gap-6 p-6">
          {/* TODO(webhook): implement all fields */}{' '}
          <FormField
            name={fields.url.name}
            className="flex flex-col items-start gap-2"
          >
            <FormLabel>{t('settings:webhooks.url')}</FormLabel>
            <FormInput type="url" className="w-full" />
            <FormError />
          </FormField>
          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close
              render={<Button className="flex-1" variant="secondary" />}
            >
              {t('common:cancel')}
            </ModalV2.Close>
            <Button
              className="flex-1"
              variant="primary"
              type="submit"
              name="create"
            >
              <Icon icon="plus" className="size-5" />
              {t('settings:webhooks.new_webhook.create')}
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </FormProvider>
  );
}