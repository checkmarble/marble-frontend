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
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, ModalV2 } from 'ui-design-system';
import { z } from 'zod/v4';

const updateWebhookFormSchema = z.object({
  id: z.string().nonempty(),
  eventTypes: z.array(z.enum(eventTypes)),
  httpTimeout: z.int().positive().optional(),
});

type UpdateWebhookForm = z.infer<typeof updateWebhookFormSchema>;

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

  const { data, success, error } = updateWebhookFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await webhookRepository.updateWebhook({
      webhookId: data.id,
      webhookUpdateBody: data,
    });

    return json(
      { status: 'success', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch (_error) {
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

export function UpdateWebhook({
  defaultValue,
  children,
  webhookStatus,
}: {
  defaultValue: UpdateWebhookForm;
  children: React.ReactElement;
  webhookStatus: FeatureAccessLevelDto;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <UpdateWebhookContent
          defaultValue={defaultValue}
          webhookStatus={webhookStatus}
          setOpen={setOpen}
        />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function UpdateWebhookContent({
  defaultValue,
  setOpen,
  webhookStatus,
}: {
  defaultValue: UpdateWebhookForm;
  setOpen: (open: boolean) => void;
  webhookStatus: FeatureAccessLevelDto;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const fetcher = useFetcher<typeof action>();

  React.useEffect(() => {
    if (fetcher?.data?.status === 'success') {
      setOpen(false);
    }
  }, [setOpen, fetcher?.data?.status]);

  const form = useForm({
    defaultValues: defaultValue,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/settings/webhooks/update'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onSubmitAsync: updateWebhookFormSchema,
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
      <ModalV2.Title>{t('settings:webhooks.update_webhook')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <form.Field
          name="eventTypes"
          validators={{
            onChange: updateWebhookFormSchema.shape.eventTypes,
            onBlur: updateWebhookFormSchema.shape.eventTypes,
          }}
        >
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
                  <span className="whitespace-pre-wrap">
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

        <form.Field
          name="httpTimeout"
          validators={{
            onChange: updateWebhookFormSchema.shape.httpTimeout,
            onBlur: updateWebhookFormSchema.shape.httpTimeout,
          }}
        >
          {(field) => (
            <div className="flex flex-col items-start gap-2">
              <FormLabel name={field.name}>{t('settings:webhooks.http_timeout')}</FormLabel>
              <FormInput
                type="number"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(Number(e.currentTarget.value))}
                onBlur={field.handleBlur}
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
          <Button className="flex-1" variant="primary" type="submit" name="update">
            <LoadingIcon
              icon="edit-square"
              className="size-5"
              loading={fetcher.state === 'submitting'}
            />
            {t('settings:webhooks.update_webhook')}
          </Button>
        </div>
      </div>
    </form>
  );
}
