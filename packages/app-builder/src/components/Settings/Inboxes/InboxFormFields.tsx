import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { Nudge } from '@app-builder/components/Nudge';
import { type Inbox, type InboxMetadata } from '@app-builder/models/inbox';
import { updateInboxPayloadSchema } from '@app-builder/queries/settings/inboxes/update-inbox';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, MenuCommand, Switch, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { type z } from 'zod/v4';

const inboxFormSchema = updateInboxPayloadSchema.pick({
  name: true,
  escalationInboxId: true,
  autoAssignEnabled: true,
});
export type InboxFormValues = z.infer<typeof inboxFormSchema>;

export function useInboxForm({
  inbox,
  onSubmit,
}: {
  inbox?: Inbox;
  onSubmit: (value: InboxFormValues) => void | Promise<void>;
}) {
  return useForm({
    defaultValues: {
      name: inbox?.name ?? '',
      escalationInboxId: inbox?.escalationInboxId ?? null,
      autoAssignEnabled: inbox?.autoAssignEnabled ?? false,
    } as InboxFormValues,
    validators: {
      onSubmit: inboxFormSchema,
    },
    onSubmit: ({ value }) => {
      return onSubmit(value);
    },
  });
}

export function InboxFormFields({
  form,
  inboxId,
  escalationInboxes,
  isAutoAssignmentAvailable,
}: {
  form: ReturnType<typeof useInboxForm>;
  inboxId?: string;
  escalationInboxes: InboxMetadata[];
  isAutoAssignmentAvailable: boolean;
}) {
  const { t } = useTranslation(['settings']);
  const [isEscalationInboxOpen, setEscalationOpen] = useState(false);
  const otherInboxes = escalationInboxes.filter((i) => i.id !== inboxId);

  return (
    <>
      <form.Field
        name="name"
        validators={{
          onChange: inboxFormSchema.shape.name,
        }}
      >
        {(field) => (
          <div className="group flex flex-col gap-sm">
            <label htmlFor={field.name}>{t('settings:inboxes.inbox_name')}</label>
            <Input
              id={field.name}
              type="text"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              defaultValue={field.state.value}
              aria-invalid={field.state.meta.errors.length > 0 || undefined}
              borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
            />
            <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
          </div>
        )}
      </form.Field>
      <form.Field
        name="escalationInboxId"
        validators={{
          onChange: inboxFormSchema.shape.escalationInboxId,
        }}
      >
        {(field) => {
          const selectedInbox = escalationInboxes.find((inbox) => inbox.id === field.state.value);

          return (
            <div className="group flex flex-col gap-sm">
              <label htmlFor={field.name}>{t('settings:inboxes.escalation_inbox')}</label>
              <MenuCommand.Menu open={isEscalationInboxOpen} onOpenChange={setEscalationOpen}>
                <MenuCommand.Trigger>
                  <MenuCommand.SelectButton>
                    {selectedInbox ? selectedInbox.name : t('settings:inboxes.inbox_details.no_escalation_inbox')}
                  </MenuCommand.SelectButton>
                </MenuCommand.Trigger>
                <MenuCommand.Content align="start" sameWidth sideOffset={4}>
                  <MenuCommand.List>
                    <MenuCommand.Item value="" onSelect={() => field.handleChange(null)}>
                      {t('settings:inboxes.inbox_details.no_escalation_inbox')}
                    </MenuCommand.Item>
                    {otherInboxes.map((inbox) => (
                      <MenuCommand.Item key={inbox.id} value={inbox.id} onSelect={field.handleChange}>
                        {inbox.name}
                      </MenuCommand.Item>
                    ))}
                  </MenuCommand.List>
                </MenuCommand.Content>
              </MenuCommand.Menu>
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          );
        }}
      </form.Field>
      <form.Field
        name="autoAssignEnabled"
        validators={{
          onChange: inboxFormSchema.shape.autoAssignEnabled,
        }}
      >
        {(field) => (
          <div className="group flex items-center gap-sm">
            <Switch
              id={field.name}
              checked={isAutoAssignmentAvailable ? field.state.value : false}
              onCheckedChange={field.handleChange}
              disabled={!isAutoAssignmentAvailable}
            />
            <label htmlFor={field.name}>{t('settings:inboxes.inbox_details.auto_assign_enabled.label')}</label>
            {isAutoAssignmentAvailable ? (
              <Tooltip.Default content={t('settings:inboxes.auto_assign_queue_limit.nudge')}>
                <Icon icon="tip" className="text-purple-primary size-5" />
              </Tooltip.Default>
            ) : (
              <Nudge
                className="size-5"
                kind="restricted"
                content={t('settings:inboxes.auto_assign_queue_limit.nudge', {
                  defaultValue: 'N/A',
                })}
              />
            )}
          </div>
        )}
      </form.Field>
    </>
  );
}
