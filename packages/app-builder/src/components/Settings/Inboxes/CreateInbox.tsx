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
import { ButtonV2, HiddenInputs, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateInbox({
  redirectRoutePath,
}: {
  redirectRoutePath?: (typeof createInboxRedirectRouteOptions)[number];
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger onClick={(e) => e.stopPropagation()} asChild>
        <ButtonV2 className="whitespace-nowrap" variant="secondary" appearance="stroked">
          <Icon icon="new-inbox" className="size-5 shrink-0" />
          {t('settings:inboxes.new_inbox.create')}
        </ButtonV2>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateInboxContent setOpen={setOpen} redirectRoutePath={redirectRoutePath} />
      </Modal.Content>
    </Modal.Root>
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
      <Modal.Title>{t('settings:inboxes.new_inbox.explain')}</Modal.Title>
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
      </div>
      <Modal.Footer>
        <Modal.Close asChild>
          <ButtonV2 variant="secondary" appearance="stroked">
            {t('common:cancel')}
          </ButtonV2>
        </Modal.Close>
        <ButtonV2 variant="primary" type="submit" name="create" disabled={createInboxMutation.isPending}>
          <Icon icon="new-inbox" className="size-5" />
          {t('settings:inboxes.new_inbox.create')}
        </ButtonV2>
      </Modal.Footer>
    </form>
  );
}
