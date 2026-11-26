import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { Nudge } from '@app-builder/components/Nudge';
import {
  updateOrganizationPayloadSchema,
  useUpdateOrganizationMutation,
} from '@app-builder/queries/settings/organization/update-organization';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal } from 'ui-design-system';
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
        <Button variant="secondary" appearance="stroked" className="w-fit whitespace-nowrap" disabled>
          <Icon icon="settings" className="size-4" />
          {t('settings:global_settings.title')}
        </Button>
        <Nudge
          className="absolute -top-1 -end-xs size-4"
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
        <Button variant="secondary" appearance="stroked" className="w-fit whitespace-nowrap">
          <Icon icon="settings" className="size-4" />
          {t('settings:global_settings.title')}
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

function UpdateOrganizationSettingsContents({
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
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      organizationId,
      autoAssignQueueLimit,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateOrganizationMutation.mutateAsync(value);
        toast.success(t('common:success.save'));
        closeModal();
        router.invalidate();
      } catch {
        toast.error(t('common:errors.unknown'));
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
      <div className="bg-surface-card flex flex-col gap-lg p-lg">
        <form.Field
          name="autoAssignQueueLimit"
          validators={{
            onChange: z.number().min(0),
            onBlur: z.number().min(0),
          }}
        >
          {(field) => (
            <div className="group flex flex-col gap-sm">
              <label htmlFor={field.name}>{t('settings:global_settings.auto_assign_queue_limit')}</label>
              <Input
                id={field.name}
                type="number"
                min={0}
                step={1}
                placeholder={t('settings:global_settings.auto_assign_queue_limit')}
                max={1000}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(+e.currentTarget.value)}
                defaultValue={field.state.value}
                aria-invalid={field.state.meta.errors.length > 0 || undefined}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('common:save')}
          type="submit"
          name="update"
          disabled={updateOrganizationMutation.isPending}
        />
      </Modal.Footer>
    </form>
  );
}
