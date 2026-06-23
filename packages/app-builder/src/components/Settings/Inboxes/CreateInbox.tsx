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
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, HiddenInputs, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateInbox({
  redirectRoutePath,
  onInboxCreated,
}: {
  redirectRoutePath?: (typeof createInboxRedirectRouteOptions)[number];
  onInboxCreated?: (inboxId: string) => void;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger onClick={(e) => e.stopPropagation()} asChild>
        <Button className="whitespace-nowrap" variant="secondary" appearance="stroked">
          <Icon icon="new-inbox" className="size-5 shrink-0" />
          {t('settings:inboxes.new_inbox.create')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateInboxContent setOpen={setOpen} redirectRoutePath={redirectRoutePath} onInboxCreated={onInboxCreated} />
      </Modal.Content>
    </Modal.Root>
  );
}

export function CreateInboxContent({
  redirectRoutePath,
  setOpen,
  onInboxCreated,
}: {
  redirectRoutePath?: (typeof createInboxRedirectRouteOptions)[number];
  setOpen: (open: boolean) => void;
  onInboxCreated?: (inboxId: string) => void;
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
        createInboxMutation
          .mutateAsync(value)
          .then((result) => {
            toast.success(t('common:success.save'));
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ['inboxes'] });
            revalidate();
            if (result?.inboxId) {
              onInboxCreated?.(result.inboxId);
            }
          })
          .catch(() => {
            toast.error(t('common:errors.unknown'));
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
      <div className="flex flex-col gap-lg p-lg">
        <HiddenInputs redirectRoute={redirectRoutePath} />
        <form.Field name="name">
          {(field) => (
            <div className="group flex flex-col gap-sm">
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
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('settings:inboxes.new_inbox.create')}
          type="submit"
          name="create"
          disabled={createInboxMutation.isPending}
          leadingIcon="new-inbox"
        />
      </Modal.Footer>
    </form>
  );
}
