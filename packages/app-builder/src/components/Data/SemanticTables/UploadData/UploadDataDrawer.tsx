import { Callout } from '@app-builder/components/Callout';
import { createSimpleContext } from '@marble/shared';
import { type ReactNode, type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { type FieldValidationError, type ValidationError, validateValues } from '../CreateTable/createTable-types';
import type { LinkValue, RawField, RawLink, SemanticTableFormValues, TableField } from '../Shared/semanticData-types';
import { FormTable, SummaryView } from '../Shared/TableForm';

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

export const UploadDataDrawerContext = createSimpleContext<{
  container: RefObject<HTMLDivElement>;
  data: unknown;
  close: () => void;
  tablesState: Record<string, SemanticTableFormValues>;
  updateTableState: (tableId: string, values: Partial<SemanticTableFormValues>) => void;
  tableIds: string[];
  linksState: Record<string, LinkValue>;
  updateLinkState: (linkId: string, values: Partial<LinkValue>) => void;
  addLink: (sourceTableId: string) => void;
  removeLink: (linkId: string) => void;
  getLinksForTable: (tableId: string) => LinkValue[];
  updateField: (tableId: string, fieldId: string, values: Partial<TableField>) => void;
  reorderFields: (tableId: string, startIndex: number, endIndex: number) => void;
  addField: (tableId: string, name: string) => string;
  removeField: (tableId: string, fieldId: string) => void;
}>('UploadDataDrawer');

export type UploadDataDrawerProps = {
  open: boolean;
  data: unknown;
  onClose: () => void;
  children: ReactNode;
};

export function UploadDataDrawer({ open, data, onClose, children }: UploadDataDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [tablesState, setTablesState] = useState<Record<string, SemanticTableFormValues>>(() =>
    buildInitialTablesState(data),
  );
  const [linksState, setLinksState] = useState<Record<string, LinkValue>>(() => buildInitialLinksState(data));

  useEffect(() => {
    setTablesState(buildInitialTablesState(data));
    setLinksState(buildInitialLinksState(data));
  }, [data]);

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
        [tableId]: {
          ...table,
          fields: fields.map((f, i) => ({ ...f, order: i })),
        },
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

  if (!open) return null;

  return (
    <UploadDataDrawerContext.Provider
      value={{
        container: containerRef,
        data,
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
      <div className="animate-overlay-show bg-grey-primary/20 fixed inset-0 z-40 backdrop-blur-xs" onClick={onClose} />
      {/* Drawer panel */}
      <aside className="animate-slideRightAndFadeIn fixed right-0 top-0 z-50 h-full w-[max(1280px,70vw)] border-l border-grey-border shadow-lg">
        <div ref={containerRef} className="bg-surface-card h-full overflow-y-auto">
          {children}
        </div>
      </aside>
    </UploadDataDrawerContext.Provider>
  );
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
    };
  };
  const tables = raw?.data_model?.tables ?? [];
  return Object.fromEntries(
    tables.map((table) => {
      const rawFields = table.fields
        ? Array.isArray(table.fields)
          ? table.fields.map((field) => ({ key: field.name, field }))
          : Object.entries(table.fields).map(([key, field]) => ({ key, field }))
        : [];

      const fields: TableField[] = rawFields.map(({ key, field }, i) => ({
        id: field.id,
        name: key,
        description: field.description || '',
        dataType: field.data_type,
        tableId: field.table_id || table.id,
        isEnum: field.is_enum ?? false,
        nullable: field.nullable ?? true,
        alias: field.name,
        hidden: false,
        order: i,
        unicityConstraint: field.unicity_constraint ?? 'no_unicity_constraint',
        ftmProperty: field.ftm_property,
        semanticType: key === 'object_id' ? 'unique_id' : key === 'updated_at' ? 'last_update' : ('text' as const),
        semanticSubType: key === 'object_id' ? 'opaque_id' : undefined,
        isNew: key !== 'object_id' && key !== 'updated_at',
        locked: key === 'object_id' || key === 'updated_at',
      }));

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
          order: -1,
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
          order: -1,
          unicityConstraint: 'no_unicity_constraint',
          semanticType: 'last_update',
          semanticSubType: undefined,
          isNew: false,
          locked: true,
        });
      }

      fields.forEach((f, i) => {
        f.order = i;
      });

      return [
        table.id,
        {
          tableId: table.id,
          name: table.name,
          alias: table.description || table.name.charAt(0).toUpperCase() + table.name.slice(1),
          entityType: 'other',
          subEntity: 'moral',
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
        tableFieldId: link.child_field_id,
        relationType: 'related',
        targetTableId: link.parent_table_id,
        sourceTableId: link.child_table_id,
      } satisfies LinkValue,
    ]),
  );
}

export function UploadDataDrawerContent() {
  const { close, tablesState, updateTableState, tableIds, getLinksForTable } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);

  const isSingleTable = tableIds.length === 1;

  const allVisited = tableIds.length > 0 && tableIds.every((id) => tablesState[id]!.isVisited);

  const tableOptions = useMemo(
    () =>
      Object.values(tablesState).map((table) => ({
        label: (
          <span className={cn(table.isCanceled && 'line-through opacity-50', table.isVisited && 'text-purple-primary')}>
            {table.name}
          </span>
        ),
        value: table.tableId,
      })),
    [tablesState],
  );

  const [selectedTableId, setSelectedTableId] = useState<string>(() => (isSingleTable ? tableIds[0]! : ''));
  const [showSummary, setShowSummary] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Mark selected table as visited
  useEffect(() => {
    if (selectedTableId && tablesState[selectedTableId] && !tablesState[selectedTableId]!.isVisited) {
      updateTableState(selectedTableId, { isVisited: true });
    }
  }, [selectedTableId, tablesState, updateTableState]);

  // Clear validation errors when switching tables
  useEffect(() => {
    setValidationErrors([]);
  }, [selectedTableId]);

  const errorFieldIds = useMemo(
    () => new Set(validationErrors.filter((e): e is FieldValidationError => e.kind === 'field').map((e) => e.fieldId)),
    [validationErrors],
  );

  function handleSave() {
    // TODO: implement save logic
  }

  function handleNextOrSummary() {
    const tableState = tablesState[selectedTableId];
    if (!tableState) return;
    const values: SemanticTableFormValues = {
      ...tableState,
      links: getLinksForTable(selectedTableId),
    };
    const result = validateValues(values);
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
        <footer className="flex shrink-0 justify-end gap-v2-md p-v2-lg border-t border-grey-border">
          <Button variant="secondary" appearance="stroked" onClick={close}>
            {t('data:upload_data.button_cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {t('data:upload_data.button_save')}
          </Button>
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
      </header>
      <div className="flex-1 overflow-auto px-v2-lg">
        {selectedTableId && tablesState[selectedTableId] ? (
          <FormTable key={selectedTableId} tableId={selectedTableId} errorFieldIds={errorFieldIds} />
        ) : null}
      </div>
      <footer className="flex shrink-0 justify-between gap-v2-md p-v2-lg border-t border-grey-border">
        {validationErrors.length > 0 ? (
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
