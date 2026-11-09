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
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Input, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { UserRoleField } from './UserRoleField';

interface EditOrganizationUserProps {
  user: User;
  userRoles: readonly [string, ...string[]];
  access: FeatureAccessLevelDto;
}

// Edits the name of a user of the organization and the role they hold on it.
export function EditOrganizationUser({ user, userRoles, access }: EditOrganizationUserProps) {
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
  onSuccess,
}: EditOrganizationUserProps & { onSuccess: () => void }) {
  const { t } = useTranslation(['common', 'settings']);
  const updateUserMutation = useUpdateOrganizationUserMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    } as EditOrganizationUserForm,
    validators: {
      onSubmit: editOrganizationUserFormSchema,
    },
    onSubmit: ({ value }) => {
      const nameChanged = value.firstName !== user.firstName || value.lastName !== user.lastName;
      const roleChanged = value.role !== user.role;
      if (!nameChanged && !roleChanged) {
        onSuccess();
        return;
      }

      return updateUserMutation
        .mutateAsync({
          userId: user.userId,
          ...(nameChanged && { firstName: value.firstName, lastName: value.lastName }),
          ...(roleChanged && { role: value.role }),
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
          <form.Field name="firstName" validators={{ onChange: editOrganizationUserFormSchema.shape.firstName }}>
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
          <form.Field name="lastName" validators={{ onChange: editOrganizationUserFormSchema.shape.lastName }}>
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
