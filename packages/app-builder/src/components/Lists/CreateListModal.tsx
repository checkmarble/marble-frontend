import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useCreateListMutation } from '@app-builder/queries/lists/create-list';
import { CreateListPayload, createListPayloadSchema } from '@app-builder/schemas/lists';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateListModal() {
  const { t } = useTranslation(['lists', 'navigation', 'common']);
  const createListMutation = useCreateListMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    } as CreateListPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createListMutation.mutateAsync(value).then(() => {
          revalidate();
        });
      }
    },
    validators: {
      onSubmitAsync: createListPayloadSchema,
    },
  });

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <ButtonV2>
          <Icon icon="plus" className="size-5" />
          {t('lists:create_list.title')}
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
          <Modal.Title>{t('lists:create_list.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col gap-4">
              <form.Field
                name="name"
                validators={{
                  onBlur: createListPayloadSchema.shape.name,
                  onChange: createListPayloadSchema.shape.name,
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
                  onBlur: createListPayloadSchema.shape.description,
                  onChange: createListPayloadSchema.shape.description,
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
            <ButtonV2 variant="primary" type="submit" name="create">
              {t('lists:create_list.button_accept')}
            </ButtonV2>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
