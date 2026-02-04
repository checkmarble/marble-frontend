import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useEditListMutation } from '@app-builder/queries/lists/edit-list';
import { EditListPayload, editListPayloadSchema } from '@app-builder/schemas/lists';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function EditListModal({ listId, name, description }: { listId: string; name: string; description: string }) {
  const { t } = useTranslation(['lists', 'navigation', 'common']);
  const editListMutation = useEditListMutation();
  const revalidate = useLoaderRevalidator();
  const [open, setOpen] = useState(false);

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
          setOpen(false);
        });
      }
    },
    validators: {
      onSubmitAsync: editListPayloadSchema,
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <ButtonV2 variant="secondary" appearance="stroked">
          <Icon icon="edit-square" className="size-5" />
          <p>{t('lists:edit_list.button')}</p>
        </ButtonV2>
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
          </div>
          <Modal.Footer>
            <Modal.Close asChild>
              <ButtonV2 type="button" variant="secondary" appearance="stroked">
                {t('common:cancel')}
              </ButtonV2>
            </Modal.Close>
            <ButtonV2 variant="primary" type="submit" name="editList">
              {t('common:save')}
            </ButtonV2>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
