import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  type CreateWebhookSecretPayload,
  createWebhookSecretPayloadSchema,
  useCreateWebhookSecretMutation,
} from '@app-builder/queries/settings/webhooks/create-webhook-secret';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';

export function CreateWebhookSecret({ webhookId, children }: { webhookId: string; children: React.ReactElement }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateWebhookSecretContent webhookId={webhookId} onSuccess={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}

function CreateWebhookSecretContent({ webhookId, onSuccess }: { webhookId: string; onSuccess: () => void }) {
  const { t } = useTranslation(['common', 'settings']);
  const createMutation = useCreateWebhookSecretMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      webhookId,
      expireExistingInDays: undefined,
    } as CreateWebhookSecretPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createMutation.mutateAsync(value).then((res) => {
          if (res?.success) {
            onSuccess();
          }
          revalidate();
        });
      }
    },
    validators: {
      onSubmit: createWebhookSecretPayloadSchema,
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
      <Modal.Title>{t('settings:webhooks.create_secret.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <form.Field
          name="expireExistingInDays"
          validators={{
            onChange: createWebhookSecretPayloadSchema.shape.expireExistingInDays,
          }}
        >
          {(field) => (
            <div className="flex flex-col items-start gap-2">
              <FormLabel name={field.name}>{t('settings:webhooks.create_secret.expire_existing_in_days')}</FormLabel>
              <FormInput
                type="number"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.currentTarget.value ? +e.currentTarget.value : undefined)}
                defaultValue={field.state.value}
                valid={field.state.meta.errors.length === 0}
                className="w-full"
              />
              <FormErrorOrDescription
                errors={getFieldErrors(field.state.meta.errors)}
                description={t('settings:webhooks.create_secret.expire_existing_in_days.description')}
              />
            </div>
          )}
        </form.Field>
      </div>
      <Modal.Footer>
        <Modal.Close asChild>
          <Button variant="secondary" appearance="stroked">
            {t('common:cancel')}
          </Button>
        </Modal.Close>
        <Button variant="primary" type="submit" disabled={createMutation.isPending}>
          <LoadingIcon icon="plus" className="size-5" loading={createMutation.isPending} />
          {t('settings:webhooks.create_secret')}
        </Button>
      </Modal.Footer>
    </form>
  );
}
