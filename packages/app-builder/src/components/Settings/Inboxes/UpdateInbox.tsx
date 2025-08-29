import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Nudge } from '@app-builder/components/Nudge';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type Inbox, type InboxMetadata } from '@app-builder/models/inbox';
import { createInboxRedirectRouteOptions } from '@app-builder/queries/settings/inboxes/create-inbox';
import {
  UpdateInboxPayload,
  updateInboxPayloadSchema,
  useUpdateInboxMutation,
} from '@app-builder/queries/settings/inboxes/update-inbox';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Modal, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function UpdateInbox({
  inbox,
  escalationInboxes,
  redirectRoutePath,
  isAutoAssignmentAvailable = false,
}: {
  inbox: Inbox;
  escalationInboxes: InboxMetadata[];
  redirectRoutePath: (typeof createInboxRedirectRouteOptions)[number];
  isAutoAssignmentAvailable: boolean;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  const handleOnSuccess = () => {
    setOpen(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild onClick={(e) => e.stopPropagation()}>
        <Button className="w-fit whitespace-nowrap">
          <Icon icon="edit-square" className="size-6" />
          {t('settings:inboxes.update_inbox')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <UpdateInboxContent
          inbox={inbox}
          escalationInboxes={escalationInboxes}
          redirectRoutePath={redirectRoutePath}
          isAutoAssignmentAvailable={isAutoAssignmentAvailable}
          onSuccess={handleOnSuccess}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

export function UpdateInboxContent({
  inbox,
  escalationInboxes,
  redirectRoutePath,
  isAutoAssignmentAvailable = false,
  onSuccess,
}: {
  inbox: Inbox;
  escalationInboxes: InboxMetadata[];
  redirectRoutePath: (typeof createInboxRedirectRouteOptions)[number];
  isAutoAssignmentAvailable: boolean;
  onSuccess: () => void;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const updateInboxMutation = useUpdateInboxMutation();
  const revalidate = useLoaderRevalidator();
  const [isEscalationInboxOpen, setEscalationOpen] = useState(false);
  const otherInboxes = escalationInboxes.filter((i) => i.id !== inbox.id);

  const form = useForm({
    defaultValues: {
      ...inbox,
      escalationInboxId: inbox.escalationInboxId ?? null,
      redirectRoute: redirectRoutePath,
    } as UpdateInboxPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateInboxMutation.mutateAsync(value).then((res) => {
          if (!res) {
            onSuccess();
          }
          revalidate();
        });
      }
    },
    validators: {
      onSubmit: updateInboxPayloadSchema,
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
      <Modal.Title>{t('settings:inboxes.update_inbox')}</Modal.Title>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <form.Field
          name="name"
          validators={{
            onChange: updateInboxPayloadSchema.shape.name,
          }}
        >
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>{t('settings:inboxes.name')}</FormLabel>
              <FormInput
                type="text"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                defaultValue={field.state.value}
                valid={field.state.meta.errors.length === 0}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field
          name="escalationInboxId"
          validators={{
            onChange: updateInboxPayloadSchema.shape.escalationInboxId,
          }}
        >
          {(field) => {
            const selectedInbox = escalationInboxes.find((inbox) => inbox.id === field.state.value);

            return (
              <div className="group flex flex-col gap-2">
                <FormLabel name={field.name}>{t('settings:inboxes.escalation_inbox')}</FormLabel>
                <MenuCommand.Menu open={isEscalationInboxOpen} onOpenChange={setEscalationOpen}>
                  <MenuCommand.Trigger>
                    <MenuCommand.SelectButton>
                      {selectedInbox
                        ? selectedInbox.name
                        : t('settings:inboxes.inbox_details.no_escalation_inbox')}
                    </MenuCommand.SelectButton>
                  </MenuCommand.Trigger>
                  <MenuCommand.Content align="start" sameWidth sideOffset={4}>
                    <MenuCommand.List>
                      <MenuCommand.Item value="" onSelect={() => field.handleChange(null)}>
                        {t('settings:inboxes.inbox_details.no_escalation_inbox')}
                      </MenuCommand.Item>
                      {otherInboxes.map((inbox) => (
                        <MenuCommand.Item
                          key={inbox.id}
                          value={inbox.id}
                          onSelect={field.handleChange}
                        >
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
            onChange: updateInboxPayloadSchema.shape.autoAssignEnabled,
          }}
        >
          {(field) => (
            <div className="group flex justify-between">
              <div className="flex gap-2">
                <FormLabel name={field.name}>
                  {t('settings:inboxes.inbox_details.auto_assign_enabled.label')}
                </FormLabel>
                {!isAutoAssignmentAvailable ? (
                  <Nudge
                    className="size-5"
                    kind="restricted"
                    content={t('settings:inboxes.auto_assign_queue_limit.nudge', {
                      defaultValue: 'N/A',
                    })}
                  />
                ) : null}
              </div>

              <Switch
                checked={isAutoAssignmentAvailable ? field.state.value : false}
                onCheckedChange={field.handleChange}
                disabled={!isAutoAssignmentAvailable}
              />
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
            disabled={updateInboxMutation.isPending}
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
