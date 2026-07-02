import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  type CreateRolePayload,
  createRolePayloadSchema,
  useCreateRoleMutation,
} from '@app-builder/queries/settings/roles/create-role';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateRole() {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button onClick={(e) => e.stopPropagation()}>
          <Icon icon="plus" className="size-5" />
          {t('settings:roles.new_role')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateRoleContent onSuccess={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}

function CreateRoleContent({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation(['common', 'settings'] satisfies Namespace);
  const createRoleMutation = useCreateRoleMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: { name: '' } as CreateRolePayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createRoleMutation
          .mutateAsync(value)
          .then(() => {
            toast.success(t('common:success.save'));
            onSuccess();
            revalidate();
          })
          .catch(() => {
            toast.error(t('common:errors.unknown'));
          });
      }
    },
    validators: {
      onSubmit: createRolePayloadSchema,
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
      <Modal.Title>{t('settings:roles.new_role')}</Modal.Title>
      <div className="flex flex-col gap-lg p-lg">
        <form.Field name="name" validators={{ onChange: createRolePayloadSchema.shape.name }}>
          {(field) => (
            <div className="flex flex-col gap-xs">
              <label htmlFor={field.name} className="text-s text-grey-secondary">
                {t('settings:roles.name')}
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
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('settings:roles.new_role.create')}
          type="submit"
          name="create"
          isLoading={createRoleMutation.isPending}
        />
      </Modal.Footer>
    </form>
  );
}
