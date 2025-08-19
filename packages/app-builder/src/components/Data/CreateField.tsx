import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { EnumDataTypes, UniqueDataTypes } from '@app-builder/models';
import {
  CreateFieldValue,
  createFieldValueSchema,
  useCreateFieldMutation,
} from '@app-builder/queries/data/create-field';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Modal, Select } from 'ui-design-system';
import { FormErrorOrDescription } from '../Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '../Form/Tanstack/FormInput';

const VALUE_TYPES = [
  { value: 'String', display: 'data:create_field.type_string' },
  { value: 'Bool', display: 'data:create_field.type_bool' },
  { value: 'Timestamp', display: 'data:create_field.type_timestamp' },
  { value: 'Float', display: 'data:create_field.type_float' },
] as const;

const REQUIRED_OPTIONS = [
  { value: 'optional', display: 'data:create_field.option_optional' },
  { value: 'required', display: 'data:create_field.option_required' },
] as const;

export function CreateField({ tableId, children }: { tableId: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <CreateFieldContent
          tableId={tableId}
          closeModal={() => {
            setIsOpen(false);
          }}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

function CreateFieldContent({ tableId, closeModal }: { tableId: string; closeModal: () => void }) {
  const { t } = useTranslation(['data', 'navigation', 'common']);
  const createFieldMutation = useCreateFieldMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      required: REQUIRED_OPTIONS[0].value,
      name: '',
      description: '',
      type: VALUE_TYPES[0].value,
      tableId: tableId,
      isEnum: false,
      isUnique: false,
    } as CreateFieldValue,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createFieldMutation.mutateAsync(value).then((result) => {
          revalidate();

          if (result.success) {
            closeModal();
          }
        });
      }
    },
    validators: {
      onSubmit: createFieldValueSchema,
    },
  });

  const selectedType = useStore(form.store, (state) => state.values.type);
  const selectedEnum = useStore(form.store, (state) => state.values.isEnum);
  const selectedUnique = useStore(form.store, (state) => state.values.isUnique);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Modal.Title>{t('data:create_field.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-1 flex-col gap-4">
          <form.Field
            name="name"
            validators={{
              onChange: createFieldValueSchema.shape.name,
              onBlur: createFieldValueSchema.shape.name,
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <FormLabel name={field.name}>{t('data:field_name')}</FormLabel>
                <FormInput
                  type="text"
                  name={field.name}
                  defaultValue={field.state.value as string}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  valid={field.state.meta.errors.length === 0}
                  placeholder={t('data:create_field.name_placeholder')}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
          <form.Field
            name="description"
            validators={{
              onChange: createFieldValueSchema.shape.description,
              onBlur: createFieldValueSchema.shape.description,
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
                  placeholder={t('data:create_field.description_placeholder')}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
          <div className="flex flex-row justify-around gap-2">
            <form.Field
              name="required"
              validators={{
                onChange: createFieldValueSchema.shape.required,
                onBlur: createFieldValueSchema.shape.required,
              }}
            >
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name}>{t('data:create_field.required')}</FormLabel>
                  <Select.Default
                    className="w-full overflow-hidden"
                    defaultValue={field.state.value}
                    onValueChange={(type) => {
                      field.handleChange(type);
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
            <form.Field
              name="type"
              validators={{
                onChange: createFieldValueSchema.shape.type,
                onBlur: createFieldValueSchema.shape.type,
              }}
            >
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name}>{t('data:create_field.type')}</FormLabel>
                  <Select.Default
                    className="w-full overflow-hidden"
                    defaultValue={field.state.value}
                    onValueChange={(type) => {
                      field.handleChange(type as (typeof VALUE_TYPES)[number]['value']);
                    }}
                  >
                    {VALUE_TYPES.map(({ value, display }) => {
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
          {EnumDataTypes.includes(selectedType) ? (
            <form.Field
              name="isEnum"
              validators={{
                onChange: createFieldValueSchema.shape.isEnum,
                onBlur: createFieldValueSchema.shape.isEnum,
              }}
            >
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
          {UniqueDataTypes.includes(selectedType) ? (
            <form.Field
              name="isUnique"
              validators={{
                onChange: createFieldValueSchema.shape.isUnique,
                onBlur: createFieldValueSchema.shape.isUnique,
              }}
            >
              {(field) => (
                <div className="flex flex-row items-center gap-4">
                  <Checkbox
                    name={field.name}
                    defaultChecked={field.state.value}
                    disabled={selectedEnum}
                    onCheckedChange={(checked) => {
                      if (checked !== 'indeterminate') field.handleChange(checked);
                    }}
                  />
                  <FormLabel name={field.name}>
                    <p>{t('data:edit_field.is_unique.title')}</p>
                    <p className="text-xs">{t('data:edit_field.is_unique.toggle')}</p>
                    {field.state.value ? (
                      <p className="text-red-47 text-xs">
                        {t('data:edit_field.is_unique.warning_creation_asynchronous')}
                      </p>
                    ) : null}
                  </FormLabel>
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          ) : null}
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit" name="create">
            {t('data:create_field.button_accept')}
          </Button>
        </div>
      </div>
    </form>
  );
}
