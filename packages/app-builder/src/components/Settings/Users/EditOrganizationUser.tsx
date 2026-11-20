import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type User } from '@app-builder/models';
import {
  type EditOrganizationUserForm,
  editOrganizationUserFormSchema,
  useUpdateOrganizationUserMutation,
} from '@app-builder/queries/settings/users/update-organization-user';
import { organizationGrantRoleSchema } from '@app-builder/schemas/settings';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Input, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { UserRoleField } from './UserRoleField';
import { type UserRoleOption } from './UserRoleSelector';

interface EditOrganizationUserProps {
  user: User;
  userRoles: readonly UserRoleOption[];
  access: FeatureAccessLevelDto;
  roleLabel?: string;
}

// Edits the name of a user of the organization and the role they hold on it.
export function EditOrganizationUser({ user, userRoles, access, roleLabel }: EditOrganizationUserProps) {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon icon="edit-square" className="size-6 shrink-0" aria-label={t('settings:users.edit_user')} />
      </Modal.Trigger>
      <Modal.Content>
        <EditOrganizationUserContent
          user={user}
          userRoles={userRoles}
          access={access}
          roleLabel={roleLabel}
          onSuccess={() => setOpen(false)}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

function EditOrganizationUserContent({
  user,
  userRoles,
  access,
  roleLabel,
  onSuccess,
}: EditOrganizationUserProps & { onSuccess: () => void }) {
  const { t } = useTranslation(['common', 'settings']);
  const updateUserMutation = useUpdateOrganizationUserMutation();
  const revalidate = useLoaderRevalidator();
  const currentRole = user.roles[0]?.role ?? '';
  const canChangeRole =
    user.roles.length === 1 &&
    (organizationGrantRoleSchema.safeParse(currentRole).success ||
      userRoles.some(({ value }) => value === currentRole));
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
      role: currentRole,
    } as EditOrganizationUserForm,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      const firstNameChanged = value.firstName.trim() !== user.firstName.trim();
      const lastNameChanged = value.lastName.trim() !== user.lastName.trim();
      const roleChanged = canChangeRole && value.role !== currentRole;
      if (!firstNameChanged && !lastNameChanged && !roleChanged) {
        onSuccess();
        return;
      }

      return updateUserMutation
        .mutateAsync({
          userId: user.userId,
          ...(firstNameChanged && { firstName: value.firstName }),
          ...(lastNameChanged && { lastName: value.lastName }),
          ...(roleChanged && { roles: [{ role: value.role }] }),
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Modal.Title>{t('settings:users.edit_user.title')}</Modal.Title>
      <div className="flex flex-col gap-md p-lg">
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
        <form.Field name="role">
          {(field) => (
            <UserRoleField
              value={field.state.value}
              onChange={field.handleChange}
              userRoles={userRoles}
              access={access}
              disabled={!canChangeRole}
              selectedLabel={roleLabel}
            />
          )}
        </form.Field>
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <form.Subscribe selector={(state) => [state.canSubmit, state.isDirty] as const}>
          {([canSubmit, isDirty]) => (
            <Modal.FooterButton
              label={t('common:save')}
              type="submit"
              disabled={!canSubmit || !isDirty || updateUserMutation.isPending}
              isLoading={updateUserMutation.isPending}
            />
          )}
        </form.Subscribe>
      </Modal.Footer>
    </form>
  );
}
