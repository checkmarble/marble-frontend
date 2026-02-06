import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { DataModel } from '@app-builder/models';
import {
  addConfigurationPayloadSchema,
  useAddConfigurationMutation,
} from '@app-builder/queries/client360/add-configuration';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import { Client360Table } from 'marble-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export const AddConfigurationModal = ({
  tables,
  dataModel,
  disabled,
}: {
  tables: Client360Table[];
  dataModel: DataModel;
  disabled: boolean;
}) => {
  const { t } = useTranslation(['common']);
  const [open, setOpen] = useState(false);
  const addConfigurationMutation = useAddConfigurationMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      tableId: '',
      semanticType: 'person',
      captionField: '',
      alias: '',
    } as z.input<typeof addConfigurationPayloadSchema>,
    validators: {
      onSubmit: addConfigurationPayloadSchema,
      onChange: addConfigurationPayloadSchema,
      onMount: addConfigurationPayloadSchema,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        addConfigurationMutation.mutateAsync(value).then((result) => {
          if (result.success) {
            setOpen(false);
            form.reset();
          }
          revalidate();
        });
      }
    },
  });

  const availableTables = dataModel.filter((table) => tables.every((t) => t.id !== table.id));
  const selectedTable = useStore(form.store, (state) =>
    state.values.tableId ? dataModel.find((table) => table.id === state.values.tableId) : null,
  );
  const tableFields = selectedTable ? selectedTable.fields.filter((field) => field.dataType === 'String') : [];

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button
          variant="primary"
          size="small"
          appearance={tables.length > 0 ? 'stroked' : 'filled'}
          disabled={disabled}
        >
          <Icon icon="plus" className="size-4" />
          Add configuration
        </Button>
      </Modal.Trigger>
      <Modal.Content size="medium">
        <Modal.Title>Configuration</Modal.Title>
        <div className="p-v2-md">
          <form
            id="add-configuration-form"
            className="grid grid-cols-2 gap-y-v2-sm gap-x-v2-md p-v2-sm bg-surface-card rounded-lg border border-grey-border text-small"
            onSubmit={handleSubmit(form)}
          >
            <form.Field name="tableId">
              {(field) => (
                <div className="grid grid-cols-[40px_1fr] items-center gap-v2-sm">
                  <span>Table:</span>
                  <SelectV2
                    value={field.state.value}
                    placeholder="Select a table"
                    onChange={field.handleChange}
                    options={availableTables.map((table) => ({ label: table.name, value: table.id }))}
                    className="w-full"
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="semanticType">
              {(field) => (
                <div className="grid grid-cols-[40px_1fr] items-center gap-v2-sm col-start-1">
                  <span>Type:</span>
                  <SelectV2
                    value={field.state.value}
                    placeholder="Select a type"
                    onChange={field.handleChange}
                    options={[
                      { label: 'Person', value: 'person' },
                      { label: 'Company', value: 'company' },
                    ]}
                    className="w-full"
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="captionField">
              {(field) => (
                <div className="grid grid-cols-[40px_1fr] items-center gap-v2-sm">
                  <span>Name:</span>
                  <SelectV2
                    disabled={!selectedTable}
                    value={field.state.value}
                    placeholder="Select a caption field"
                    onChange={field.handleChange}
                    options={tableFields.map((field) => ({ label: field.name, value: field.name }))}
                    className="w-full"
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="alias">
              {(field) => (
                <div className="grid grid-cols-[40px_1fr] items-center gap-v2-sm col-start-2">
                  <span>Alias:</span>
                  <span>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      placeholder="Enter an alias"
                    />
                  </span>
                </div>
              )}
            </form.Field>
          </form>
        </div>
        <Modal.Footer>
          <div className="flex items-center gap-v2-sm justify-end p-v2-md">
            <Modal.Close asChild>
              <Button variant="secondary" size="small">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => {
                return (
                  <Button
                    disabled={!canSubmit}
                    form="add-configuration-form"
                    type="submit"
                    variant="primary"
                    size="small"
                  >
                    {t('common:save')}
                  </Button>
                );
              }}
            </form.Subscribe>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
