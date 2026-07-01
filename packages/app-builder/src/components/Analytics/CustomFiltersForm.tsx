import { Panel } from '@app-builder/components/Panel';
import type { DateRangeFilter } from '@app-builder/models/analytics';
import { useCustomFiltersConfigQuery } from '@app-builder/queries/analytics/get-custom-filters-config';
import { useDeleteFilterMutation } from '@app-builder/queries/settings/scenarios/delete-filter';
import { useCreateFilterMutation } from '@app-builder/queries/settings/scenarios/update-filter';
import {
  buildDraftRowsFromExisting,
  type CustomFilterDraftRow,
  type CustomFilterSelection,
  type CustomFilterTableConfig,
  canAddFilterRow,
  createEmptyDraftRow,
  diffFilterChanges,
  getFieldSelectionLabel,
  getSelectionKey,
  hasDraftChanges,
  isRowComplete,
  needsDeleteConfirmation,
} from '@app-builder/utils/analytics/custom-filters';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Modal, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface CustomFiltersFormProps {
  triggerObjects: string[];
  scenarioId: string;
  ranges: DateRangeFilter[];
}

export function CustomFiltersForm({ triggerObjects, scenarioId, ranges }: CustomFiltersFormProps) {
  const { t } = useTranslation(['common', 'analytics', 'settings']);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draftRows, setDraftRows] = useState<CustomFilterDraftRow[]>([createEmptyDraftRow()]);
  const [rowIdPendingDelete, setRowIdPendingDelete] = useState<string | null>(null);

  const { data: config, isLoading } = useCustomFiltersConfigQuery(triggerObjects);
  const createFilterMutation = useCreateFilterMutation();
  const deleteFilterMutation = useDeleteFilterMutation();

  const existingFilters = config?.existingFilters ?? [];
  const tableConfigs = config?.tableConfigs ?? [];
  const tableConfigByName = useMemo(
    () => new Map(tableConfigs.map((table) => [table.tableName, table])),
    [tableConfigs],
  );

  useEffect(() => {
    if (config) {
      setDraftRows(buildDraftRowsFromExisting(config.existingFilters));
    }
  }, [config]);

  const isSaving = createFilterMutation.isPending || deleteFilterMutation.isPending;
  const hasIncompleteRow = draftRows.some((row) => !isRowComplete(row));
  const hasChanges = hasDraftChanges(existingFilters, draftRows);
  const canSave = hasChanges && !hasIncompleteRow && !isSaving && !isLoading;
  const canAddRow = canAddFilterRow(draftRows, tableConfigs);

  function resetDraft() {
    if (config) {
      setDraftRows(buildDraftRowsFromExisting(config.existingFilters));
    } else {
      setDraftRows([createEmptyDraftRow()]);
    }
  }

  function onOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetDraft();
      setRowIdPendingDelete(null);
    }
    setOpen(nextOpen);
  }

  function updateRow(rowId: string, updater: (row: CustomFilterDraftRow) => CustomFilterDraftRow) {
    setDraftRows((rows) => rows.map((row) => (row.id === rowId ? updater(row) : row)));
  }

  function removeRow(rowId: string) {
    setDraftRows((rows) => {
      const nextRows = rows.filter((row) => row.id !== rowId);
      return nextRows.length > 0 ? nextRows : [createEmptyDraftRow()];
    });
  }

  function requestRemoveRow(rowId: string) {
    const row = draftRows.find((item) => item.id === rowId);
    if (!row) return;

    if (needsDeleteConfirmation(row, existingFilters)) {
      setRowIdPendingDelete(rowId);
      return;
    }

    removeRow(rowId);
  }

  function confirmRemoveRow() {
    if (!rowIdPendingDelete) return;
    removeRow(rowIdPendingDelete);
    setRowIdPendingDelete(null);
  }

  function addRow() {
    setDraftRows((rows) => [...rows, createEmptyDraftRow()]);
  }

  async function saveFilters() {
    if (!canSave) return;

    const { toCreate, toDelete } = diffFilterChanges(existingFilters, draftRows);

    try {
      for (const item of toDelete) {
        await deleteFilterMutation.mutateAsync(item);
      }
      for (const item of toCreate) {
        await createFilterMutation.mutateAsync(item);
      }

      await queryClient.invalidateQueries({ queryKey: ['analytics', 'available-filters', scenarioId, ranges] });
      await queryClient.invalidateQueries({ queryKey: ['analytics', 'custom-filters-config', triggerObjects] });
      setOpen(false);

      if (toCreate.length > 0) {
        toast.success(
          () => (
            <div className="flex max-w-sm flex-col gap-2xs">
              <span className="text-s font-semibold">{t('analytics:filters.custom_filters.save_success.title')}</span>
              <span className="text-s font-normal">
                {t('analytics:filters.custom_filters.save_success.description')}
              </span>
            </div>
          ),
          { duration: 8000 },
        );
      }
    } catch {
      toast.error(t('common:errors.unknown'));
    }
  }

  return (
    <Panel.Root open={open} onOpenChange={onOpenChange}>
      <Panel.Trigger asChild>
        <Button variant="primary" appearance="stroked" size="medium" className="shrink-0">
          <Icon icon="settings" className="size-4" />
          <span>{t('analytics:filters.custom_filters.label')}</span>
        </Button>
      </Panel.Trigger>
      <Panel.Container size="medium">
        <Panel.Content>
          <Panel.Header>{t('analytics:filters.custom_filters.title')}</Panel.Header>
          {triggerObjects.length === 0 ? (
            <Typo variant="text" className="text-grey-secondary px-lg pb-lg">
              {t('analytics:filters.custom_filters.no_filters')}
            </Typo>
          ) : isLoading ? null : (
            <div className="flex flex-col gap-sm px-lg pb-lg">
              {draftRows.map((row) => (
                <CustomFilterRow
                  key={row.id}
                  row={row}
                  triggerObjects={triggerObjects}
                  tableConfig={row.triggerObjectType ? tableConfigByName.get(row.triggerObjectType) : undefined}
                  usedSelectionKeys={getUsedSelectionKeys(draftRows, row.id)}
                  onTriggerObjectChange={(triggerObjectType) => {
                    const tableId = tableConfigByName.get(triggerObjectType)?.tableId ?? null;
                    updateRow(row.id, (current) => ({
                      ...current,
                      triggerObjectType,
                      tableId,
                      selection: null,
                      persistedKey: undefined,
                    }));
                  }}
                  onSelectionChange={(selection) => {
                    updateRow(row.id, (current) => ({
                      ...current,
                      selection,
                      persistedKey: undefined,
                    }));
                  }}
                  onRemove={() => requestRemoveRow(row.id)}
                />
              ))}
              <Button
                variant="primary"
                appearance="stroked"
                className="self-start"
                disabled={!canAddRow}
                onClick={addRow}
              >
                <span>{t('analytics:filters.custom_filters.add_filter')}</span>
                <Icon icon="plus" className="size-4" />
              </Button>
            </div>
          )}
          <Panel.Footer className="flex gap-md items-center">
            <Typo variant="text" className="text-grey-secondary">
              {t('analytics:filters.custom_filters.description')}
            </Typo>
            <Panel.FooterButton label={t('common:cancel')} isCloseButton />
            <Panel.FooterButton
              variant="primary"
              onClick={saveFilters}
              label={t('common:save')}
              disabled={!canSave}
              isLoading={isSaving}
            />
          </Panel.Footer>
        </Panel.Content>
      </Panel.Container>
      <Modal.Root open={rowIdPendingDelete !== null} onOpenChange={(isOpen) => !isOpen && setRowIdPendingDelete(null)}>
        <Modal.Content size="medium">
          <Modal.Title>{t('settings:filters.delete_filter.title')}</Modal.Title>
          <Modal.Description className="p-lg text-left">
            {t('settings:filters.delete_filter.content')}
          </Modal.Description>
          <Modal.Footer>
            <Modal.FooterButton
              isCloseButton
              variant="secondary"
              label={t('common:cancel')}
              onClick={() => setRowIdPendingDelete(null)}
            />
            <Modal.FooterButton
              variant="destructive"
              label={t('settings:filters.delete_filter')}
              onClick={confirmRemoveRow}
              leadingIcon="delete"
            />
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </Panel.Root>
  );
}

