import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type TableModel } from '@app-builder/models';
import {
  type EditTablePayload,
  editTablePayloadSchema,
  useEditTableMutation,
} from '@app-builder/queries/data/edit-table';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';

export function EditTable({ table, children }: { table: TableModel; children: React.ReactNode }) {
  const { t } = useTranslation(['data', 'navigation', 'common']);
  const editTableMutation = useEditTableMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      description: table.description,
      tableId: table.id,
    } as EditTablePayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        editTableMutation.mutateAsync(value).then((result) => {
          revalidate();
        });
      }
    },
    validators: {
      onSubmitAsync: editTablePayloadSchema,
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Modal.Title>{t('data:edit_table.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col gap-4">
              <form.Field
                name="description"
                validators={{
                  onBlur: editTablePayloadSchema.shape.description,
                  onChange: editTablePayloadSchema.shape.description,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel name={field.name}>{t('data:description')}</FormLabel>
                    <FormInput
                      type="text"
                      name={field.name}
                      defaultValue={field.state.value as string}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      valid={field.state.meta.errors.length === 0}
                      placeholder={t('data:create_table.description_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
            </div>
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close asChild>
                <Button className="flex-1" variant="secondary">
                  {t('common:cancel')}
                </Button>
              </Modal.Close>
              <Button className="flex-1" variant="primary" type="submit" name="edit">
                {t('data:edit_table.button_accept')}
              </Button>
            </div>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
