import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type User } from '@app-builder/models';
import {
  type EditOrganizationUserForm,
  editOrganizationUserFormSchema,
  useUpdateOrganizationUserMutation,
} from '@app-builder/queries/settings/users/update-organization-user';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useId, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { isDeepEqual } from 'remeda';
import { Input, Panel } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { type UserRoleOption, UserRoleSelector } from './UserRoleSelector';

interface EditOrganizationUserProps {
  user: User;
  userRoles: readonly UserRoleOption[];
  access: FeatureAccessLevelDto;
  roleLabels?: ReadonlyMap<string, string>;
}

// Edits the name of a user of the organization and the role they hold on it.
export function EditOrganizationUser({ user, userRoles, access, roleLabels }: EditOrganizationUserProps) {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);

  return (
    <Panel.Root open={open} onOpenChange={setOpen}>
      <Panel.Trigger>
        <Icon icon="edit-square" className="size-6 shrink-0" aria-label={t('settings:users.edit_user')} />
      </Panel.Trigger>
      <Panel.Container size="medium">
        <EditOrganizationUserContent
          user={user}
          userRoles={userRoles}
          access={access}
          roleLabels={roleLabels}
          onSuccess={() => setOpen(false)}
        />
      </Panel.Container>
    </Panel.Root>
  );
}

function EditOrganizationUserContent({
  user,
  userRoles,
  access,
  roleLabels,
  onSuccess,
}: EditOrganizationUserProps & { onSuccess: () => void }) {
  const { t } = useTranslation(['common', 'settings']);
  const updateUserMutation = useUpdateOrganizationUserMutation();
  const revalidate = useLoaderRevalidator();
  const formId = useId();
  // A name that was already blank may stay blank: changing it requires the user's home organization.
  const formSchema = useMemo(
    () =>
      editOrganizationUserFormSchema.extend({
        firstName: z
          .string()
          .trim()
          .min(user.firstName.trim() ? 1 : 0),
        lastName: z
          .string()
          .trim()
          .min(user.lastName.trim() ? 1 : 0),
      }),
    [user.firstName, user.lastName],
  );

  const form = useForm({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
    } as EditOrganizationUserForm,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      const firstNameChanged = value.firstName.trim() !== user.firstName.trim();
      const lastNameChanged = value.lastName.trim() !== user.lastName.trim();
      const roleChanged = !isDeepEqual(value.roles, user.roles);
      if (!firstNameChanged && !lastNameChanged && !roleChanged) {
        onSuccess();
        return;
      }

      return updateUserMutation
        .mutateAsync({
          userId: user.userId,
          ...(firstNameChanged && { firstName: value.firstName }),
          ...(lastNameChanged && { lastName: value.lastName }),
          ...(roleChanged && { roles: value.roles }),
        })
        .then((result) => {
          if (result?.error === 'name_forbidden') {
            toast.error(t('settings:users.edit_user.name_forbidden'));
            return;
          }
          toast.success(t('common:success.save'));
          onSuccess();
          revalidate();
        })
        .catch(() => {
          toast.error(t('common:errors.unknown'));
          // The name may have been saved before the role update failed
          revalidate();
        });
    },
  });

  return (
    <Panel.Content>
      <Panel.Header>{t('settings:users.edit_user.title')}</Panel.Header>
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-md py-lg">
          <div className="flex gap-sm">
            <form.Field name="firstName" validators={{ onChange: formSchema.shape.firstName }}>
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
            <form.Field name="lastName" validators={{ onChange: formSchema.shape.lastName }}>
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
          <form.Field name="roles">
            {(field) => (
              <UserRoleSelector
                roles={field.state.value}
                onChange={field.handleChange}
                options={userRoles}
                access={access}
                roleLabels={roleLabels}
              />
            )}
          </form.Field>
        </div>
      </form>
      <Panel.Footer>
        <Panel.FooterButton isCloseButton label={t('common:cancel')} />
        <form.Subscribe selector={(state) => [state.canSubmit, state.isDirty] as const}>
          {([canSubmit, isDirty]) => (
            <Panel.FooterButton
              label={t('common:save')}
              type="submit"
              form={formId}
              disabled={!canSubmit || !isDirty || updateUserMutation.isPending}
              isLoading={updateUserMutation.isPending}
            />
          )}
        </form.Subscribe>
      </Panel.Footer>
    </Panel.Content>
  );
}
