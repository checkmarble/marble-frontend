import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { Nudge } from '@app-builder/components/Nudge';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { SelectEvents } from '@app-builder/components/Webhooks/EventTypes';
import { type EventType, eventTypes } from '@app-builder/models/webhook';
import { webhooksEventsDocHref } from '@app-builder/services/documentation-href';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import type { FeatureAccessDto } from 'marble-api/generated/license-api';
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

type CreateWebhookForm = z.infer<typeof createWebhookFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { webhookRepository }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = createWebhookFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    const webhook = await webhookRepository.createWebhook({
      webhookCreateBody: data,
    });

    return redirect(
      getRoute('/settings/webhooks/:webhookId', {
        webhookId: webhook.id,
      }),
    );
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
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

  const form = useForm({
    defaultValues: {
      url: '',
      eventTypes: [],
    } as CreateWebhookForm,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/settings/webhooks/create'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChange: createWebhookFormSchema,
      onBlur: createWebhookFormSchema,
      onSubmit: createWebhookFormSchema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <ModalV2.Title>{t('settings:webhooks.new_webhook')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <form.Field name="url">
          {(field) => (
            <div className="flex flex-col items-start gap-2">
              <FormLabel name={field.name}>{t('settings:webhooks.url')}</FormLabel>
              <FormInput
                type="url"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                defaultValue={field.state.value}
                valid={field.state.meta.errors.length === 0}
                className="w-full"
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>

        <form.Field name="eventTypes">
          {(field) => (
            <div className="flex flex-col items-start gap-2">
              <FormLabel name={field.name} className="flex items-center gap-2">
                {t('settings:webhooks.event_types')}
                {match(webhookStatus)
                  .with('allowed', () => null)
                  .otherwise((status) => (
                    <Nudge
                      kind={status}
                      content={t('settings:webhooks.nudge')}
                      className="size-6"
                    />
                  ))}
              </FormLabel>
              <SelectEvents
                selectedEventTypes={field.state.value}
                className="w-full"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(types) => field.handleChange(types as EventType[])}
                webhookStatus={webhookStatus}
              />
              <FormErrorOrDescription
                errors={getFieldErrors(field.state.meta.errors)}
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
              />
            </div>
          )}
        </form.Field>

        <form.Field name="httpTimeout">
          {(field) => (
            <div className="flex flex-col items-start gap-2">
              <FormLabel name={field.name}>{t('settings:webhooks.http_timeout')}</FormLabel>
              <FormInput
                type="number"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(+e.currentTarget.value)}
                defaultValue={field.state.value}
                valid={field.state.meta.errors.length === 0}
                className="w-full"
              />
              <FormErrorOrDescription
                errors={getFieldErrors(field.state.meta.errors)}
                description={t('settings:webhooks.http_timeout.description')}
              />
            </div>
          )}
        </form.Field>

        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>
            {t('common:cancel')}
          </ModalV2.Close>
          <Button className="flex-1" variant="primary" type="submit" name="create">
            <LoadingIcon icon="plus" className="size-5" loading={fetcher.state === 'submitting'} />
            {t('settings:webhooks.new_webhook.create')}
          </Button>
        </div>
      </div>
    </form>
  );
}
