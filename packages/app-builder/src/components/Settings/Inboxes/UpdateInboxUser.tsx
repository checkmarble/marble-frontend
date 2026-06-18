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
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Modal, SelectV2 } from 'ui-design-system';
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
      <Modal.Trigger className="cursor-pointer block">
        <Icon icon="edit-square" className="size-6 shrink-0" aria-label={t('settings:tags.update_tag')} />
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
        updateInboxUserMutation
          .mutateAsync(value)
          .then(() => {
            onSuccess();
            revalidate();
          })
          .catch(() => {
            toast.error(t('common:errors.unknown'));
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
      <div className="bg-surface-card flex flex-col gap-lg p-lg">
        <form.Field
          name="role"
          validators={{
            onChange: updateInboxUserPayloadSchema.shape.role,
          }}
        >
          {(field) => (
            <div className="group flex flex-col gap-sm">
              <FormLabel name={field.name} className="flex gap-sm">
                <span
                  className={clsx({
                    'text-grey-disabled': access === 'restricted',
                  })}
                >
                  {t('settings:inboxes.inbox_details.role')}
                </span>
                {access === 'allowed' ? null : (
                  <Nudge content={t('settings:users.role.nudge')} className="size-6" kind={access} />
                )}
              </FormLabel>
              <SelectV2
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                placeholder={t('settings:inboxes.inbox_details.role')}
                disabled={!isAccessible(access)}
                options={inboxUserRoles.map((role) => ({
                  label: t(tKeyForInboxUserRole(role)),
                  value: role,
                }))}
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
          disabled={updateInboxUserMutation.isPending}
        />
      </Modal.Footer>
    </form>
  );
}
