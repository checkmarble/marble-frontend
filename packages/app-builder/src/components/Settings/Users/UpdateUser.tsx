import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Nudge } from '@app-builder/components/Nudge';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { tKeyForUserRole, type User } from '@app-builder/models';
import {
  UpdateUserPayload,
  updateUserPayloadSchema,
  useUpdateUserMutation,
} from '@app-builder/queries/settings/users/update-user';
import { isAccessible } from '@app-builder/services/feature-access';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { Namespace } from 'i18next';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function UpdateUser({
  user,
  userRoles,
  access,
}: {
  user: User;
  userRoles: readonly [string, ...string[]];
  access: FeatureAccessLevelDto;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon icon="edit-square" className="size-6 shrink-0" aria-label={t('settings:users.update_user')} />
      </Modal.Trigger>
      <Modal.Content>
        <UpdateUserContent user={user} userRoles={userRoles} access={access} onSuccess={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}

function UpdateUserContent({
  user,
  userRoles,
  access,
  onSuccess,
}: {
  user: User;
  userRoles: readonly [string, ...string[]];
  access: FeatureAccessLevelDto;
  onSuccess: () => void;
}) {
  const { t } = useTranslation(['common', 'settings'] satisfies Namespace);
  const updateUserMutation = useUpdateUserMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: user as UpdateUserPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateUserMutation.mutateAsync(value).then((res) => {
          if (res.success) {
            onSuccess();
          }
          revalidate();
        });
      }
    },
    validators: {
      onSubmit: updateUserPayloadSchema,
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
      <Modal.Title>{t('settings:users.update_user')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex gap-2">
            <form.Field name="firstName" validators={{ onChange: updateUserPayloadSchema.shape.firstName }}>
              {(field) => (
                <div className="group flex w-full flex-col gap-2">
                  <FormLabel name={field.name}>{t('settings:users.first_name')}</FormLabel>
                  <FormInput
                    type="text"
                    name={field.name}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    defaultValue={field.state.value}
                    valid={field.state.meta.errors.length === 0}
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
            <form.Field name="lastName" validators={{ onChange: updateUserPayloadSchema.shape.lastName }}>
              {(field) => (
                <div className="group flex w-full flex-col gap-2">
                  <FormLabel name={field.name}>{t('settings:users.last_name')}</FormLabel>
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
          </div>
          <form.Field name="email" validators={{ onChange: updateUserPayloadSchema.shape.email }}>
            {(field) => (
              <div className="group flex flex-col gap-2">
                <FormLabel name={field.name}>{t('settings:users.email')}</FormLabel>
                <FormInput
                  type="email"
                  name={field.name}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  defaultValue={field.state.value}
                  valid={field.state.meta.errors.length === 0}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
          <form.Field name="role" validators={{ onChange: updateUserPayloadSchema.shape.role }}>
            {(field) => (
              <div className="group flex flex-col gap-2">
                <FormLabel name={field.name} className="flex flex-row gap-2">
                  <span
                    className={clsx({
                      'text-grey-80': access === 'restricted',
                    })}
                  >
                    {t('settings:users.role')}
                  </span>
                  {access === 'allowed' ? null : (
                    <Nudge content={t('settings:users.role.nudge')} className="size-6" kind={access} />
                  )}
                </FormLabel>
                <Select.Default
                  defaultValue={field.state.value}
                  onValueChange={(value) => field.handleChange(value as UpdateUserPayload['role'])}
                  disabled={!isAccessible(access)}
                  name={field.name}
                >
                  {userRoles.map((role) => (
                    <Select.DefaultItem key={role} value={role}>
                      {t(tKeyForUserRole(role))}
                    </Select.DefaultItem>
                  ))}
                </Select.Default>
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
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
