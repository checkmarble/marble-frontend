import { Callout } from '@app-builder/components/Callout';
import {
  adaptCreateTableValue,
  adaptLink,
  type FieldValidationError,
  requiresLink,
  type ValidationError,
  validateValues,
} from '@app-builder/components/Data/SemanticTables/CreateTable/createTable-types';
import { useCreateTableMutation } from '@app-builder/queries/data/create-table';
import { useEditSemanticTableMutation } from '@app-builder/queries/data/edit-semantic-table';
import { useDataModel } from '@app-builder/services/data/data-model';
import { useNavigate } from '@remix-run/react';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { inferSemanticTypeFromName } from '../../DataVisualisation/dataFieldsUtils';
import { DrawerContext } from '../Shared/DrawerContext';
import { EntityTypeMenu } from '../Shared/EntityTypeMenu';
import {
  isLinkableTable,
  type LinkValue,
  type RawField,
  type RawLink,
  type SemanticTableFormValues,
  type TableField,
} from '../Shared/semanticData-types';
import { FormTable, SummaryView } from '../Shared/TableForm';
import { UnsavedChangesDialog } from '../Shared/UnsavedChangesDialog';

/**
 * Get table IDs with canceled last.
 */
function sortedTableIds(tablesState: Record<string, SemanticTableFormValues>): string[] {
  return Object.values(tablesState)
    .sort((a, b) => {
      if (a.isCanceled !== b.isCanceled) return a.isCanceled ? 1 : -1;
      return 0;
    })
    .map((t) => t.tableId);
}

export type UploadDataDrawerProps = {
  open: boolean;
  data: unknown;
  onClose: () => void;
  children: ReactNode;
};

