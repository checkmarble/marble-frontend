import { Callout } from '@app-builder/components/Callout';
import { type DataModelField } from '@app-builder/models';
import { type LinkToSingle, type TableModel } from '@app-builder/models/data-model';
import { useDataModel } from '@app-builder/services/data/data-model';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { inferSemanticTypeFromName } from '../../DataVisualisation/dataFieldsUtils';
import { type FieldValidationError, type ValidationError, validateValues } from '../CreateTable/createTable-types';
import { DrawerContext } from '../Shared/DrawerContext';
import { EntityTypeMenu } from '../Shared/EntityTypeMenu';
import type {
  ChangeRecord,
  LinkValue,
  SemanticTableChangedProperty,
  SemanticTableFormValues,
  TableField,
} from '../Shared/semanticData-types';
import { FormTable } from '../Shared/TableForm';
import { UnsavedChangesDialog } from '../Shared/UnsavedChangesDialog';

export function EditTableDrawer({
  open,
  onClose,
  onSave,
  tableModel,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (
    tableState: SemanticTableFormValues,
    changeSet: ChangeRecord[],
    initialTableState: SemanticTableFormValues,
    initialLinks: LinkValue[],
  ) => Promise<void>;
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
    setLinksState((prev) => {
      const hasBelongsTo = Object.values(prev).some((link) => link.relationType === 'belongs_to');
      return {
        ...prev,
        [linkId]: {
          linkId,
          name: '',
          tableFieldId: '',
          relationType: hasBelongsTo ? 'related' : 'belongs_to',
          targetTableId: '',
          sourceTableId,
          isNew: true,
        },
      };
    });
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
        [tableId]: { ...table, fields },
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
          fields: table.fields.filter((f) => f.id !== fieldId),
        },
      };
    });
  }, []);

  const tableState = tablesState[tableModel.id]!;
  const isSemanticTypeChanged = tableState.entityType !== tableModel.semanticType;

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

    const tableResult = validateValues(values, 'table', t);
    const fieldResult = validateValues(values, 'fields', t);
    const linkResult = validateValues(values, 'links', t);
    const errors: ValidationError[] = [
      ...(!tableResult.ok ? tableResult.errors : []),
      ...(!fieldResult.ok ? fieldResult.errors : []),
      ...(!linkResult.ok ? linkResult.errors : []),
    ];
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    const changeSet = computeChangeSet(
      initialTableStateRef.current[tableModel.id]!,
      tablesState[tableModel.id]!,
      initialLinksStateRef.current,
      linksState,
      tableModel.fields,
    );
    await onSave(
      values,
      changeSet,
      initialTableStateRef.current[tableModel.id]!,
      Object.values(initialLinksStateRef.current),
    );
  }

  const requestClose = useCallback(() => {
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
    <DrawerContext.Provider
      value={{
        container: containerRef,
        data: null,
        close: requestClose,
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
        onClick={requestClose}
      />
      {/* Drawer panel */}
      <aside className="animate-slideRightAndFadeIn fixed right-0 top-0 z-50 h-full w-[max(1280px,70vw)] border-l border-grey-border shadow-lg">
        <div ref={containerRef} className="bg-surface-card flex h-full flex-col overflow-y-auto">
          <header className="flex shrink-0 items-center gap-v2-md border-b border-grey-border p-v2-lg">
            <button type="button" onClick={requestClose} className="rounded-lg p-2 hover:bg-grey-border">
              <Icon icon="x" className="size-5" />
            </button>
            <span className="text-l">{t('data:edit_table.header_prefix')}</span>
            <EditableAlias alias={tableState.alias} onChange={(alias) => updateTableState(tableModel.id, { alias })} />
            {tableState.alias && tableState.alias !== tableState.name && (
              <span className="text-s text-grey-secondary">({tableState.name})</span>
            )}

            <EntityTypeMenu
              entityType={tableState.entityType}
              isChanged={isSemanticTypeChanged}
              onSelect={(entityType) => updateTableState(tableModel.id, { entityType, subEntity: 'moral' })}
            />
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
              <Button variant="secondary" appearance="stroked" onClick={requestClose}>
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
    </DrawerContext.Provider>
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

function adaptFieldToTableField(field: DataModelField): TableField {
  const isSystemField = field.name === 'object_id' || field.name === 'updated_at';
  const { semanticType: fallbackSemanticType, semanticSubType: fallbackSemanticSubType } = inferSemanticTypeFromName(
    field.name,
    field.dataType,
  );
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
    unicityConstraint: field.unicityConstraint,
    ftmProperty: field.ftmProperty,
    semanticType:
      field.name === 'object_id'
        ? 'unique_id'
        : field.name === 'updated_at'
          ? 'last_update'
          : (field.semanticType ?? fallbackSemanticType),
    semanticSubType: field.name === 'object_id' ? 'opaque_id' : (field.semanticSubType ?? fallbackSemanticSubType),
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
    entityType: tableModel.semanticType ?? 'unset',
    subEntity: tableModel.subEntity ?? 'unset',
    belongsToTableId:
      tableModel.belongsToTableId ??
      tableModel.linksToSingle.find((l) => l.relationType === 'belongs_to')?.parentTableId ??
      '',
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
        relationType: link.relationType,
        targetTableId: link.parentTableId,
        isNew: false,
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

function computeChangeSet(
  initialTableState: SemanticTableFormValues,
  currentTableState: SemanticTableFormValues,
  initialLinksState: Record<string, LinkValue>,
  currentLinksState: Record<string, LinkValue>,
  originalModelFields?: DataModelField[],
): ChangeRecord[] {
  const changes: ChangeRecord[] = [];

  // Table-level MOD: compare properties excluding fields, links, isVisited
  const { fields: _if, links: _il, isVisited: _iv1, ...initTableProps } = initialTableState;
  const { fields: _cf, links: _cl, isVisited: _iv2, ...currTableProps } = currentTableState;
  const changedProperties: SemanticTableChangedProperty[] = [];
  for (const key of Object.keys(currTableProps) as SemanticTableChangedProperty[]) {
    if (JSON.stringify(initTableProps[key]) !== JSON.stringify(currTableProps[key])) {
      changedProperties.push(key);
    }
  }
  if (changedProperties.length > 0) {
    changes.push({ type: 'table', operation: 'MOD', changedProperties });
  }

  // Field changes
  const initialFieldMap = new Map(initialTableState.fields.map((f) => [f.id, f]));
  const currentFieldMap = new Map(currentTableState.fields.map((f) => [f.id, f]));
  const originalFieldMap = originalModelFields ? new Map(originalModelFields.map((f) => [f.id, f])) : undefined;

  for (const field of currentTableState.fields) {
    if (field.isNew) {
      changes.push({ type: 'field', operation: 'ADD', objectName: field.name });
    } else {
      const initialField = initialFieldMap.get(field.id);
      if (initialField && JSON.stringify(initialField) !== JSON.stringify(field)) {
        changes.push({ type: 'field', operation: 'MOD', objectId: field.id });
      } else if (initialField && originalFieldMap) {
        // Detect inferred semantic types: the form applies inference from field names,
        // but both initial and current form state have the same inferred values.
        // Compare against the original backend data to detect these as real changes.
        const originalField = originalFieldMap.get(field.id);
        if (originalField) {
          const hasInferredSemanticType = !originalField.semanticType && field.semanticType;
          const hasInferredSemanticSubType = !originalField.semanticSubType && field.semanticSubType;
          if (hasInferredSemanticType || hasInferredSemanticSubType) {
            changes.push({ type: 'field', operation: 'MOD', objectId: field.id });
          }
        }
      }
    }
  }
  for (const initialField of initialTableState.fields) {
    if (!initialField.isNew && !currentFieldMap.has(initialField.id)) {
      changes.push({ type: 'field', operation: 'DEL', objectId: initialField.id });
    }
  }

  // Link changes
  for (const [linkId, link] of Object.entries(currentLinksState)) {
    if (!initialLinksState[linkId]) {
      changes.push({ type: 'link', operation: 'ADD', objectName: link.name });
    } else if (initialLinksState[linkId].relationType !== link.relationType) {
      changes.push({ type: 'link', operation: 'MOD', objectId: linkId, relationshipType: link.relationType });
    }
  }
  for (const linkId of Object.keys(initialLinksState)) {
    if (!currentLinksState[linkId]) {
      changes.push({ type: 'link', operation: 'DEL', objectId: linkId });
    }
  }
  return changes;
}
