import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useEditListMutation } from '@app-builder/queries/lists/edit-list';
import { EditListPayload, editListPayloadSchema } from '@app-builder/schemas/lists';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function EditListModal({ listId, name, description }: { listId: string; name: string; description: string }) {
  const { t } = useTranslation(['lists', 'navigation', 'common']);
  const editListMutation = useEditListMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      listId,
      name,
      description,
    } as EditListPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        editListMutation.mutateAsync(value).then(() => {
          revalidate();
        });
      }
    },
    validators: {
      onSubmitAsync: editListPayloadSchema,
    },
  });

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button variant="secondary">
          <Icon icon="edit-square" className="size-6" />
          <p>{t('lists:edit_list.button')}</p>
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Modal.Title>{t('lists:edit_list.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col gap-4">
              <form.Field
                name="name"
                validators={{
                  onChange: editListPayloadSchema.shape.name,
                  onBlur: editListPayloadSchema.shape.name,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel name={field.name}>{t('lists:name')}</FormLabel>
                    <FormInput
                      type="text"
                      name={field.name}
                      defaultValue={field.state.value}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      valid={field.state.meta.errors.length === 0}
                      placeholder={t('lists:create_list.name_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
              <form.Field
                name="description"
                validators={{
                  onChange: editListPayloadSchema.shape.description,
                  onBlur: editListPayloadSchema.shape.description,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel name={field.name}>{t('lists:description')}</FormLabel>
                    <FormInput
                      type="text"
                      name={field.name}
                      defaultValue={field.state.value}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      valid={field.state.meta.errors.length === 0}
                      placeholder={t('lists:create_list.description_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
            </div>
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close asChild>
                <Button className="flex-1" type="button" variant="secondary">
                  {t('common:cancel')}
                </Button>
              </Modal.Close>
              <Button className="flex-1" variant="primary" type="submit" name="editList">
                {t('common:save')}
              </Button>
            </div>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
