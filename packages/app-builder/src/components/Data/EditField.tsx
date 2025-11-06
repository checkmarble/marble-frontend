import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type DataModelField, EnumDataTypes, type LinkToSingle, UniqueDataTypes } from '@app-builder/models';
import {
  type EditFieldPayload,
  editFieldPayloadSchema,
  useEditFieldMutation,
} from '@app-builder/queries/data/edit-field';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Modal, Select } from 'ui-design-system';

const REQUIRED_OPTIONS = [
  { value: 'optional', display: 'data:create_field.option_optional' },
  { value: 'required', display: 'data:create_field.option_required' },
] as const;

function disableEditUnique({
  field,
  linksToThisTable,
  selectedEnum,
}: {
  field: DataModelField;
  linksToThisTable: LinkToSingle[];
  selectedEnum: boolean;
}) {
  if (field.unicityConstraint !== 'no_unicity_constraint' && field.name === 'object_id') {
    return {
      disabled: true,
      reason: 'object_id_must_be_unique',
    };
  }
  if (selectedEnum) {
    return {
      disabled: true,
      reason: 'cannot_toggle_enum_enabled',
    };
  }
  if (field.unicityConstraint === 'pending_unique_constraint') {
    return {
      disabled: true,
      reason: 'cannot_toggle_index_pending',
    };
  }
  const linksToThisField = linksToThisTable.filter((link) => link.parentFieldName === field.name);
  if (field.unicityConstraint !== 'no_unicity_constraint' && linksToThisField.length > 0) {
    return {
      disabled: true,
      reason: 'cannot_untoggle_field_linked',
    };
  }

  return {
    disabled: false,
    reason: null,
  };
}

export function EditField({
  field: inputField,
  linksToThisTable,
  children,
}: {
  field: DataModelField;
  linksToThisTable: LinkToSingle[];
  children: React.ReactNode;
}) {
  const { t } = useTranslation(['data', 'navigation', 'common']);
  const editFieldMutation = useEditFieldMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      description: inputField.description,
      fieldId: inputField.id,
      isEnum: inputField.isEnum,
      isUnique: inputField.unicityConstraint !== 'no_unicity_constraint',
      required: inputField.nullable ? 'optional' : 'required',
    } as EditFieldPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        editFieldMutation.mutateAsync(value).then(() => {
          revalidate();
        });
      }
    },
    validators: {
      onChangeAsync: editFieldPayloadSchema,
      onBlurAsync: editFieldPayloadSchema,
      onSubmitAsync: editFieldPayloadSchema,
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  const selectedEnum = useStore(form.store, (state) => state.values.isEnum);
  const selectedUnique = useStore(form.store, (state) => state.values.isUnique);
  const uniqueSettingDisabled = useMemo(
    () =>
      disableEditUnique({
        field: inputField,
        linksToThisTable,
        selectedEnum,
      }),
    [inputField, linksToThisTable, selectedEnum],
  );

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
          <Modal.Title>{t('data:edit_field.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col gap-4">
              <form.Field name="description">
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
                      placeholder={t('data:create_field.description_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
              <form.Field
                name="required"
                validators={{
                  onChange: editFieldPayloadSchema.shape.required,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel name={field.name}>{t('data:create_field.option_required')}</FormLabel>
                    <Select.Default
                      className="w-full overflow-hidden"
                      defaultValue={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value as 'optional' | 'required');
                      }}
                    >
                      {REQUIRED_OPTIONS.map(({ value, display }) => {
                        return (
                          <Select.DefaultItem key={value} value={value}>
                            {t(display)}
                          </Select.DefaultItem>
                        );
                      })}
                    </Select.Default>
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
            </div>
            {EnumDataTypes.includes(inputField.dataType) ? (
              <form.Field name="isEnum">
                {(field) => (
                  <div className="flex flex-row items-center gap-4">
                    <Checkbox
                      name={field.name}
                      defaultChecked={field.state.value}
                      disabled={selectedUnique}
                      onCheckedChange={(checked) => {
                        if (checked !== 'indeterminate') field.handleChange(checked);
                      }}
                    />
                    <FormLabel name={field.name}>
                      <p>{t('data:create_field.is_enum.title')}</p>
                      <p className="text-xs">{t('data:create_field.is_enum.subtitle')}</p>
                    </FormLabel>
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
            ) : null}
            {UniqueDataTypes.includes(inputField.dataType) ? (
              <form.Field name="isUnique">
                {(field) => (
                  <div className="flex flex-row items-center gap-4">
                    <Checkbox
                      name={field.name}
                      defaultChecked={field.state.value}
                      disabled={uniqueSettingDisabled.disabled}
                      onCheckedChange={(checked) => {
                        if (checked !== 'indeterminate') field.handleChange(checked);
                      }}
                    />
                    <FormLabel name={field.name}>
                      <p>{t('data:edit_field.is_unique.title')}</p>
                      {inputField.unicityConstraint === 'no_unicity_constraint' ? (
                        <p className="text-xs">{t('data:edit_field.is_unique.toggle')}</p>
                      ) : null}
                      {uniqueSettingDisabled.reason === 'cannot_toggle_index_pending' ? (
                        <p className="text-red-74 text-xs">
                          {t('data:edit_field.is_unique.cannot_toggle_index_pending')}
                        </p>
                      ) : null}
                      {uniqueSettingDisabled.reason === 'cannot_untoggle_field_linked' ? (
                        <p className="text-red-74 text-xs">
                          {t('data:edit_field.is_unique.cannot_untoggle_field_linked')}
                        </p>
                      ) : null}
                      {field.state.value && inputField.unicityConstraint === 'no_unicity_constraint' ? (
                        <p className="text-red-74 text-xs">
                          {t('data:edit_field.is_unique.warning_creation_asynchronous')}
                        </p>
                      ) : null}
                      {inputField.unicityConstraint === 'active_unique_constraint' && !field.state.value ? (
                        <p className="text-red-74 text-xs">{t('data:edit_field.is_unique.warning_untoggle')}</p>
                      ) : null}
                    </FormLabel>
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
            ) : null}
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close asChild>
                <Button className="flex-1" variant="secondary">
                  {t('common:cancel')}
                </Button>
              </Modal.Close>
              <Button className="flex-1" variant="primary" type="submit" name="edit">
                {t('data:edit_field.button_accept')}
              </Button>
            </div>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
