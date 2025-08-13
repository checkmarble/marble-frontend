import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type TableModel } from '@app-builder/models/data-model';
import {
  CreateLinkValue,
  createLinkValueSchema,
  useCreateLinkMutation,
} from '@app-builder/queries/data/create-link';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'ui-design-system';

export function CreateLink({
  thisTable,
  otherTables,
  children,
}: {
  otherTables: [TableModel, ...TableModel[]];
  thisTable: TableModel;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <CreateLinkContent
          thisTable={thisTable}
          otherTables={otherTables}
          closeModal={() => {
            setIsOpen(false);
          }}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

function CreateLinkContent({
  thisTable,
  otherTables,
  closeModal,
}: {
  otherTables: [TableModel, ...TableModel[]];
  thisTable: TableModel;
  closeModal: () => void;
}) {
  const { t } = useTranslation(['data', 'navigation', 'common']);
  const [selectedParentTable, setSelectedParentTable] = useState(otherTables[0]);
  const selectedParentTableFields = useMemo(() => {
    return selectedParentTable.fields.filter(
      (field) => field.unicityConstraint === 'active_unique_constraint',
    );
  }, [selectedParentTable]);
  const revalidate = useLoaderRevalidator();

  const createLinkMutation = useCreateLinkMutation();

  const form = useForm({
    defaultValues: {
      name: '',
      parentTableId: otherTables[0].id,
      parentFieldId: selectedParentTableFields[0]?.id as string,
      childTableId: thisTable.id,
      childFieldId: thisTable.fields[0]?.id as string,
    } as CreateLinkValue,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createLinkMutation.mutateAsync(value).then((result) => {
          revalidate();

          if (result.success) {
            closeModal();
          }
        });
      }
    },
    validators: {
      onSubmit: createLinkValueSchema,
    },
  });

  useEffect(() => {
    const parentFieldId = selectedParentTableFields[0]?.id;
    if (!parentFieldId) return;
    form.setFieldValue('parentFieldId', parentFieldId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedParentTableFields]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Modal.Title>{t('data:create_link.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-1 flex-col gap-4">
          <form.Field
            name="name"
            validators={{
              onBlur: createLinkValueSchema.shape.name,
              onChange: createLinkValueSchema.shape.name,
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <FormLabel name={field.name}>{t('data:link_name')}</FormLabel>
                <FormInput
                  type="text"
                  name={field.name}
                  defaultValue={field.state.value as string}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  valid={field.state.meta.errors.length === 0}
                  placeholder={t('data:create_link.name_placeholder')}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>

          <div className="flex flex-row justify-around gap-2">
            <form.Field
              name="childTableId"
              validators={{
                onBlur: createLinkValueSchema.shape.childTableId,
                onChange: createLinkValueSchema.shape.childTableId,
              }}
            >
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name}>{t('data:create_link.child_table')}</FormLabel>
                  <Select.Default
                    disabled={true}
                    defaultValue={field.state.value}
                    onValueChange={(type) => {
                      field.handleChange(type);
                    }}
                  >
                    {[thisTable].map(({ id, name }) => {
                      return (
                        <Select.DefaultItem key={id} value={id}>
                          {name}
                        </Select.DefaultItem>
                      );
                    })}
                  </Select.Default>
                  v
                </div>
              )}
            </form.Field>
            <form.Field
              name="childFieldId"
              validators={{
                onBlur: createLinkValueSchema.shape.childFieldId,
                onChange: createLinkValueSchema.shape.childFieldId,
              }}
            >
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name}>{t('data:create_link.child_field')}</FormLabel>
                  <Select.Default
                    defaultValue={field.state.value}
                    onValueChange={(type) => {
                      field.handleChange(type);
                    }}
                  >
                    {thisTable.fields.map(({ id, name }) => {
                      return (
                        <Select.DefaultItem key={id} value={id}>
                          {name}
                        </Select.DefaultItem>
                      );
                    })}
                  </Select.Default>
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>
          <div className="flex flex-row justify-around gap-2">
            <form.Field
              name="parentTableId"
              validators={{
                onBlur: createLinkValueSchema.shape.parentTableId,
                onChange: createLinkValueSchema.shape.parentTableId,
              }}
            >
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name}>{t('data:create_link.parent_table')}</FormLabel>
                  <Select.Default
                    defaultValue={field.state.value}
                    onValueChange={(id) => {
                      field.handleChange(id);
                      const newTable =
                        otherTables.find(({ id: tableId }) => tableId === id) ?? otherTables[0];
                      setSelectedParentTable(newTable);
                    }}
                  >
                    {otherTables.map(({ id, name }) => {
                      return (
                        <Select.DefaultItem key={id} value={id}>
                          {name}
                        </Select.DefaultItem>
                      );
                    })}
                  </Select.Default>
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
            <form.Field
              name="parentFieldId"
              validators={{
                onBlur: createLinkValueSchema.shape.parentFieldId,
                onChange: createLinkValueSchema.shape.parentFieldId,
              }}
            >
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name}>{t('data:create_link.parent_field')}</FormLabel>
                  <Select.Default
                    defaultValue={selectedParentTableFields[0]?.id}
                    onValueChange={field.handleChange}
                  >
                    {selectedParentTableFields.map(({ id, name }) => {
                      return (
                        <Select.DefaultItem key={id} value={id}>
                          {name}
                        </Select.DefaultItem>
                      );
                    })}
                  </Select.Default>
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>
          <p>{t('data:create_link.must_point_to_unique_field')}</p>
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
