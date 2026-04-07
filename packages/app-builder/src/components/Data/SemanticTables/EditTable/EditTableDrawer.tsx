import { Callout } from '@app-builder/components/Callout';
import { DeleteTable } from '@app-builder/components/Data/DeleteDataModel/DeleteTable';
import { type DataModelField, type FtmEntityV2 } from '@app-builder/models';
import { ftmEntities, type LinkToSingle, type TableModel } from '@app-builder/models/data-model';
import { useDataModel } from '@app-builder/services/data/data-model';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, MenuCommand, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { type FieldValidationError, type ValidationError, validateValues } from '../CreateTable/createTable-types';
import type { LinkValue, SemanticTableFormValues, TableField } from '../Shared/semanticData-types';
import { FormTable } from '../Shared/TableForm';
import { UnsavedChangesDialog } from '../Shared/UnsavedChangesDialog';
import { UploadDataDrawerContext } from '../UploadData/UploadDataDrawer';

export function EditTableDrawer({
  open,
  onClose,
  onSave,
  tableModel,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (tableState: SemanticTableFormValues, links: LinkValue[]) => Promise<void>;
  tableModel: TableModel;
}) {
  const { t } = useTranslation(['data', 'common']);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = useState(false);
  const initialTableStateRef = useRef<Record<string, SemanticTableFormValues>>({
    [tableModel.id]: adaptTableModelToFormValues(tableModel),
  });
  const initialLinksStateRef = useRef<Record<string, LinkValue>>(
    adaptLinksToLinkState(tableModel.linksToSingle, tableModel.id),
  );
  const wasOpenRef = useRef(open);
  const dataModel = useDataModel();

  const [tablesState, setTablesState] = useState<Record<string, SemanticTableFormValues>>(
    () => initialTableStateRef.current,
  );
  const [linksState, setLinksState] = useState<Record<string, LinkValue>>(() => initialLinksStateRef.current);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [entityTypeMenuOpen, setEntityTypeMenuOpen] = useState(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const nextInitialTableState = {
        [tableModel.id]: adaptTableModelToFormValues(tableModel),
      };
      const nextInitialLinksState = adaptLinksToLinkState(tableModel.linksToSingle, tableModel.id);
      initialTableStateRef.current = nextInitialTableState;
      initialLinksStateRef.current = nextInitialLinksState;
      setTablesState(nextInitialTableState);
      setLinksState(nextInitialLinksState);
      setValidationErrors([]);
      setIsUnsavedChangesDialogOpen(false);
    }
    wasOpenRef.current = open;
  }, [open, tableModel]);

  const isDirty = useMemo(
    () =>
      JSON.stringify(normalizeTablesStateForDirtyCheck(tablesState)) !==
        JSON.stringify(normalizeTablesStateForDirtyCheck(initialTableStateRef.current)) ||
      JSON.stringify(normalizeLinksStateForDirtyCheck(linksState)) !==
        JSON.stringify(normalizeLinksStateForDirtyCheck(initialLinksStateRef.current)),
    [linksState, tablesState],
  );

  const tableIds = useMemo(() => [tableModel.id], [tableModel.id]);

  const updateTableState = useCallback((tableId: string, values: Partial<SemanticTableFormValues>) => {
    setTablesState((prev) => ({
      ...prev,
      [tableId]: { ...prev[tableId]!, ...values },
    }));
  }, []);

  const updateLinkState = useCallback((linkId: string, values: Partial<LinkValue>) => {
    setLinksState((prev) => ({
      ...prev,
      [linkId]: { ...prev[linkId]!, ...values },
    }));
  }, []);

  const addLink = useCallback((sourceTableId: string) => {
    const linkId = crypto.randomUUID();
    setLinksState((prev) => ({
      ...prev,
      [linkId]: {
        linkId,
        name: '',
        tableFieldId: '',
        relationType: 'belongs_to',
        targetTableId: '',
        sourceTableId,
      },
    }));
  }, []);

  const removeLink = useCallback((linkId: string) => {
    setLinksState((prev) => {
      const next = { ...prev };
      delete next[linkId];
      return next;
    });
  }, []);

  const getLinksForTable = useCallback(
    (tableId: string) => Object.values(linksState).filter((link) => link.sourceTableId === tableId),
    [linksState],
  );

  const updateField = useCallback((tableId: string, fieldId: string, values: Partial<TableField>) => {
    setTablesState((prev) => {
      const table = prev[tableId];
      if (!table) return prev;
      return {
        ...prev,
        [tableId]: {
          ...table,
          fields: table.fields.map((f) => (f.id === fieldId ? { ...f, ...values } : f)),
        },
      };
    });
  }, []);

  const reorderFields = useCallback((tableId: string, startIndex: number, endIndex: number) => {
    setTablesState((prev) => {
      const table = prev[tableId];
      if (!table) return prev;
      const fields = [...table.fields];
      const [moved] = fields.splice(startIndex, 1);
      if (!moved) return prev;
      fields.splice(endIndex, 0, moved);
      return {
        ...prev,
        [tableId]: { ...table, fields: fields.map((f, i) => ({ ...f, order: i })) },
      };
    });
  }, []);

  const addField = useCallback((tableId: string, name: string): string => {
    const fieldId = crypto.randomUUID();
    setTablesState((prev) => {
      const table = prev[tableId];
      if (!table) return prev;
      const newField: TableField = {
        id: fieldId,
        name,
        description: '',
        dataType: 'String',
        tableId,
        isEnum: false,
        nullable: true,
        alias: name,
        hidden: false,
        order: table.fields.length,
        unicityConstraint: 'no_unicity_constraint',
        semanticType: 'text' as const,
        semanticSubType: undefined,
        isNew: true,
      };
      return {
        ...prev,
        [tableId]: { ...table, fields: [...table.fields, newField] },
      };
    });
    return fieldId;
  }, []);

  const removeField = useCallback((tableId: string, fieldId: string) => {
    setTablesState((prev) => {
      const table = prev[tableId];
      if (!table) return prev;
      return {
        ...prev,
        [tableId]: {
          ...table,
          fields: table.fields.filter((f) => f.id !== fieldId).map((f, i) => ({ ...f, order: i })),
        },
      };
    });
  }, []);

  const tableState = tablesState[tableModel.id]!;
  const isSemanticTypeChanged = tableState.entityType !== tableModel.semanticType;

  const ftmEntityOptions = useMemo(
    () =>
      ftmEntities.map((entity) => ({
        label: t(`data:upload_data.ftm_entity.${entity}`),
        value: entity,
      })),
    [t],
  );

  const destinationTableOptions = useMemo(
    () => dataModel.map((t) => ({ tableId: t.id, label: t.alias || t.name })),
    [dataModel],
  );

  const fieldErrorIds = useMemo(
    () => new Set(validationErrors.filter((e): e is FieldValidationError => e.kind === 'field').map((e) => e.fieldId)),
    [validationErrors],
  );

  async function handleSave() {
    const links = getLinksForTable(tableModel.id);
    const values: SemanticTableFormValues = { ...tableState, links };

    const fieldResult = validateValues(values, 'fields');
    const linkResult = validateValues(values, 'links');
    const errors: ValidationError[] = [
      ...(!fieldResult.ok ? fieldResult.errors : []),
      ...(!linkResult.ok ? linkResult.errors : []),
    ];
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    await onSave(tableState, links);
  }

  const handleBackdropClose = useCallback(() => {
    if (!isDirty) {
      onClose();
      return;
    }
    setIsUnsavedChangesDialogOpen(true);
  }, [isDirty, onClose]);

  const handleConfirmDiscardChanges = useCallback(() => {
    setIsUnsavedChangesDialogOpen(false);
    setTablesState(initialTableStateRef.current);
    setLinksState(initialLinksStateRef.current);
    setValidationErrors([]);
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <UploadDataDrawerContext.Provider
      value={{
        container: containerRef,
        data: null,
        close: onClose,
        tablesState,
        updateTableState,
        tableIds,
        linksState,
        updateLinkState,
        addLink,
        removeLink,
        getLinksForTable,
        updateField,
        reorderFields,
        addField,
        removeField,
      }}
    >
      {/* Backdrop */}
      <div
        className="animate-overlay-show bg-grey-primary/20 fixed inset-0 z-40 backdrop-blur-xs"
        onClick={handleBackdropClose}
      />
      {/* Drawer panel */}
      <aside className="animate-slideRightAndFadeIn fixed right-0 top-0 z-50 h-full w-[max(1280px,70vw)] border-l border-grey-border shadow-lg">
        <div ref={containerRef} className="bg-surface-card flex h-full flex-col overflow-y-auto">
          <header className="flex shrink-0 items-center gap-v2-md border-b border-grey-border p-v2-lg">
            <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-grey-border">
              <Icon icon="x" className="size-5" />
            </button>
            <span className="text-l">{t('data:edit_table.header_prefix')}</span>
            <EditableAlias alias={tableState.alias} onChange={(alias) => updateTableState(tableModel.id, { alias })} />

            <MenuCommand.Menu open={entityTypeMenuOpen} onOpenChange={setEntityTypeMenuOpen}>
              <MenuCommand.Trigger>
                <Tag color={isSemanticTypeChanged ? 'red' : 'grey'} className="cursor-pointer gap-1">
                  {isSemanticTypeChanged && <Icon icon="tip" className="size-3" />}
                  {tableState.entityType
                    ? t(`data:upload_data.ftm_entity.${tableState.entityType}`)
                    : t('data:upload_data.object_placeholder')}
                  <Icon
                    icon="caret-down"
                    className={cn('size-3 transition-transform', entityTypeMenuOpen && 'rotate-180')}
                  />
                </Tag>
              </MenuCommand.Trigger>
              <MenuCommand.Content sideOffset={4}>
                <MenuCommand.List>
                  {ftmEntityOptions.map((option) => (
                    <MenuCommand.Item
                      key={option.value}
                      onSelect={() =>
                        updateTableState(tableModel.id, {
                          entityType: option.value as FtmEntityV2,
                          subEntity: 'moral',
                        })
                      }
                    >
                      {option.label}
                    </MenuCommand.Item>
                  ))}
                </MenuCommand.List>
              </MenuCommand.Content>
            </MenuCommand.Menu>
          </header>

          <div className="flex-1 overflow-auto px-v2-lg py-v2-lg">
            <FormTable
              tableId={tableModel.id}
              errorFieldIds={fieldErrorIds}
              destinationTableOptions={destinationTableOptions}
            />
          </div>

          <footer className="flex shrink-0 items-start justify-between gap-v2-md border-t border-grey-border p-v2-lg">
            {validationErrors.length > 0 || isSemanticTypeChanged ? (
              <Callout color="red" icon="lightbulb" iconColor="red" className="min-w-0 flex-1">
                <ul className="flex flex-col gap-v2-xs pl-3">
                  {validationErrors.map((error, index) => (
                    <li key={`${error.kind}-${index}`}>{error.message}</li>
                  ))}
                  {isSemanticTypeChanged ? <li>{t('data:edit_table.entity_type_change_warning')}</li> : null}
                </ul>
              </Callout>
            ) : (
              <div className="min-w-0 flex-1" />
            )}

            <div className="flex shrink-0 items-center gap-v2-md self-center">
              <DeleteTable
                table={tableModel}
                onDeleted={onClose}
                triggerVariant="destructive"
                triggerAppearance="icon-text"
              />
              <Button variant="secondary" appearance="stroked" onClick={onClose}>
                {t('common:cancel')}
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {t('data:edit_table.button_accept')}
              </Button>
            </div>
          </footer>
        </div>
      </aside>
      <UnsavedChangesDialog
        open={isUnsavedChangesDialogOpen}
        onOpenChange={setIsUnsavedChangesDialogOpen}
        onConfirm={handleConfirmDiscardChanges}
      />
    </UploadDataDrawerContext.Provider>
  );
}

