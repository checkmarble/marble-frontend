import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useAddListValueMutation } from '@app-builder/queries/lists/add-value';
import { AddValuePayload, addValuePayloadSchema } from '@app-builder/schemas/lists';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2 as Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function AddListValueModal({ listId }: { listId: string }) {
  const { t } = useTranslation(['lists', 'navigation', 'common']);
  const addListValueMutation = useAddListValueMutation();
  const revalidate = useLoaderRevalidator();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      listId,
      value: '',
    } as AddValuePayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        addListValueMutation.mutateAsync(value).then((result) => {
          revalidate();
          if (result.success) {
            setIsOpen(false);
            form.reset();
          }
        });
      }
    },
    validators: {
      onSubmitAsync: addValuePayloadSchema,
    },
  });

  return (
    <Modal.Root open={isOpen} setOpen={setIsOpen}>
      <Modal.Trigger render={<Button />}>
        <Icon icon="plus" className="size-6" />
        {t('lists:create_value.title')}
      </Modal.Trigger>
      <Modal.Content>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Modal.Title>{t('lists:create_value.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <form.Field
              name="value"
              validators={{
                onBlur: addValuePayloadSchema.shape.value,
                onChange: addValuePayloadSchema.shape.value,
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-2">
                  <FormLabel name={field.name}>
                    {t('lists:detail.value.create.form.label')}
                  </FormLabel>
                  <FormInput
                    type="text"
                    name={field.name}
                    defaultValue={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    valid={field.state.meta.errors.length === 0}
                    placeholder={t('lists:create_value.value_placeholder')}
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close
                render={
                  <Button
                    className="flex-1"
                    type="button"
                    variant="secondary"
                    key="cancel"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOpen(false);
                    }}
                  />
                }
              >
                {t('common:cancel')}
              </Modal.Close>
              <Button className="flex-1" variant="primary" type="submit" key="create">
                {t('common:save')}
              </Button>
            </div>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
