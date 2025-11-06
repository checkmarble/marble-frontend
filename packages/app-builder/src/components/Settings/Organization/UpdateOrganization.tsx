import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Nudge } from '@app-builder/components/Nudge';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  updateOrganizationPayloadSchema,
  useUpdateOrganizationMutation,
} from '@app-builder/queries/settings/organization/update-organization';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export function UpdateOrganizationSettings({
  organizationId,
  autoAssignQueueLimit,
  isAutoAssignmentAvailable = false,
}: {
  organizationId: string;
  autoAssignQueueLimit: number;
  isAutoAssignmentAvailable: boolean;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  if (!isAutoAssignmentAvailable) {
    return (
      <div className="relative">
        <Button className="w-fit whitespace-nowrap" disabled>
          <Icon icon="edit-square" className="size-6" />
          {t('common:edit')}
        </Button>
        <Nudge
          className="absolute -top-1 -right-1 size-4"
          iconClass="size-2.5"
          kind="restricted"
          content={t('settings:inboxes.auto_assign_queue_limit.nudge', {
            defaultValue: 'N/A',
          })}
        />
      </div>
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild onClick={(e) => e.stopPropagation()}>
        <Button className="w-fit whitespace-nowrap">
          <Icon icon="edit-square" className="size-6" />
          {t('common:edit')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <UpdateOrganizationSettingsContents
          organizationId={organizationId}
          autoAssignQueueLimit={autoAssignQueueLimit}
          closeModal={() => setOpen(false)}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

export function UpdateOrganizationSettingsContents({
  organizationId,
  autoAssignQueueLimit,
  closeModal,
}: {
  organizationId: string;
  autoAssignQueueLimit: number;
  closeModal: () => void;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const updateOrganizationMutation = useUpdateOrganizationMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      organizationId,
      autoAssignQueueLimit,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateOrganizationMutation.mutateAsync(value).then((res) => {
          if (res.success) {
            closeModal();
          }
          revalidate();
        });
      }
    },
    validators: {
      onSubmit: updateOrganizationPayloadSchema
        .pick({ organizationId: true, autoAssignQueueLimit: true })
        .required({ autoAssignQueueLimit: true }) as unknown as any,
    },
  });

  return (
    <form onSubmit={handleSubmit(form)}>
      <Modal.Title>{t('settings:global_settings.title')}</Modal.Title>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <form.Field
          name="autoAssignQueueLimit"
          validators={{
            onChange: z.number().min(0),
            onBlur: z.number().min(0),
          }}
        >
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>{t('settings:global_settings.auto_assign_queue_limit')}</FormLabel>
              <FormInput
                type="number"
                min={0}
                step={1}
                placeholder={t('settings:global_settings.auto_assign_queue_limit')}
                max={1000}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(+e.currentTarget.value)}
                defaultValue={field.state.value}
                valid={field.state.meta.errors.length === 0}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>

        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" type="button">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            className="flex-1"
            variant="primary"
            type="submit"
            name="update"
            disabled={updateOrganizationMutation.isPending}
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
