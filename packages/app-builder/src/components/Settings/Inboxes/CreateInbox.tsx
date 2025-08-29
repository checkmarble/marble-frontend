import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  CreateInboxPayload,
  createInboxPayloadSchema,
  createInboxRedirectRouteOptions,
  useCreateInboxMutation,
} from '@app-builder/queries/settings/inboxes/create-inbox';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, HiddenInputs, ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateInbox({
  redirectRoutePath,
}: {
  redirectRoutePath?: (typeof createInboxRedirectRouteOptions)[number];
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger
        onClick={(e) => e.stopPropagation()}
        render={<Button className="whitespace-nowrap" variant="secondary" />}
      >
        <Icon icon="new-inbox" className="size-5 shrink-0" />
        {t('settings:inboxes.new_inbox.create')}
      </ModalV2.Trigger>
      <ModalV2.Content onClick={(e) => e.stopPropagation()}>
        <CreateInboxContent redirectRoutePath={redirectRoutePath} setOpen={setOpen} />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

export function CreateInboxContent({
  redirectRoutePath,
  setOpen,
}: {
  redirectRoutePath?: (typeof createInboxRedirectRouteOptions)[number];
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const createInboxMutation = useCreateInboxMutation();
  const revalidate = useLoaderRevalidator();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: { name: '', redirectRoute: redirectRoutePath } as CreateInboxPayload,
    validators: {
      onSubmit: createInboxPayloadSchema,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createInboxMutation.mutateAsync(value).then((res) => {
          if (res?.success) {
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ['inboxes'] });
            revalidate();
          }
        });
      }
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
      <ModalV2.Title>{t('settings:inboxes.new_inbox.explain')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <HiddenInputs redirectRoute={redirectRoutePath} />
        <form.Field
          name="name"
          validators={{
            onBlur: createInboxPayloadSchema.shape.name,
            onChange: createInboxPayloadSchema.shape.name,
          }}
        >
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>{t('settings:inboxes.new_inbox.name')}</FormLabel>
              <FormInput
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                valid={field.state.meta.errors.length === 0}
                type="text"
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
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
            disabled={createInboxMutation.isPending}
          >
            <Icon icon="new-inbox" className="size-5" />
            {t('settings:inboxes.new_inbox.create')}
          </Button>
        </div>
      </div>
    </form>
  );
}
