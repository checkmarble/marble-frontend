import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type DataModel, type LinkToSingle } from '@app-builder/models';
import {
  createNavigationOptionSchema,
  useCreateNavigationOptionMutation,
} from '@app-builder/queries/data/create-navigation-option';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useCallbackRef } from '@marble/shared';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type CreateNavigationOptionModalProps = {
  label: string;
  dataModel: DataModel;
  link: LinkToSingle;
};

export function CreateNavigationOptionModal({ label, dataModel, link }: CreateNavigationOptionModalProps) {
  const { t } = useTranslation(['common', 'data']);
  const targetTable = dataModel.find((table) => {
    return table.name === link.childTableName;
  });
  const [open, setOpen] = useState(false);
  const createNavigationOptionMutation = useCreateNavigationOptionMutation(link.parentTableId);
  const revalidate = useLoaderRevalidator();

  const handleOpenChange = useCallbackRef((open: boolean) => {
    if (!open) {
      form.resetField('orderingFieldId');
      setOpen(false);
    }
  });

  const form = useForm({
    defaultValues: {
      sourceFieldId: link.parentFieldId,
      targetTableId: link.childTableId,
      filterFieldId: link.childFieldId,
      orderingFieldId: '',
    },
    validators: {
      onChange: createNavigationOptionSchema,
    },
    onSubmit({ value, formApi }) {
      if (formApi.state.isValid) {
        createNavigationOptionMutation.mutateAsync(value).then(() => {
          revalidate();
        });
      }
    },
  });

  if (!targetTable) {
    return null;
  }

  return (
    <Modal.Root onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button size="small" variant="secondary">
          {label}
          <Icon icon="plus" className="size-4" />
        </Button>
      </Modal.Trigger>
      <Modal.Content size="medium">
        <Modal.Title>{t('data:create_navigation_option.title')}</Modal.Title>
        <form
          id={`create_navigation_option_form_${link.parentTableId}_${link.childTableId}`}
          className="grid grid-cols-[auto_1fr] items-center gap-2 p-8"
          onSubmit={handleSubmit(form)}
        >
          <span>{t('data:create_navigation_option.labels.from')}</span>
          <div>
            <MenuCommand.SelectButton disabled noArrow>
              {link.parentTableName}
            </MenuCommand.SelectButton>
          </div>
          <span>{t('data:create_navigation_option.labels.to')}</span>
          <div>
            <MenuCommand.SelectButton disabled noArrow>
              {link.childTableName}
            </MenuCommand.SelectButton>
          </div>
          <span className="h-10 place-self-start leading-10">
            {t('data:create_navigation_option.labels.ordered_by')}
          </span>
          <div>
            <form.Field
              name="orderingFieldId"
              validators={{
                onChange: createNavigationOptionSchema.shape.orderingFieldId,
                onBlur: createNavigationOptionSchema.shape.orderingFieldId,
              }}
            >
              {(formField) => {
                const selectedField = targetTable.fields.find((tableField) => tableField.id === formField.state.value);
                const fieldErrors = formField.state.meta.errors;
                const targetFields = targetTable.fields.filter((tableField) => tableField.id !== link.childFieldId);

                return (
                  <>
                    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
                      <MenuCommand.Trigger>
                        <MenuCommand.SelectButton
                          className="inline-flex min-w-[264px]"
                          hasError={fieldErrors.length > 0}
                        >
                          {selectedField
                            ? selectedField.name
                            : t('data:create_navigation_option.placeholders.ordered_by')}
                        </MenuCommand.SelectButton>
                      </MenuCommand.Trigger>
                      <MenuCommand.Content align="start" sameWidth sideOffset={4}>
                        <MenuCommand.List>
                          {targetFields.map((field) => (
                            <MenuCommand.Item key={field.id} value={field.id} onSelect={formField.handleChange}>
                              {field.name}
                              {selectedField?.name === field.name ? (
                                <Icon icon="tick" className="text-purple-65 size-6" />
                              ) : null}
                            </MenuCommand.Item>
                          ))}
                        </MenuCommand.List>
                      </MenuCommand.Content>
                    </MenuCommand.Menu>
                    <FormErrorOrDescription errors={getFieldErrors(fieldErrors)} />
                  </>
                );
              }}
            </form.Field>
          </div>
          <div className="col-span-full mt-4">{t('data:create_navigation_option.explanation_text')}</div>
        </form>
        <Modal.Footer>
          <div className="flex flex-1 flex-row gap-2 p-4">
            <Modal.Close asChild>
              <Button variant="secondary" className="flex-1">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button
              type="submit"
              form={`create_navigation_option_form_${link.parentTableId}_${link.childTableId}`}
              variant="primary"
              className="flex-1"
            >
              {t('common:save')}
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
