import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
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
import { useForm } from '@tanstack/react-form';
import { useRouterState } from '@tanstack/react-router';
import clsx from 'clsx';
import { Namespace } from 'i18next';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal, SelectV2 } from 'ui-design-system';
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
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setOpen(false);
    }
  }, [isLoading]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button onClick={(e) => e.stopPropagation()}>
          <Icon icon="plus" className="size-5" />
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
        createUserMutation
          .mutateAsync(value)
          .then((res) => {
            if (res && 'error' in res) {
              toast.error(t('common:errors.list.duplicate_email'));
              return;
            }
            onSuccess();
            revalidate();
          })
          .catch(() => {
            toast.error(t('common:errors.unknown'));
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
      <div className="flex flex-col gap-lg p-lg">
        <div className="flex flex-1 flex-col gap-md">
          <div className="flex gap-sm">
            <form.Field
              name="firstName"
              validators={{
                onBlur: createUserPayloadSchema.shape.firstName,
                onChange: createUserPayloadSchema.shape.firstName,
              }}
            >
              {(field) => (
                <div className="flex w-full flex-col gap-xs">
                  <label htmlFor={field.name} className="text-s text-grey-secondary">
                    {t('settings:users.first_name')}
                  </label>
                  <Input
                    id={field.name}
                    type="text"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
            <form.Field name="lastName" validators={{ onChange: createUserPayloadSchema.shape.lastName }}>
              {(field) => (
                <div className="flex w-full flex-col gap-xs">
                  <label htmlFor={field.name} className="text-s text-grey-secondary">
                    {t('settings:users.last_name')}
                  </label>
                  <Input
                    id={field.name}
                    type="text"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="email" validators={{ onChange: createUserPayloadSchema.shape.email }}>
            {(field) => (
              <div className="flex flex-col gap-xs">
                <label htmlFor={field.name} className="text-s text-grey-secondary">
                  {t('settings:users.email')}
                </label>
                <Input
                  id={field.name}
                  type="email"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
          <form.Field name="role" validators={{ onChange: createUserPayloadSchema.shape.role }}>
            {(field) => (
              <div className="flex flex-col gap-xs">
                <label htmlFor={field.name} className="text-s text-grey-secondary flex flex-row gap-sm">
                  <span
                    className={clsx({
                      'text-grey-disabled': access === 'restricted',
                    })}
                  >
                    {t('settings:users.role')}
                  </span>
                  {access === 'allowed' ? null : (
                    <Nudge content={t('settings:users.role.nudge')} className="size-6" kind={access} />
                  )}
                </label>
                <SelectV2
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value as CreateUserPayload['role'])}
                  disabled={!isAccessible(access)}
                  placeholder={t('settings:users.role')}
                  options={userRoles.map((role) => ({
                    label: t(tKeyForUserRole(role)),
                    value: role as CreateUserPayload['role'],
                  }))}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
        </div>
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('settings:users.new_user.create')}
          type="submit"
          name="create"
          isLoading={createUserMutation.isPending}
        />
      </Modal.Footer>
    </form>
  );
}
