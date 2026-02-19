import { FormError } from '@app-builder/components/Form/Tanstack/FormError';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type CustomListKind } from '@app-builder/models/custom-list';
import { useAddListValueMutation } from '@app-builder/queries/lists/add-value';
import { type AddValuePayload, addCidrValuePayloadSchema, addValuePayloadSchema } from '@app-builder/schemas/lists';
import { useForm } from '@tanstack/react-form';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function AddListValueModal({ listId, kind }: { listId: string; kind: CustomListKind }) {
  const { t } = useTranslation(['lists', 'navigation', 'common']);
  const addListValueMutation = useAddListValueMutation();
  const revalidate = useLoaderRevalidator();
  const [isOpen, setIsOpen] = useState(false);

  const validationSchema = useMemo(
    () => (kind === 'cidrs' ? addCidrValuePayloadSchema : addValuePayloadSchema),
    [kind],
  );

  const form = useForm({
    defaultValues: {
      listId,
      value: '',
      kind,
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
      onSubmitAsync: validationSchema,
    },
  });

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>
        <Button>
          <Icon icon="plus" className="size-5" />
          {t('lists:create_value.title')}
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
          <Modal.Title>{t('lists:create_value.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <form.Field name="value">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <FormLabel name={field.name}>{t('lists:detail.value.create.form.label')}</FormLabel>
                  <FormInput
                    type="text"
                    name={field.name}
                    defaultValue={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    valid={field.state.meta.errors.length === 0}
                    placeholder={
                      kind === 'cidrs'
                        ? t('lists:create_value.cidr_placeholder')
                        : t('lists:create_value.value_placeholder')
                    }
                  />
                  <FormError
                    field={field}
                    asString
                    translations={{
                      invalid_union: t('lists:create_value.cidr_error'),
                    }}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button
                type="button"
                variant="secondary"
                appearance="stroked"
                key="cancel"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                }}
              >
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button variant="primary" type="submit" key="create">
              {t('common:save')}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