export function UploadDataDrawer({ open, data, onClose, children }: UploadDataDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = useState(false);

  const [tablesState, setTablesState] = useState<Record<string, SemanticTableFormValues>>(() =>
    buildInitialTablesState(data),
  );
  const [linksState, setLinksState] = useState<Record<string, LinkValue>>(() => buildInitialLinksState(data));

  const initialTablesSnapshot = useMemo(() => normalizeTablesStateForDirtyCheck(buildInitialTablesState(data)), [data]);
  const initialLinksSnapshot = useMemo(() => normalizeLinksStateForDirtyCheck(buildInitialLinksState(data)), [data]);

  useEffect(() => {
    setIsUnsavedChangesDialogOpen(false);
    setTablesState(buildInitialTablesState(data));
    setLinksState(buildInitialLinksState(data));
  }, [data]);

  const normalizedTablesState = useMemo(() => normalizeTablesStateForDirtyCheck(tablesState), [tablesState]);
  const normalizedLinksState = useMemo(() => normalizeLinksStateForDirtyCheck(linksState), [linksState]);

  const isDirty = useMemo(
    () =>
      JSON.stringify(normalizedTablesState) !== JSON.stringify(initialTablesSnapshot) ||
      JSON.stringify(normalizedLinksState) !== JSON.stringify(initialLinksSnapshot),
    [initialLinksSnapshot, initialTablesSnapshot, normalizedLinksState, normalizedTablesState],
  );

  const handleBackdropClose = useCallback(() => {
    if (!isDirty) {
      onClose();
      return;
    }
    setIsUnsavedChangesDialogOpen(true);
  }, [isDirty, onClose]);

  const handleConfirmDiscardChanges = useCallback(() => {
    setIsUnsavedChangesDialogOpen(false);
    onClose();
  }, [onClose]);

  const updateTableState = useCallback((tableId: string, values: Partial<SemanticTableFormValues>) => {
    setTablesState((prev) => ({
      ...prev,
      [tableId]: { ...prev[tableId]!, ...values },
    }));
  }, []);

  const tableIds = useMemo(() => sortedTableIds(tablesState), [tablesState]);

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
        relationType: 'related',
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
    (tableId: string) => {
      return Object.values(linksState).filter((link) => link.sourceTableId === tableId);
    },
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

  if (!open) return null;

  return (
    <DrawerContext.Provider
      value={{
        container: containerRef,
        data,
        close: handleBackdropClose,
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
        <div ref={containerRef} className="bg-surface-card h-full overflow-y-auto">
          {children}
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

function normalizeTablesStateForDirtyCheck(state: Record<string, SemanticTableFormValues>) {
  return Object.values(state)
    .map(({ isVisited: _isVisited, ...table }) => table)
    .sort((a, b) => a.tableId.localeCompare(b.tableId));
}

function normalizeLinksStateForDirtyCheck(state: Record<string, LinkValue>) {
  return Object.values(state).sort((a, b) => a.linkId.localeCompare(b.linkId));
}

function buildInitialTablesState(data: unknown): Record<string, SemanticTableFormValues> {
  const raw = data as {
    data_model?: {
      tables?: Array<{
        id: string;
        name: string;
        description?: string;
        fields?: Record<string, RawField> | RawField[];
      }>;
      links?: RawLink[];
    };
  };
  const tables = raw?.data_model?.tables ?? [];

  // Build a lookup from child_field_id → parent_table_id for foreign key detection
  const foreignKeyMap = new Map<string, string>();
  for (const link of raw?.data_model?.links ?? []) {
    foreignKeyMap.set(link.child_field_id, link.parent_table_id);
  }

  return Object.fromEntries(
    tables.map((table) => {
      const rawFields = table.fields
        ? Array.isArray(table.fields)
          ? table.fields.map((field) => ({ key: field.name, field }))
          : Object.entries(table.fields).map(([key, field]) => ({ key, field }))
        : [];

      const fields: TableField[] = rawFields.map(({ key, field }) => {
        const foreignkeyTable = foreignKeyMap.get(field.id);
        const isForeignKey = foreignkeyTable !== undefined;
        const { semanticType, semanticSubType } = inferSemanticTypeFromName(key, field.data_type);
        return {
          id: field.id,
          name: key,
          description: field.description || '',
          dataType: field.data_type,
          tableId: field.table_id || table.id,
          isEnum: field.is_enum ?? false,
          nullable: field.nullable ?? true,
          alias: field.name,
          hidden: false,
          unicityConstraint: field.unicity_constraint ?? 'no_unicity_constraint',
          ftmProperty: field.ftm_property,
          semanticType: isForeignKey
            ? 'foreign_key'
            : key === 'object_id'
              ? 'unique_id'
              : key === 'updated_at'
                ? 'last_update'
                : semanticType,
          semanticSubType: key === 'object_id' ? 'opaque_id' : semanticSubType,
          foreignkeyTable,
          isNew: key !== 'object_id' && key !== 'updated_at',
          locked: key === 'object_id' || key === 'updated_at',
        };
      });

      // Ensure required system fields are always present
      if (!fields.some((f) => f.name === 'object_id')) {
        fields.unshift({
          id: `${table.id}_object_id`,
          name: 'object_id',
          description: 'ID',
          dataType: 'String',
          tableId: table.id,
          isEnum: false,
          nullable: false,
          alias: 'object_id',
          hidden: false,
          unicityConstraint: 'no_unicity_constraint',
          semanticType: 'unique_id',
          semanticSubType: 'opaque_id',
          isNew: false,
          locked: true,
        });
      }

      if (!fields.some((f) => f.name === 'updated_at')) {
        fields.splice(1, 0, {
          id: `${table.id}_updated_at`,
          name: 'updated_at',
          description: '',
          dataType: 'Timestamp',
          tableId: table.id,
          isEnum: false,
          nullable: false,
          alias: 'updated_at',
          hidden: false,
          unicityConstraint: 'no_unicity_constraint',
          semanticType: 'last_update',
          semanticSubType: undefined,
          isNew: false,
          locked: true,
        });
      }

      return [
        table.id,
        {
          tableId: table.id,
          name: table.name,
          alias: table.description || table.name.charAt(0).toUpperCase() + table.name.slice(1),
          entityType: 'unset',
          subEntity: 'unset',
          belongsToTableId: '',
          metaData: {},
          isCanceled: false,
          isVisited: false,
          fields,
          mainTimestampFieldName: '',
          links: [],
        } satisfies SemanticTableFormValues,
      ];
    }),
  );
}

function buildInitialLinksState(data: unknown): Record<string, LinkValue> {
  const raw = data as {
    data_model?: { links?: RawLink[] };
  };
  const links = raw?.data_model?.links ?? [];
  return Object.fromEntries(
    links.map((link) => [
      link.id,
      {
        linkId: link.id,
        name: link.name,
        tableFieldId: link.child_field_name,
        relationType: 'related',
        targetTableId: link.parent_table_id,
        sourceTableId: link.child_table_id,
      } satisfies LinkValue,
    ]),
  );
}

export function UploadDataDrawerContent() {
  const { close, tablesState, updateTableState, tableIds, getLinksForTable } = DrawerContext.useValue();
  const { t } = useTranslation(['data']);
  const createTableMutation = useCreateTableMutation();
  const editTableMutation = useEditSemanticTableMutation();
  const navigate = useNavigate();
  const dataModel = useDataModel();

  const isSingleTable = tableIds.length === 1;

  const allVisited = tableIds.length > 0 && tableIds.every((id) => tablesState[id]!.isVisited);

  // A table can be the target of a transaction/event/account link if it is a person/other table
  // (or has no entity type yet). Check both already-persisted tables and tables being configured.
  const canSelectTypeThatNeedsAPerson = useMemo(
    () =>
      dataModel.some(isLinkableTable) ||
      Object.values(tablesState).some((t) => t.entityType !== 'unset' && !requiresLink(t.entityType)),
    [dataModel, tablesState],
  );

  const tableOptions = useMemo(
    () =>
      Object.values(tablesState).map((table) => ({
        label: (
          <span
            className={cn(table.isCanceled && 'line-through opacity-50', table.isVisited && 'text-purple-primary')}
            title={table.name !== table.alias ? table.name : undefined}
          >
            {table.alias || table.name}
          </span>
        ),
        value: table.tableId,
      })),
    [tablesState],
  );
  const [selectedTableId, setSelectedTableId] = useState<string>(() => (isSingleTable ? tableIds[0]! : ''));

  const belongsToTableOptions = useMemo(
    () => [
      ...dataModel.filter(isLinkableTable).map((t) => ({ value: t.id, label: t.alias || t.name })),
      ...Object.values(tablesState)
        .filter(
          (t) =>
            !t.isCanceled && t.entityType !== 'unset' && !requiresLink(t.entityType) && t.tableId !== selectedTableId,
        )
        .map((t) => ({ value: t.tableId, label: t.alias || t.name })),
    ],
    [dataModel, tablesState, selectedTableId],
  );

  const [showSummary, setShowSummary] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [saveErrors, setSaveErrors] = useState<string[]>([]);

  // Mark selected table as visited
  useEffect(() => {
    if (selectedTableId && tablesState[selectedTableId] && !tablesState[selectedTableId]!.isVisited) {
      updateTableState(selectedTableId, { isVisited: true });
    }
  }, [selectedTableId, tablesState, updateTableState]);

  // Clear validation/save errors when switching tables
  useEffect(() => {
    setValidationErrors([]);
    setSaveErrors([]);
  }, [selectedTableId]);

  const errorFieldIds = useMemo(
    () => new Set(validationErrors.filter((e): e is FieldValidationError => e.kind === 'field').map((e) => e.fieldId)),
    [validationErrors],
  );

  async function handleSave() {
    const nonCanceledTableIds = tableIds.filter((id) => !tablesState[id]!.isCanceled);

    // rawToBackend maps raw JSON table IDs → real backend IDs as tables are created
    const rawToBackend = new Map<string, string>();
    // creatingIds is the set of raw IDs we are about to create (used to detect internal links)
    const creatingIds = new Set(nonCanceledTableIds);
    // deferred links per table that couldn't be included at creation time (circular refs)
    const needsLinkEdit = new Map<string, LinkValue[]>();

    const translateLink = (link: LinkValue): LinkValue => ({
      ...link,
      targetTableId: rawToBackend.get(link.targetTableId) ?? link.targetTableId,
    });

    const errors: string[] = [];

    // Person/other tables must be saved before transaction/event/account tables so that
    // belongsToTableId references resolve correctly on the backend.
    const requiresLinkEntity = (rawId: string) => {
      const et = tablesState[rawId]!.entityType;
      return requiresLink(et === 'unset' ? '' : et);
    };
    const pending = [...nonCanceledTableIds].sort((a, b) => {
      const aNeeds = requiresLinkEntity(a);
      const bNeeds = requiresLinkEntity(b);
      if (aNeeds === bNeeds) return 0;
      return aNeeds ? 1 : -1; // tables that need a link go last
    });

    // Returns true if the table's belongsToTableId dependency (if any) is not yet resolved
    const hasPendingBelongsTo = (rawId: string) => {
      const belongsToId = tablesState[rawId]!.belongsToTableId;
      return !!belongsToId && creatingIds.has(belongsToId) && !rawToBackend.has(belongsToId);
    };

    // Translates belongsToTableId from raw JSON ID → backend ID
    const translateBelongsTo = (tableState: SemanticTableFormValues): string =>
      rawToBackend.get(tableState.belongsToTableId) ?? tableState.belongsToTableId;

    while (pending.length > 0) {
      let progress = false;
      const snapshot = [...pending];

      for (const rawId of snapshot) {
        const allLinks = getLinksForTable(rawId);
        const internalLinks = allLinks.filter((l) => creatingIds.has(l.targetTableId));
        const unresolvedLinks = internalLinks.filter((l) => !rawToBackend.has(l.targetTableId));

        // Also wait for the belongsToTableId target to be created first
        if (unresolvedLinks.length > 0 || hasPendingBelongsTo(rawId)) continue;

        // All dependencies resolved — create with full translated links and belongsToTableId
        const tableState = tablesState[rawId]!;
        const values: SemanticTableFormValues = {
          ...tableState,
          belongsToTableId: translateBelongsTo(tableState),
          links: allLinks.map(translateLink),
        };
        const result = await createTableMutation.mutateAsync(adaptCreateTableValue(values));
        if (!result.success) {
          errors.push(result.message ?? `Failed to create table "${tableState.name}"`);
          pending.splice(pending.indexOf(rawId), 1);
          progress = true;
          continue;
        }

        rawToBackend.set(rawId, result.data.id);
        pending.splice(pending.indexOf(rawId), 1);
        progress = true;
      }

      if (!progress && pending.length > 0) {
        // Deadlock: circular link references — pick the first table whose belongsToTableId
        // is already resolved (person/other tables never have one, so they go first)
        const rawId = pending.find((id) => !hasPendingBelongsTo(id)) ?? pending[0]!;
        const allLinks = getLinksForTable(rawId);
        const resolved = allLinks.filter((l) => !creatingIds.has(l.targetTableId) || rawToBackend.has(l.targetTableId));
        const unresolved = allLinks.filter(
          (l) => creatingIds.has(l.targetTableId) && !rawToBackend.has(l.targetTableId),
        );

        const tableState = tablesState[rawId]!;
        const values: SemanticTableFormValues = {
          ...tableState,
          belongsToTableId: translateBelongsTo(tableState),
          links: resolved.map(translateLink),
        };
        const result = await createTableMutation.mutateAsync(adaptCreateTableValue(values));
        if (!result.success) {
          errors.push(result.message ?? `Failed to create table "${tableState.name}"`);
        } else {
          rawToBackend.set(rawId, result.data.id);
          if (unresolved.length > 0) {
            needsLinkEdit.set(rawId, unresolved);
          }
        }
        pending.splice(pending.indexOf(rawId), 1);
      }
    }

    if (errors.length > 0) {
      setSaveErrors(errors);
      return;
    }

    // Edit phase: add deferred links whose targets are now all resolved
    for (const [rawId, links] of needsLinkEdit) {
      const backendId = rawToBackend.get(rawId);
      if (!backendId) continue;
      const result = await editTableMutation.mutateAsync({
        tableId: backendId,
        links: links.map(translateLink).map((link) => ({ op: 'ADD' as const, data: adaptLink(link) })),
      });
      if (!result.success) {
        errors.push(result.message ?? `Failed to add links for table "${tablesState[rawId]!.name}"`);
      }
    }

    if (errors.length > 0) {
      setSaveErrors(errors);
      return;
    }

    navigate('/data/list');
  }

  function handleNextOrSummary() {
    const tableState = tablesState[selectedTableId];
    if (!tableState) return;
    const values: SemanticTableFormValues = {
      ...tableState,
      links: getLinksForTable(selectedTableId),
    };
    const result = validateValues(values, 'all', t);
    if (!result.ok) {
      setValidationErrors(result.errors);
      return;
    }
    setValidationErrors([]);
    if (allVisited) {
      setShowSummary(true);
      setSelectedTableId('');
      return;
    }
    // Find next unvisited table
    const currentIndex = tableIds.indexOf(selectedTableId);
    const nextUnvisited =
      tableIds.find((id, i) => i > currentIndex && !tablesState[id]!.isVisited) ??
      tableIds.find((id) => !tablesState[id]!.isVisited);
    if (nextUnvisited) {
      setSelectedTableId(nextUnvisited);
    }
  }

  // Empty state: no tables found
  if (tableIds.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 gap-v2-md items-center p-v2-lg">
          <button type="button" onClick={close} className="p-2 rounded-lg hover:bg-grey-border">
            <Icon icon="x" className="size-5" />
          </button>
          <h3 className="text-l font-semibold">{t('data:upload_data.title')}</h3>
        </header>
        <div className="flex flex-1 items-center justify-center px-v2-lg">
          <p className="text-m text-grey-secondary text-center">{t('data:upload_data.empty_state')}</p>
        </div>
        <footer className="flex shrink-0 justify-end gap-v2-md p-v2-lg border-t border-grey-border">
          <Button variant="secondary" appearance="stroked" onClick={close}>
            {t('data:upload_data.button_cancel')}
          </Button>
        </footer>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 gap-v2-md items-center p-v2-lg">
          <button type="button" onClick={() => setShowSummary(false)} className="p-2 rounded-lg hover:bg-grey-border">
            <Icon icon="arrow-left" className="size-5" />
          </button>
          <h3 className="text-l font-semibold">{t('data:upload_data.summary_title')}</h3>
        </header>
        <div className="flex-1 overflow-auto px-v2-lg">
          <SummaryView />
        </div>
        <footer className="flex shrink-0 justify-between gap-v2-md p-v2-lg border-t border-grey-border">
          {saveErrors.length > 0 ? (
            <Callout color="red" icon="lightbulb" iconColor="red">
              <ul className="flex flex-col gap-v2-xs pl-3">
                {saveErrors.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </Callout>
          ) : (
            <div />
          )}
          <div className="flex justify-end gap-v2-md">
            <Button variant="secondary" appearance="stroked" onClick={close}>
              {t('data:upload_data.button_cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('data:upload_data.button_save')}
            </Button>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 gap-v2-md items-center p-v2-lg">
        <button type="button" onClick={close} className="p-2 rounded-lg hover:bg-grey-border">
          <Icon icon="x" className="size-5" />
        </button>
        <h3 className="text-l font-semibold">{t('data:upload_data.title')}</h3>
        {isSingleTable ? (
          <span className="text-xl text-purple-primary">{tablesState[tableIds[0]!]!.name}</span>
        ) : (
          <SelectV2
            value={selectedTableId}
            placeholder={t('data:upload_data.select_table_placeholder')}
            onChange={setSelectedTableId}
            options={tableOptions}
            className="w-60"
          />
        )}
        {selectedTableId && tablesState[selectedTableId] ? (
          <>
            <EntityTypeMenu
              entityType={tablesState[selectedTableId].entityType}
              isChanged={tablesState[selectedTableId].entityType === 'unset'}
              onSelect={(entityType) =>
                updateTableState(selectedTableId, {
                  entityType,
                  subEntity: 'moral',
                  ...(!requiresLink(entityType) && { belongsToTableId: '' }),
                })
              }
              canSelectTypeThatNeedsAPerson={canSelectTypeThatNeedsAPerson}
            />
            {requiresLink(
              tablesState[selectedTableId].entityType === 'unset' ? '' : tablesState[selectedTableId].entityType,
            ) ? (
              <SelectV2
                value={tablesState[selectedTableId].belongsToTableId || ''}
                placeholder={t('data:upload_data.belongs_to_table_placeholder')}
                onChange={(value) => updateTableState(selectedTableId, { belongsToTableId: value })}
                options={belongsToTableOptions}
                className="w-60"
              />
            ) : null}
          </>
        ) : null}
      </header>
      <div className="flex-1 overflow-auto px-v2-lg">
        {selectedTableId && tablesState[selectedTableId] ? (
          <FormTable key={selectedTableId} tableId={selectedTableId} errorFieldIds={errorFieldIds} />
        ) : (
          <p className="text-s text-grey-secondary">{t('data:upload_data.no_table_selected')}</p>
        )}
      </div>
      <footer className="flex shrink-0 justify-between gap-v2-md p-v2-lg border-t border-grey-border">
        {saveErrors.length > 0 ? (
          <Callout color="red" icon="lightbulb" iconColor="red">
            <ul className="flex flex-col gap-v2-xs pl-3">
              {saveErrors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </Callout>
        ) : validationErrors.length > 0 ? (
          <Callout color="red" icon="lightbulb" iconColor="red">
            <ul className="flex flex-col gap-v2-xs pl-3">
              {validationErrors.map((e, i) => (
                <li key={i}>{e.message}</li>
              ))}
            </ul>
          </Callout>
        ) : (
          <div />
        )}
        <div className="flex justify-end gap-v2-md">
          {!isSingleTable ? (
            <Button
              variant="secondary"
              appearance="stroked"
              onClick={() => {
                if (selectedTableId) {
                  const current = tablesState[selectedTableId];
                  updateTableState(selectedTableId, { isCanceled: !current?.isCanceled });
                }
              }}
            >
              {selectedTableId && tablesState[selectedTableId]?.isCanceled
                ? t('data:upload_data.button_restore')
                : t('data:upload_data.button_cancel')}
            </Button>
          ) : null}
          {isSingleTable ? (
            <Button variant="primary" onClick={handleSave}>
              {t('data:upload_data.button_save')}
            </Button>
          ) : (
            <Button variant="primary" onClick={handleNextOrSummary}>
              {allVisited ? t('data:upload_data.button_review') : t('data:upload_data.button_next_table')}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
