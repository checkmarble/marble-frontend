import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { DataModel } from '@app-builder/models';
import { useAddConfigurationMutation } from '@app-builder/queries/client360/add-configuration';
import { addConfigurationPayloadSchema } from '@app-builder/schemas/client360';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import { Client360Table } from 'marble-api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
  const { t } = useTranslation(['common', 'client360']);
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
        addConfigurationMutation
          .mutateAsync(value)
          .then(() => {
            toast.success(t('common:success.save'));
            setOpen(false);
            form.reset();
            revalidate();
          })
          .catch(() => {
            toast.error(t('common:errors.unknown'));
          });
      }
    },
  });

  const availableTables = dataModel.filter((table) => {
    // Exclude tables already configured in Client360
    if (tables.some((t) => t.id === table.id)) return false;

    // Exclude tables with fixed semantic types (transaction, event, account, partner)
    if (table.semanticType === 'transaction' || table.semanticType === 'event' || table.semanticType === 'account')
      return false;
    if (table.semanticType === 'person' && table.subEntity === 'generic') return false; // partner

    // Exclude already fully configured tables (has person/company semantic type + caption field)
    const hasPersonOrCompany =
      table.semanticType === 'person' && (table.subEntity === 'natural' || table.subEntity === 'moral');
    if (hasPersonOrCompany && table.captionField) return false;
    // Exculde table with no field having name semantic type and no semantic type
    const hasNoName = table.fields.every((field) => field.semanticType !== 'name');
    const hasFieldWithNoSemantic = table.fields.some((field) => !field.semanticType);
    if (hasNoName && !hasFieldWithNoSemantic) return false;

    return true;
  });

  const selectedTable = useStore(form.store, (state) =>
    state.values.tableId ? dataModel.find((table) => table.id === state.values.tableId) : null,
  );
  const tableFields = selectedTable ? selectedTable.fields.filter((field) => field.dataType === 'String') : [];

  // Pre-fill alias, semanticType, and captionField from the selected table
  const selectedTableId = selectedTable?.id;
  useEffect(() => {
    if (selectedTable) {
      form.setFieldValue('alias', selectedTable.alias || '');
      form.setFieldValue('captionField', selectedTable.captionField || '');
      if (selectedTable.semanticType === 'person' && selectedTable.subEntity === 'moral') {
        form.setFieldValue('semanticType', 'company');
      } else if (selectedTable.semanticType === 'person' && selectedTable.subEntity === 'natural') {
        form.setFieldValue('semanticType', 'person');
      }
    }
  }, [selectedTableId]);

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
          {t('client360:client_detail.add_configuration_modal.button')}
        </Button>
      </Modal.Trigger>
      <Modal.Content size="medium">
        <Modal.Title>{t('client360:client_detail.add_configuration_modal.title')}</Modal.Title>
        <Modal.Description>
          <p className="text-grey-secondary text-small text-center pt-2">
            {t('client360:client_detail.add_configuration_modal.description')}
          </p>
        </Modal.Description>
        <div className="p-v2-md">
          <form
            id="add-configuration-form"
            className="grid grid-cols-2 gap-y-v2-sm gap-x-v2-md p-v2-sm bg-surface-card rounded-lg border border-grey-border text-small"
            onSubmit={handleSubmit(form)}
          >
            <form.Field name="tableId">
              {(field) => (
                <div className="grid grid-cols-[40px_1fr] items-center gap-v2-sm">
                  <span>{t('client360:client_detail.add_configuration_modal.table_label')}</span>
                  <SelectV2
                    value={field.state.value}
                    placeholder={t('client360:client_detail.add_configuration_modal.table_placeholder')}
                    onChange={field.handleChange}
                    options={availableTables.map((table) => ({
                      label: table.name,
                      value: table.id,
                      rowValue: table.name,
                    }))}
                    className="w-full"
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="semanticType">
              {(field) => (
                <div className="grid grid-cols-[40px_1fr] items-center gap-v2-sm col-start-1">
                  <span>{t('client360:client_detail.add_configuration_modal.type_label')}</span>
                  <SelectV2
                    value={field.state.value}
                    placeholder={t('client360:client_detail.add_configuration_modal.type_placeholder')}
                    onChange={field.handleChange}
                    options={[
                      { label: t('client360:client_detail.add_configuration_modal.type_person'), value: 'person' },
                      { label: t('client360:client_detail.add_configuration_modal.type_company'), value: 'company' },
                    ]}
                    className="w-full"
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="captionField">
              {(field) => (
                <div className="grid grid-cols-[40px_1fr] items-center gap-v2-sm">
                  <span>{t('client360:client_detail.add_configuration_modal.name_label')}</span>
                  <SelectV2
                    disabled={!selectedTable}
                    value={field.state.value}
                    placeholder={t('client360:client_detail.add_configuration_modal.caption_field_placeholder')}
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
                  <span>{t('client360:client_detail.add_configuration_modal.alias_label')}</span>
                  <span>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      placeholder={t('client360:client_detail.add_configuration_modal.alias_placeholder')}
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