type EditableAliasProps = { alias: string; onChange: (alias: string) => void };

function EditableAlias({ alias, onChange }: EditableAliasProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAlias, setEditedAlias] = useState(alias);

  const onClose = () => setIsEditing(false);
  const onSave = () => {
    onChange(editedAlias);
    onClose();
  };
  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <input
          value={editedAlias}
          onChange={(e) => setEditedAlias(e.currentTarget.value)}
          onBlur={onClose}
          onKeyUp={(e) => {
            if (e.key === 'Enter') onSave();
            if (e.key === 'Escape') {
              setEditedAlias(alias);
              onClose();
            }
          }}
          className="text-l font-semibold bg-transparent border-b border-transparent hover:border-grey-border focus:border-purple-primary focus:outline-none px-1 min-w-0"
        />
      ) : (
        <>
          <span className="text-l font-semibold text-purple-primary">{alias}</span>
          <Button variant="secondary" appearance="stroked" onClick={() => setIsEditing(true)}>
            <Icon icon="edit-square" className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}

function adaptFieldToTableField(field: DataModelField, index: number): TableField {
  const isSystemField = field.name === 'object_id' || field.name === 'updated_at';
  return {
    id: field.id,
    name: field.name,
    description: field.description,
    dataType: field.dataType as TableField['dataType'],
    tableId: field.tableId,
    isEnum: field.isEnum,
    nullable: field.nullable,
    alias: field.alias ?? field.name,
    hidden: field.hidden ?? false,
    order: field.order ?? index,
    unicityConstraint: field.unicityConstraint,
    ftmProperty: field.ftmProperty,
    semanticType:
      field.name === 'object_id'
        ? 'unique_id'
        : field.name === 'updated_at'
          ? 'last_update'
          : (field.semanticType ?? ('text' as const)),
    semanticSubType: field.name === 'object_id' ? 'opaque_id' : field.semanticSubType,
    currencyExponent: field.currencyExponent,
    decimalPrecision: field.decimalPrecision,
    currencyFieldId: field.currencyFieldId,
    booleanDisplay: field.booleanDisplay,
    foreignkeyTable: field.foreignkeyTable,
    isNew: false,
    locked: isSystemField,
  };
}

