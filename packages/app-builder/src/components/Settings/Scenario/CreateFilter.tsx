import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import type { DataModel } from '@app-builder/models';
import {
  type CreateExportedFieldPayload,
  createExportedFieldSchema,
  useCreateFilterMutation,
} from '@app-builder/queries/settings/scenarios/update-filter';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, MenuCommand, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

type TriggerFieldItem = {
  tableId: string;
  tableName: string;
  fieldName: string;
  label: string;
};

type LinkedFieldItem = {
  baseTableId: string;
  pathLinks: string[];
  fieldName: string;
  label: string;
};

export function CreateFilter({
  dataModel,
  triggerFieldItems,
  linkedFieldItems,
}: {
  dataModel: DataModel;
  triggerFieldItems: TriggerFieldItem[];
  linkedFieldItems: LinkedFieldItem[];
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);
  const [openUnifiedMenu, setOpenUnifiedMenu] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>(dataModel[0]?.id ?? '');
  const createFilterMutation = useCreateFilterMutation();
  const selectedTable = dataModel.find((t) => t.id === selectedTableId);
  const revalidate = useLoaderRevalidator();

  function summaryLabel() {
    const v = form.state.values as CreateExportedFieldPayload;
    if ('ingestedDataField' in v && v.ingestedDataField) {
      return `->${v.ingestedDataField.path.join('->')}.${v.ingestedDataField.name}`;
    }
    if ('triggerObjectField' in v && v.triggerObjectField) {
      const tableName = selectedTable?.name ?? '';
      return tableName ? `${tableName}.${v.triggerObjectField}` : v.triggerObjectField;
    }
    return 'Choose a field';
  }

  const form = useForm({
    defaultValues: {} as CreateExportedFieldPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createFilterMutation
          .mutateAsync({ tableId: selectedTableId, payload: value as CreateExportedFieldPayload })
          .then((res: any) => {
            if (res.success) {
              setOpen(false);
              revalidate();
              form.reset();
            }
          });
      }
    },
    validators: {
      onSubmit: createExportedFieldSchema,
    },
  });
  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <ButtonV2 onClick={(e) => e.stopPropagation()}>
          <Icon icon="plus" className="size-4" />
          {t('settings:scenarios.filters.new_filter.create.button.label')}
        </ButtonV2>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Modal.Title>{t('settings:scenarios.filters.new_filter.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
              <span className="text-s font-medium">Fields</span>
              <MenuCommand.Menu open={openUnifiedMenu} onOpenChange={setOpenUnifiedMenu}>
                <MenuCommand.Trigger>
                  <MenuCommand.SelectButton>{summaryLabel()}</MenuCommand.SelectButton>
                </MenuCommand.Trigger>
                <MenuCommand.Content align="start" sameWidth sideOffset={4}>
                  <MenuCommand.Combobox placeholder="Search fields" />
                  <MenuCommand.List>
                    <MenuCommand.Group>
                      {triggerFieldItems.map((item) => {
                        const v = form.state.values as CreateExportedFieldPayload;
                        const isSelected =
                          selectedTableId === item.tableId &&
                          'triggerObjectField' in v &&
                          v.triggerObjectField === item.fieldName;
                        return (
                          <MenuCommand.Item
                            key={`trigger-${item.tableId}-${item.fieldName}`}
                            selected={isSelected}
                            onSelect={() => {
                              setSelectedTableId(item.tableId);
                              // choose trigger; clear ingested
                              form.setFieldValue('ingestedDataField' as any, undefined as any);
                              form.setFieldValue(
                                'triggerObjectField' as any,
                                item.fieldName as any,
                              );
                              setOpenUnifiedMenu(false);
                            }}
                          >
                            <span className="font-semibold">{item.label}</span>
                          </MenuCommand.Item>
                        );
                      })}
                    </MenuCommand.Group>
                    <MenuCommand.Separator />
                    <MenuCommand.Group>
                      {linkedFieldItems.map((lf) => {
                        const v = form.state.values as CreateExportedFieldPayload;
                        const isSelected =
                          'ingestedDataField' in v &&
                          !!v.ingestedDataField &&
                          v.ingestedDataField.name === lf.fieldName &&
                          v.ingestedDataField.path.join('.') === lf.pathLinks.join('.') &&
                          selectedTableId === lf.baseTableId;
                        return (
                          <MenuCommand.Item
                            key={`pivot-${lf.baseTableId}-${lf.label}`}
                            selected={isSelected}
                            onSelect={() => {
                              setSelectedTableId(lf.baseTableId);
                              // choose ingested; clear trigger
                              form.setFieldValue('triggerObjectField' as any, undefined as any);
                              form.setFieldValue(
                                'ingestedDataField' as any,
                                {
                                  path: lf.pathLinks,
                                  name: lf.fieldName,
                                } as any,
                              );
                              setOpenUnifiedMenu(false);
                            }}
                          >
                            <span className="font-semibold">{lf.label}</span>
                          </MenuCommand.Item>
                        );
                      })}
                    </MenuCommand.Group>
                  </MenuCommand.List>
                </MenuCommand.Content>
              </MenuCommand.Menu>
            </div>
            <div className="flex flex-1 gap-2 justify-end">
              <Modal.Close asChild>
                <ButtonV2 variant="secondary" onClick={() => setOpen(false)}>
                  {t('common:cancel')}
                </ButtonV2>
              </Modal.Close>
              <ButtonV2 variant="primary" type="submit" className="align-baseline">
                {t('common:save')}
              </ButtonV2>
            </div>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