function getUsedSelectionKeys(rows: CustomFilterDraftRow[], currentRowId: string): Set<string> {
  return new Set(
    rows
      .filter((row) => row.id !== currentRowId && isRowComplete(row))
      .map((row) => getSelectionKey(row.tableId!, row.selection!)),
  );
}

interface CustomFilterRowProps {
  row: CustomFilterDraftRow;
  triggerObjects: string[];
  tableConfig?: CustomFilterTableConfig;
  usedSelectionKeys: Set<string>;
  onTriggerObjectChange: (triggerObjectType: string) => void;
  onSelectionChange: (selection: CustomFilterSelection) => void;
  onRemove: () => void;
}

function CustomFilterRow({
  row,
  triggerObjects,
  tableConfig,
  usedSelectionKeys,
  onTriggerObjectChange,
  onSelectionChange,
  onRemove,
}: CustomFilterRowProps) {
  const { t } = useTranslation(['analytics', 'common']);

  return (
    <div className="flex items-center gap-sm">
      {row.isNew ? (
        <span className="flex shrink-0 items-center" title={t('analytics:filters.custom_filters.new_filter_indicator')}>
          <Icon icon="star" className="text-purple-primary size-4" />
        </span>
      ) : (
        <span className="size-4 shrink-0" aria-hidden="true" />
      )}
      <TriggerObjectSelect
        triggerObjects={triggerObjects}
        value={row.triggerObjectType}
        placeholder={t('analytics:filters.custom_filters.select_table')}
        onChange={onTriggerObjectChange}
      />
      <FieldLinkSelect
        tableConfig={tableConfig}
        selection={row.selection}
        usedSelectionKeys={usedSelectionKeys}
        tableId={row.tableId}
        placeholder={t('analytics:filters.custom_filters.select_field')}
        searchPlaceholder={t('analytics:filters.custom_filters.search_field')}
        fieldsGroupLabel={t('analytics:filters.custom_filters.fields_group')}
        linksGroupLabel={t('analytics:filters.custom_filters.links_group')}
        onChange={onSelectionChange}
      />
      <Button variant="secondary" mode="icon" onClick={onRemove} aria-label={t('common:delete')}>
        <Icon icon="delete" className="size-4" />
      </Button>
    </div>
  );
}

