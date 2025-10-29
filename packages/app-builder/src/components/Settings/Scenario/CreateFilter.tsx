import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import type { DataModel, Pivot } from '@app-builder/models';
import {
  type CreateExportedFieldPayload,
  createExportedFieldSchema,
  useCreateFilterMutation,
} from '@app-builder/queries/settings/scenarios/filter';
import { useForm } from '@tanstack/react-form';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, MenuCommand, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateFilter({
  dataModel,
  pivots,
  disabled,
}: {
  dataModel: DataModel;
  pivots: Pivot[];
  disabled: boolean;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);
  const [openUnifiedMenu, setOpenUnifiedMenu] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>(dataModel[0]?.id ?? '');
  const createFilter = useCreateFilterMutation();
  const selectedTable = useMemo(
    () => dataModel.find((t) => t.id === selectedTableId),
    [dataModel, selectedTableId],
  );
  const revalidate = useLoaderRevalidator();
  // Build unified lists
  const triggerFieldItems = useMemo(
    () =>
      dataModel.flatMap((table) =>
        table.fields.map((field) => ({
          tableId: table.id,
          tableName: table.name,
          fieldName: field.name,
          label: `${table.name}.${field.name}`,
        })),
      ),
    [dataModel],
  );
  const linkPivotFieldItems = useMemo(
    () =>
      pivots
        .filter((p): p is Extract<Pivot, { type: 'link' }> => p.type === 'link')
        .flatMap((p) => {
          const targetTable = dataModel.find((t) => t.id === p.pivotTableId);
          if (!targetTable)
            return [] as Array<{
              baseTableId: string;
              pathLinks: string[];
              fieldName: string;
              label: string;
            }>;
          return targetTable.fields.map((f) => ({
            baseTableId: p.baseTableId,
            pathLinks: p.pathLinks,
            fieldName: f.name,
            label: `->${p.pathLinks.join('->')}.${f.name}`,
          }));
        }),
    [pivots, dataModel],
  );

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
        createFilter
          .mutateAsync({ tableId: selectedTableId, payload: value as CreateExportedFieldPayload })
          .then((res) => {
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
        <ButtonV2 onClick={(e) => e.stopPropagation()} disabled={disabled}>
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
                      {linkPivotFieldItems.map((pf) => {
                        const v = form.state.values as CreateExportedFieldPayload;
                        const isSelected =
                          'ingestedDataField' in v &&
                          !!v.ingestedDataField &&
                          v.ingestedDataField.name === pf.fieldName &&
                          v.ingestedDataField.path.join('.') === pf.pathLinks.join('.') &&
                          selectedTableId === pf.baseTableId;
                        return (
                          <MenuCommand.Item
                            key={`pivot-${pf.baseTableId}-${pf.label}`}
                            selected={isSelected}
                            onSelect={() => {
                              setSelectedTableId(pf.baseTableId);
                              // choose ingested; clear trigger
                              form.setFieldValue('triggerObjectField' as any, undefined as any);
                              form.setFieldValue(
                                'ingestedDataField' as any,
                                {
                                  path: pf.pathLinks,
                                  name: pf.fieldName,
                                } as any,
                              );
                              setOpenUnifiedMenu(false);
                            }}
                          >
                            <span className="font-semibold">{pf.label}</span>
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
