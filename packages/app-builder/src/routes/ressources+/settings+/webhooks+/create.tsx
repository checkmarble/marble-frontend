import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelectWithCombobox } from '@app-builder/components/Form/FormSelectWithCombobox';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { Nudge } from '@app-builder/components/Nudge';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { FormSelectEvents } from '@app-builder/components/Webhooks/EventTypes';
import { eventTypes } from '@app-builder/models/webhook';
import { webhooksEventsDocHref } from '@app-builder/services/documentation-href';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type FeatureAccessDto } from 'marble-api/generated/license-api';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, ModalV2 } from 'ui-design-system';
import { z } from 'zod';

const createWebhookFormSchema = z.object({
  url: z.string().url(),
  eventTypes: z.array(z.enum(eventTypes)),
  httpTimeout: z.number().int().positive().optional(),
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
    const webhook = await webhookRepository.createWebhook({
      webhookCreateBody: submission.value,
    });

    return redirect(
      getRoute('/settings/webhooks/:webhookId', {
        webhookId: webhook.id,
      }),
    );
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

export function CreateWebhook({
  children,
  webhookStatus,
}: {
  children: React.ReactElement;
  webhookStatus: FeatureAccessDto;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <CreateWebhookContent webhookStatus={webhookStatus} />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function CreateWebhookContent({ webhookStatus }: { webhookStatus: FeatureAccessDto }) {
  const { t } = useTranslation(['common', 'settings']);

  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue: {
      url: '',
      eventTypes: [],
    },
    lastResult: fetcher.data,
    constraint: getZodConstraint(createWebhookFormSchema),
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
          <FormField name={fields.url.name} className="flex flex-col items-start gap-2">
            <FormLabel>{t('settings:webhooks.url')}</FormLabel>
            <FormInput type="url" className="w-full" />
            <FormErrorOrDescription />
          </FormField>

          <FormField
            name={fields.eventTypes.name}
            className="flex flex-col items-start gap-2"
            description={
              <span className="whitespace-pre text-wrap">
                <Trans
                  t={t}
                  i18nKey="settings:webhooks.events_documentation"
                  components={{
                    DocLink: <ExternalLink href={webhooksEventsDocHref} />,
                  }}
                />
              </span>
            }
          >
            <FormLabel className="flex items-center gap-2">
              {t('settings:webhooks.event_types')}
              {match(webhookStatus)
                .with('allowed', () => null)
                .with('restricted', () => (
                  <Nudge
                    kind="restricted"
                    content={t('settings:webhooks.nudge')}
                    className="size-6"
                  />
                ))
                .with('test', () => (
                  <Nudge kind="test" content={t('settings:webhooks.nudge')} className="size-6" />
                ))
                .exhaustive()}
            </FormLabel>
            <FormSelectWithCombobox.Control
              multiple
              options={eventTypes}
              render={({ selectedValue }) => (
                <FormSelectEvents
                  selectedEventTypes={selectedValue}
                  className="w-full"
                  webhookStatus={webhookStatus}
                />
              )}
            />
            <FormErrorOrDescription />
          </FormField>

          <FormField
            name={fields.httpTimeout.name}
            className="flex flex-col items-start gap-2"
            description={t('settings:webhooks.http_timeout.description')}
          >
            <FormLabel>{t('settings:webhooks.http_timeout')}</FormLabel>
            <FormInput type="number" className="w-full" />
            <FormErrorOrDescription />
          </FormField>

          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>
              {t('common:cancel')}
            </ModalV2.Close>
            <Button className="flex-1" variant="primary" type="submit" name="create">
              <LoadingIcon
                icon="plus"
                className="size-5"
                loading={fetcher.state === 'submitting'}
              />
              {t('settings:webhooks.new_webhook.create')}
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </FormProvider>
  );
}