function TriggerObjectSelect({
  triggerObjects,
  value,
  placeholder,
  onChange,
}: {
  triggerObjects: string[];
  value: string | null;
  placeholder: string;
  onChange: (triggerObjectType: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MenuCommand.Menu open={menuOpen} onOpenChange={setMenuOpen}>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className="min-w-40">{value ?? placeholder}</MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="start" sameWidth sideOffset={4}>
        <MenuCommand.List>
          {triggerObjects.map((triggerObject) => (
            <MenuCommand.Item
              key={triggerObject}
              value={triggerObject}
              selected={value === triggerObject}
              onSelect={() => {
                onChange(triggerObject);
                setMenuOpen(false);
              }}
            >
              {triggerObject}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

function FieldLinkSelect({
  tableConfig,
  selection,
  usedSelectionKeys,
  tableId,
  placeholder,
  searchPlaceholder,
  fieldsGroupLabel,
  linksGroupLabel,
  onChange,
}: {
  tableConfig?: CustomFilterTableConfig;
  selection: CustomFilterSelection | null;
  usedSelectionKeys: Set<string>;
  tableId: string | null;
  placeholder: string;
  searchPlaceholder: string;
  fieldsGroupLabel: string;
  linksGroupLabel: string;
  onChange: (selection: CustomFilterSelection) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const disabled = !tableConfig || !tableId;

  const label = tableConfig && selection ? getFieldSelectionLabel(tableConfig.tableName, selection) : placeholder;

  const availableFields =
    tableId === null
      ? []
      : (tableConfig?.fields ?? []).filter(
          (field) => !usedSelectionKeys.has(getSelectionKey(tableId, { kind: 'trigger', fieldName: field.name })),
        );

  const availableLinks =
    tableId === null
      ? []
      : (tableConfig?.links ?? []).filter((linkConfig) =>
          linkConfig.fields.some(
            (field) =>
              !usedSelectionKeys.has(
                getSelectionKey(tableId, {
                  kind: 'ingested',
                  path: [linkConfig.link.name],
                  fieldName: field.name,
                }),
              ),
          ),
        );

  return (
    <MenuCommand.Menu open={menuOpen} onOpenChange={setMenuOpen}>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className="min-w-56 flex-1" disabled={disabled}>
          {label}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="start" sameWidth sideOffset={4}>
        <MenuCommand.Combobox placeholder={searchPlaceholder} />
        <MenuCommand.List>
          {availableFields.length > 0 ? (
            <MenuCommand.Group
              heading={<div className="px-xs py-2xs text-xs text-grey-secondary">{fieldsGroupLabel}</div>}
            >
              {availableFields.map((field) => {
                const fieldSelection: CustomFilterSelection = { kind: 'trigger', fieldName: field.name };
                const isSelected = selection?.kind === 'trigger' && selection.fieldName === field.name;
                return (
                  <MenuCommand.Item
                    key={`field-${field.id}`}
                    value={field.name}
                    selected={isSelected}
                    onSelect={() => {
                      onChange(fieldSelection);
                      setMenuOpen(false);
                    }}
                  >
                    {field.name}
                  </MenuCommand.Item>
                );
              })}
            </MenuCommand.Group>
          ) : null}
          {availableLinks.length > 0 ? (
            <>
              {availableFields.length > 0 ? <MenuCommand.Separator /> : null}
              <MenuCommand.Group
                heading={<div className="px-xs py-2xs text-xs text-grey-secondary">{linksGroupLabel}</div>}
              >
                {availableLinks.map((linkConfig) => (
                  <MenuCommand.SubMenu key={linkConfig.link.id} trigger={linkConfig.link.name}>
                    <MenuCommand.Combobox placeholder={searchPlaceholder} />
                    <MenuCommand.List>
                      {linkConfig.fields
                        .filter(
                          (field) =>
                            tableId !== null &&
                            !usedSelectionKeys.has(
                              getSelectionKey(tableId, {
                                kind: 'ingested',
                                path: [linkConfig.link.name],
                                fieldName: field.name,
                              }),
                            ),
                        )
                        .map((field) => {
                          const fieldSelection: CustomFilterSelection = {
                            kind: 'ingested',
                            path: [linkConfig.link.name],
                            fieldName: field.name,
                          };
                          const isSelected =
                            selection?.kind === 'ingested' &&
                            selection.fieldName === field.name &&
                            selection.path[0] === linkConfig.link.name;
                          return (
                            <MenuCommand.Item
                              key={`link-${linkConfig.link.id}-${field.id}`}
                              value={`${linkConfig.link.name}.${field.name}`}
                              selected={isSelected}
                              onSelect={() => {
                                onChange(fieldSelection);
                                setMenuOpen(false);
                              }}
                            >
                              {field.name}
                            </MenuCommand.Item>
                          );
                        })}
                    </MenuCommand.List>
                  </MenuCommand.SubMenu>
                ))}
              </MenuCommand.Group>
            </>
          ) : null}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
