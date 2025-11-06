import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Nudge } from '@app-builder/components/Nudge';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { tKeyForUserRole } from '@app-builder/models';
import {
  CreateUserPayload,
  createUserPayloadSchema,
  useCreateUserMutation,
} from '@app-builder/queries/settings/users/create-user';
import { isAccessible } from '@app-builder/services/feature-access';
import { getFieldErrors } from '@app-builder/utils/form';
import { useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { Namespace } from 'i18next';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateUser({
  orgId,
  userRoles,
  access,
}: {
  orgId: string;
  access: FeatureAccessLevelDto;
  userRoles: readonly [string, ...string[]];
}) {
  const { t } = useTranslation(['common', 'settings']);
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button onClick={(e) => e.stopPropagation()}>
          <Icon icon="plus" className="size-6" />
          {t('settings:users.new_user')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateUserContent orgId={orgId} access={access} userRoles={userRoles} onSuccess={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}

function CreateUserContent({
  orgId,
  userRoles,
  access,
  onSuccess,
}: {
  orgId: string;
  userRoles: readonly [string, ...string[]];
  access: FeatureAccessLevelDto;
  onSuccess: () => void;
}) {
  const { t } = useTranslation(['common', 'settings'] satisfies Namespace);
  const createUserMutation = useCreateUserMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'ADMIN',
      organizationId: orgId,
    } as CreateUserPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createUserMutation.mutateAsync(value).then((res) => {
          if (res.success) {
            onSuccess();
          }
          revalidate();
        });
      }
    },
    validators: {
      onSubmit: createUserPayloadSchema,
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
      <Modal.Title>{t('settings:users.new_user')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex gap-2">
            <form.Field
              name="firstName"
              validators={{
                onBlur: createUserPayloadSchema.shape.firstName,
                onChange: createUserPayloadSchema.shape.firstName,
              }}
            >
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
            <form.Field name="lastName" validators={{ onChange: createUserPayloadSchema.shape.lastName }}>
              {(field) => (
                <div className="group flex w-full flex-col gap-2">
                  <FormLabel name={field.name}>{t('settings:users.last_name')}</FormLabel>
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
          </div>
          <form.Field name="email" validators={{ onChange: createUserPayloadSchema.shape.email }}>
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
          <form.Field name="role" validators={{ onChange: createUserPayloadSchema.shape.role }}>
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
                  onValueChange={(value) => field.handleChange(value as CreateUserPayload['role'])}
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
            <Button type="button" className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit" name="create">
            {t('settings:users.new_user.create')}
          </Button>
        </div>
      </div>
    </form>
  );
}