function resolveMainTimestampFieldName(tableModel: TableModel): string {
  if (tableModel.mainTimestampFieldName) return tableModel.mainTimestampFieldName;
  const updatedAt = tableModel.fields.find((f) => f.name === 'updated_at');
  if (updatedAt) return updatedAt.name;
  const lastUpdate = tableModel.fields.find((f) => f.semanticType === 'last_update');
  return lastUpdate?.name ?? '';
}

function adaptTableModelToFormValues(tableModel: TableModel): SemanticTableFormValues {
  return {
    tableId: tableModel.id,
    name: tableModel.name,
    alias: tableModel.alias || tableModel.name,
    entityType: tableModel.semanticType ?? 'other',
    subEntity: tableModel.subEntity ?? 'moral',
    belongsToTableId: tableModel.belongsToTableId ?? '',
    fields: tableModel.fields.map(adaptFieldToTableField),
    mainTimestampFieldName: resolveMainTimestampFieldName(tableModel),
    links: [],
    metaData: {},
    isCanceled: false,
    isVisited: true,
  };
}

function adaptLinksToLinkState(links: LinkToSingle[], tableId: string): Record<string, LinkValue> {
  return Object.fromEntries(
    links.map((link) => [
      link.id,
      {
        linkId: link.id,
        name: link.name,
        sourceTableId: tableId,
        tableFieldId: link.childFieldName,
        relationType: 'belongs_to' as const,
        targetTableId: link.parentTableId,
      } satisfies LinkValue,
    ]),
  );
}

function normalizeTablesStateForDirtyCheck(state: Record<string, SemanticTableFormValues>) {
  return Object.values(state)
    .map(({ isVisited: _isVisited, ...table }) => table)
    .sort((a, b) => a.tableId.localeCompare(b.tableId));
}

function normalizeLinksStateForDirtyCheck(state: Record<string, LinkValue>) {
  return Object.values(state).sort((a, b) => a.linkId.localeCompare(b.linkId));
}
