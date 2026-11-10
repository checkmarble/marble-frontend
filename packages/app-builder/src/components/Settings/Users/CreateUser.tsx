import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { type UserRoleOption, UserRoleSelector } from '@app-builder/components/Settings/Users/UserRoleSelector';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  CreateUserPayload,
  createUserPayloadSchema,
  useCreateUserMutation,
} from '@app-builder/queries/settings/users/create-user';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useRouterState } from '@tanstack/react-router';
import { Namespace } from 'i18next';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useEffect, useId, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input, Panel } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateUser({
  orgId,
  userRoles,
  access,
}: {
  orgId: string;
  access: FeatureAccessLevelDto;
  userRoles: readonly UserRoleOption[];
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
    <Panel.Root open={open} onOpenChange={setOpen}>
      <Panel.Trigger asChild>
        <Button appearance="stroked" variant="primary" onClick={(e) => e.stopPropagation()}>
          <Icon icon="plus" className="size-5" />
          {t('settings:users.new_user')}
        </Button>
      </Panel.Trigger>
      <Panel.Container size="medium">
        <CreateUserContent orgId={orgId} access={access} userRoles={userRoles} onSuccess={() => setOpen(false)} />
      </Panel.Container>
    </Panel.Root>
  );
}

function CreateUserContent({
  orgId,
  userRoles,
  access,
  onSuccess,
}: {
  orgId: string;
  userRoles: readonly UserRoleOption[];
  access: FeatureAccessLevelDto;
  onSuccess: () => void;
}) {
  const { t } = useTranslation(['common', 'settings'] satisfies Namespace);
  const createUserMutation = useCreateUserMutation();
  const revalidate = useLoaderRevalidator();
  const formId = useId();

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      roles: [{ role: 'ADMIN' }],
      organizationId: orgId,
    } as CreateUserPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createUserMutation
          .mutateAsync(value)
          .then((res) => {
            if (res && 'error' in res) {
              toast.error(t('settings:users.new_user.duplicate_email'));
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
    <Panel.Content>
      <Panel.Header>{t('settings:users.new_user')}</Panel.Header>
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-lg py-lg">
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
            <form.Field name="roles" validators={{ onChange: createUserPayloadSchema.shape.roles }}>
              {(field) => (
                <div className="flex flex-col gap-xs">
                  <UserRoleSelector
                    roles={field.state.value}
                    onChange={field.handleChange}
                    access={access}
                    options={userRoles}
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>
        </div>
      </form>
      <Panel.Footer>
        <Panel.FooterButton isCloseButton label={t('common:cancel')} />
        <Panel.FooterButton
          label={t('settings:users.new_user.create')}
          type="submit"
          form={formId}
          name="create"
          isLoading={createUserMutation.isPending}
        />
      </Panel.Footer>
    </Panel.Content>
  );
}
