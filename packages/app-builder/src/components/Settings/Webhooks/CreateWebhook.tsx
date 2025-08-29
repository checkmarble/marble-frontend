import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Nudge } from '@app-builder/components/Nudge';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { SelectEvents } from '@app-builder/components/Webhooks/EventTypes';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type EventType } from '@app-builder/models/webhook';
import {
  CreateWebhookPayload,
  createWebhookPayloadSchema,
  useCreateWebhookMutation,
} from '@app-builder/queries/settings/webhooks/create-webhook';
import { webhooksEventsDocHref } from '@app-builder/services/documentation-href';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, ModalV2 } from 'ui-design-system';

export function CreateWebhook({
  children,
  webhookStatus,
}: {
  children: React.ReactElement;
  webhookStatus: FeatureAccessLevelDto;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <CreateWebhookContent webhookStatus={webhookStatus} onSuccess={() => setOpen(false)} />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function CreateWebhookContent({
  webhookStatus,
  onSuccess,
}: {
  webhookStatus: FeatureAccessLevelDto;
  onSuccess: () => void;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const createWebhookMutation = useCreateWebhookMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      url: '',
      eventTypes: [],
    } as CreateWebhookPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createWebhookMutation.mutateAsync(value).then((res) => {
          if (!res) {
            onSuccess();
          }
          revalidate();
        });
      }
    },
    validators: {
      onSubmit: createWebhookPayloadSchema,
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
        <form.Field
          name="url"
          validators={{
            onChange: createWebhookPayloadSchema.shape.url,
          }}
        >
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

        <form.Field
          name="eventTypes"
          validators={{
            onChange: createWebhookPayloadSchema.shape.eventTypes,
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
            onChange: createWebhookPayloadSchema.shape.httpTimeout,
          }}
        >
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
          <Button
            className="flex-1"
            variant="primary"
            type="submit"
            name="create"
            disabled={createWebhookMutation.isPending}
          >
            <LoadingIcon icon="plus" className="size-5" loading={createWebhookMutation.isPending} />
            {t('settings:webhooks.new_webhook.create')}
          </Button>
        </div>
      </div>
    </form>
  );
}
