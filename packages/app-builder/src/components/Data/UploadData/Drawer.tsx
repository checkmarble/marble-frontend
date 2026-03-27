import { createSimpleContext } from '@marble/shared';
import { type ReactNode, type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { FormTable, SummaryView } from './FormTable';
import type { FtmEntityV2, LinkValue, RawField, RawLink, TableField } from './uploadData-types';

export type FormTableValue = {
  tableId: string;
  name: string;
  alias: string;
  mainTable: boolean;
  ftmEntity: FtmEntityV2;
  ftmSubEntity: string;
  metaData: Record<string, unknown>;
  isCanceled: boolean;
  isVisited: boolean;
  order: number;
  fields: TableField[];
  mainTimestampFieldId: string;
};

/**
 * Sort table IDs: mainTable first, then by order, canceled last.
 */
function sortedTableIds(tablesState: Record<string, FormTableValue>): string[] {
  return Object.values(tablesState)
    .sort((a, b) => {
      // Canceled always last
      if (a.isCanceled !== b.isCanceled) return a.isCanceled ? 1 : -1;
      // MainTable always first (within non-canceled)
      if (a.mainTable !== b.mainTable) return a.mainTable ? -1 : 1;
      // Then by order
      return a.order - b.order;
    })
    .map((t) => t.tableId);
}

export const UploadDataDrawerContext = createSimpleContext<{
  container: RefObject<HTMLDivElement>;
  data: unknown;
  close: () => void;
  tablesState: Record<string, FormTableValue>;
  updateTableState: (tableId: string, values: Partial<FormTableValue>) => void;
  orderedTableIds: string[];
  reorderTables: (startIndex: number, endIndex: number) => void;
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

  const [tablesState, setTablesState] = useState<Record<string, FormTableValue>>(() => buildInitialTablesState(data));
  const [linksState, setLinksState] = useState<Record<string, LinkValue>>(() => buildInitialLinksState(data));

  useEffect(() => {
    setTablesState(buildInitialTablesState(data));
    setLinksState(buildInitialLinksState(data));
  }, [data]);

  const updateTableState = useCallback((tableId: string, values: Partial<FormTableValue>) => {
    setTablesState((prev) => ({
      ...prev,
      [tableId]: { ...prev[tableId]!, ...values },
    }));
  }, []);

  const orderedTableIds = useMemo(() => sortedTableIds(tablesState), [tablesState]);

  const reorderTables = useCallback((startIndex: number, endIndex: number) => {
    setTablesState((prev) => {
      const ids = sortedTableIds(prev);
      // Move the dragged item
      const [movedId] = ids.splice(startIndex, 1);
      if (!movedId) return prev;
      ids.splice(endIndex, 0, movedId);
      // Reassign order values based on new positions
      const next = { ...prev };
      ids.forEach((id, index) => {
        next[id] = { ...next[id]!, order: index };
      });
      return next;
    });
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
        visible: true,
        hidden: false,
        order: table.fields.length,
        unicityConstraint: 'no_unicity_constraint',
        ftmProperty: '',
        semanticType: undefined,
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
        orderedTableIds,
        reorderTables,
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

function buildInitialTablesState(data: unknown): Record<string, FormTableValue> {
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
    tables.map((table, index) => {
      const rawFields = table.fields ? (Array.isArray(table.fields) ? table.fields : Object.values(table.fields)) : [];

      const fields: TableField[] = rawFields.map((f, i) => ({
        id: f.id,
        name: f.name,
        description: f.description || '',
        dataType: f.data_type,
        tableId: f.table_id || table.id,
        isEnum: f.is_enum ?? false,
        nullable: f.nullable ?? true,
        alias: f.name,
        visible: true,
        hidden: false,
        order: i,
        unicityConstraint: f.unicity_constraint ?? 'no_unicity_constraint',
        ftmProperty: f.ftm_property ?? '',
        semanticType: undefined,
        semanticSubType: undefined,
        isNew: false,
      }));

      // Ensure there's always an object_id field
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
          visible: true,
          hidden: false,
          order: -1,
          unicityConstraint: 'no_unicity_constraint',
          ftmProperty: '',
          semanticType: undefined,
          semanticSubType: undefined,
          isNew: false,
        });
        // Re-index orders
        fields.forEach((f, i) => {
          f.order = i;
        });
      }

      return [
        table.id,
        {
          tableId: table.id,
          name: table.name,
          alias: table.description || table.name.charAt(0).toUpperCase() + table.name.slice(1),
          mainTable: false,
          ftmEntity: 'other' as FtmEntityV2,
          ftmSubEntity: '',
          metaData: {},
          isCanceled: false,
          isVisited: false,
          order: index,
          fields,
          mainTimestampFieldId: '',
        } satisfies FormTableValue,
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
        relationType: 'belongs_to',
        targetTableId: link.parent_table_id,
        sourceTableId: link.child_table_id,
      } satisfies LinkValue,
    ]),
  );
}

export function UploadDataDrawerContent() {
  const { close, tablesState, updateTableState, orderedTableIds } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);

  const isSingleTable = orderedTableIds.length === 1;

  const allVisited = useMemo(
    () => orderedTableIds.length > 0 && orderedTableIds.every((id) => tablesState[id]!.isVisited),
    [tablesState, orderedTableIds],
  );

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

  const [selectedTableId, setSelectedTableId] = useState<string>(() => (isSingleTable ? orderedTableIds[0]! : ''));
  const [showSummary, setShowSummary] = useState(false);

  // Mark selected table as visited
  useEffect(() => {
    if (selectedTableId && tablesState[selectedTableId] && !tablesState[selectedTableId]!.isVisited) {
      updateTableState(selectedTableId, { isVisited: true });
    }
  }, [selectedTableId, tablesState, updateTableState]);

  function handleSave() {
    // TODO: implement save logic
  }

  function handleNextOrSummary() {
    if (allVisited) {
      setShowSummary(true);
      setSelectedTableId('');
      return;
    }
    // Find next unvisited table
    const currentIndex = orderedTableIds.indexOf(selectedTableId);
    const nextUnvisited =
      orderedTableIds.find((id, i) => i > currentIndex && !tablesState[id]!.isVisited) ??
      orderedTableIds.find((id) => !tablesState[id]!.isVisited);
    if (nextUnvisited) {
      setSelectedTableId(nextUnvisited);
    }
  }

  // Empty state: no tables found
  if (orderedTableIds.length === 0) {
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
          <span className="text-xl text-purple-primary">{tablesState[orderedTableIds[0]!]!.name}</span>
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
          <FormTable key={selectedTableId} tableId={selectedTableId} />
        ) : null}
      </div>
      <footer className="flex shrink-0 justify-end gap-v2-md p-v2-lg border-t border-grey-border">
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
      </footer>
    </div>
  );
}
