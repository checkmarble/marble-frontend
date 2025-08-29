import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Nudge } from '@app-builder/components/Nudge';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type InboxUser, tKeyForInboxUserRole } from '@app-builder/models/inbox';
import {
  UpdateInboxUserPayload,
  updateInboxUserPayloadSchema,
  useUpdateInboxUserMutation,
} from '@app-builder/queries/settings/inboxes/update-inbox-user';
import { getInboxUserRoles, isAccessible } from '@app-builder/services/feature-access';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { Namespace } from 'i18next';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function UpdateInboxUser({
  inboxUser,
  inboxUserRoles,
  access,
}: {
  inboxUser: InboxUser;
  inboxUserRoles: ReturnType<typeof getInboxUserRoles>;
  access: FeatureAccessLevelDto;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  const handleOnSuccess = () => {
    setOpen(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon
          icon="edit-square"
          className="size-6 shrink-0"
          aria-label={t('settings:tags.update_tag')}
        />
      </Modal.Trigger>
      <Modal.Content>
        <UpdateInboxUserContent
          currentInboxUser={inboxUser}
          inboxUserRoles={inboxUserRoles}
          access={access}
          onSuccess={handleOnSuccess}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

export function UpdateInboxUserContent({
  currentInboxUser,
  inboxUserRoles,
  access,
  onSuccess,
}: {
  currentInboxUser: InboxUser;
  inboxUserRoles: ReturnType<typeof getInboxUserRoles>;
  access: FeatureAccessLevelDto;
  onSuccess: () => void;
}) {
  const { t } = useTranslation(['common', 'settings'] satisfies Namespace);
  const updateInboxUserMutation = useUpdateInboxUserMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: currentInboxUser as UpdateInboxUserPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateInboxUserMutation.mutateAsync(value).then((res) => {
          if (!res) {
            onSuccess();
          }
          revalidate();
        });
      }
    },
    validators: {
      onSubmit: updateInboxUserPayloadSchema,
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
      <Modal.Title>{t('settings:inboxes.inbox_user.update')}</Modal.Title>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <form.Field
          name="role"
          validators={{
            onChange: updateInboxUserPayloadSchema.shape.role,
          }}
        >
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name} className="flex gap-2">
                <span
                  className={clsx({
                    'text-grey-80': access === 'restricted',
                  })}
                >
                  {t('settings:inboxes.inbox_details.role')}
                </span>
                {access === 'allowed' ? null : (
                  <Nudge
                    content={t('settings:users.role.nudge')}
                    className="size-6"
                    kind={access}
                  />
                )}
              </FormLabel>
              <Select.Default
                name={field.name}
                defaultValue={field.state.value}
                onValueChange={(value: 'admin' | 'member') => field.handleChange(value)}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                disabled={!isAccessible(access)}
              >
                {inboxUserRoles.map((role) => (
                  <Select.DefaultItem key={role} value={role}>
                    {t(tKeyForInboxUserRole(role))}
                  </Select.DefaultItem>
                ))}
              </Select.Default>
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit" name="update">
            {t('common:save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
