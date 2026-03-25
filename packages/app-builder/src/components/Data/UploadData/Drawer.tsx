import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { createSimpleContext, useCallbackRef } from '@marble/shared';
import { useForm, useStore } from '@tanstack/react-form';
import { type ReactNode, type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Input, SelectV2, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

const ftmEntities = ['person', 'account', 'transaction', 'event', 'other'] as const;
const ftmEntityPersonOptions = ['moral', 'natural', 'generic'] as const;
const ftmEntityOtherOptions = ['vessel', 'airplane'] as const;

type FtmEntityV2 = (typeof ftmEntities)[number];

type FormTableValue = {
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
}>('UploadDataDrawer');

export type UploadDataDrawerProps = {
  open: boolean;
  data: unknown;
  onClose: () => void;
  children: ReactNode;
};

function buildInitialTablesState(data: unknown): Record<string, FormTableValue> {
  const raw = data as {
    data_model?: { tables?: Array<{ id: string; name: string; description?: string }> };
  };
  const tables = raw?.data_model?.tables ?? [];
  return Object.fromEntries(
    tables.map((table, index) => [
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
      } satisfies FormTableValue,
    ]),
  );
}

export function UploadDataDrawer({ open, data, onClose, children }: UploadDataDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [tablesState, setTablesState] = useState<Record<string, FormTableValue>>(() => buildInitialTablesState(data));

  useEffect(() => {
    setTablesState(buildInitialTablesState(data));
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
      }}
    >
      {/* Backdrop */}
      <div className="animate-overlay-show bg-grey-primary/20 fixed inset-0 z-40 backdrop-blur-xs" onClick={onClose} />
      {/* Drawer panel */}
      <aside className="animate-slideRightAndFadeIn fixed right-0 top-0 z-50 h-full w-[max(700px,50vw)] border-l border-grey-border shadow-lg">
        <div ref={containerRef} className="bg-surface-card h-full overflow-y-auto">
          {children}
        </div>
      </aside>
    </UploadDataDrawerContext.Provider>
  );
}

export function UploadDataDrawerContent() {
  const { data, close, tablesState, updateTableState, orderedTableIds } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);

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

  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);

  // Mark selected table as visited
  useEffect(() => {
    if (selectedTableId && tablesState[selectedTableId] && !tablesState[selectedTableId]!.isVisited) {
      updateTableState(selectedTableId, { isVisited: true });
    }
  }, [selectedTableId, tablesState, updateTableState]);

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
          <Button variant="primary">{t('data:upload_data.button_upload')}</Button>
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
        <SelectV2
          value={selectedTableId}
          placeholder={t('data:upload_data.select_table_placeholder')}
          onChange={setSelectedTableId}
          options={tableOptions}
          className="w-60"
        />
      </header>
      <div className="flex-1 overflow-auto px-v2-lg">
        {selectedTableId && tablesState[selectedTableId] ? (
          <FormTable key={selectedTableId} tableId={selectedTableId} />
        ) : null}
        <pre className="text-xs p-4 bg-grey-border rounded-lg mt-4">{JSON.stringify(data, null, 2)}</pre>
      </div>
      <footer className="flex shrink-0 justify-end gap-v2-md p-v2-lg border-t border-grey-border">
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
        <Button variant="primary" onClick={handleNextOrSummary}>
          {allVisited ? t('data:upload_data.button_review') : t('data:upload_data.button_upload')}
        </Button>
      </footer>
    </div>
  );
}

function FormTable({ tableId }: { tableId: string }) {
  const { tablesState, updateTableState } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);
  const tableState = tablesState[tableId]!;

  const form = useForm({
    defaultValues: tableState,
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  // Persist form values to context on unmount (table switch)
  useEffect(() => {
    return () => {
      updateTableState(tableId, form.state.values);
    };
  }, [tableId, updateTableState, form]);

  const ftmEntityOptions = useMemo(
    () =>
      ftmEntities.map((entity) => ({
        label: t(`data:upload_data.ftm_entity.${entity}`),
        value: entity,
      })),
    [t],
  );

  const selectedFtmEntity = useStore(form.store, (state) => state.values.ftmEntity);

  const subEntityOptions = useMemo(() => {
    if (selectedFtmEntity === 'person') {
      return ftmEntityPersonOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_person.${sub}`),
        value: sub,
      }));
    }
    if (selectedFtmEntity === 'other') {
      return ftmEntityOtherOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_other.${sub}`),
        value: sub,
      }));
    }
    return [];
  }, [selectedFtmEntity, t]);

  const hasSubEntity = selectedFtmEntity === 'person' || selectedFtmEntity === 'other';

  return (
    <div className="flex flex-col gap-v2-lg">
      <section className="flex flex-col gap-v2-md">
        <h4 className="text-m font-semibold">{t('data:upload_data.general_settings')}</h4>
        <div className="flex items-center gap-v2-md">
          <form.Field name="alias">
            {(field) => (
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                placeholder={t('data:upload_data.name_placeholder')}
                className="flex-1"
              />
            )}
          </form.Field>
          <form.Field name="ftmEntity">
            {(field) => (
              <SelectV2
                value={field.state.value}
                placeholder={t('data:upload_data.object_placeholder')}
                onChange={(value) => {
                  field.handleChange(value as FtmEntityV2);
                  form.setFieldValue('ftmSubEntity', '');
                }}
                options={ftmEntityOptions}
                className="flex-1"
              />
            )}
          </form.Field>
          {hasSubEntity ? (
            <form.Field name="ftmSubEntity">
              {(field) => (
                <SelectV2
                  value={field.state.value}
                  placeholder={t('data:upload_data.sub_object_placeholder')}
                  onChange={field.handleChange}
                  options={subEntityOptions}
                  className="flex-1"
                />
              )}
            </form.Field>
          ) : null}
          <form.Field name="mainTable">
            {(field) => (
              <label className="flex shrink-0 items-center gap-v2-sm cursor-pointer">
                <Switch checked={field.state.value} onCheckedChange={(checked) => field.handleChange(checked)} />
                <span className="text-s">{t('data:upload_data.main_table')}</span>
              </label>
            )}
          </form.Field>
        </div>
      </section>
    </div>
  );
}

function SummaryView() {
  const { orderedTableIds, reorderTables } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);

  const handleDragEnd = useCallbackRef((result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) {
      return;
    }
    reorderTables(result.source.index, result.destination.index);
  });

  return (
    <div className="flex flex-col gap-v2-md">
      <h4 className="text-m font-semibold">{t('data:upload_data.tables_label')}</h4>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="summary-tables">
          {(dropProvided) => (
            <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="flex flex-col gap-v2-md">
              {orderedTableIds.map((tableId, index) => (
                <Draggable key={tableId} draggableId={tableId} index={index}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={cn(snapshot.isDragging && 'opacity-80')}
                    >
                      <SummaryTableRow tableId={tableId} dragHandleProps={dragProvided.dragHandleProps} />
                    </div>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

function SummaryTableRow({
  tableId,
  dragHandleProps,
}: {
  tableId: string;
  dragHandleProps: React.HTMLAttributes<HTMLElement> | null | undefined;
}) {
  const { tablesState, updateTableState } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);
  const tableState = tablesState[tableId]!;

  const form = useForm({
    defaultValues: tableState,
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  // Sync form -> context on every change
  const formValues = useStore(form.store, (state) => state.values);
  useEffect(() => {
    updateTableState(tableId, formValues);
  }, [tableId, formValues, updateTableState]);

  const ftmEntityOptions = useMemo(
    () =>
      ftmEntities.map((entity) => ({
        label: t(`data:upload_data.ftm_entity.${entity}`),
        value: entity,
      })),
    [t],
  );

  const selectedFtmEntity = useStore(form.store, (state) => state.values.ftmEntity);

  const subEntityOptions = useMemo(() => {
    if (selectedFtmEntity === 'person') {
      return ftmEntityPersonOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_person.${sub}`),
        value: sub,
      }));
    }
    if (selectedFtmEntity === 'other') {
      return ftmEntityOtherOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_other.${sub}`),
        value: sub,
      }));
    }
    return [];
  }, [selectedFtmEntity, t]);

  const hasSubEntity = selectedFtmEntity === 'person' || selectedFtmEntity === 'other';

  // In summary, show sub-entity select if applicable, otherwise main entity select
  const displayedOptions = hasSubEntity && subEntityOptions.length > 0 ? subEntityOptions : ftmEntityOptions;
  const selectedFtmSubEntity = useStore(form.store, (state) => state.values.ftmSubEntity);
  const displayedValue = hasSubEntity && selectedFtmSubEntity ? selectedFtmSubEntity : selectedFtmEntity;

  return (
    <div className="flex items-center gap-v2-md">
      <div {...dragHandleProps} className="flex shrink-0 items-center">
        <Icon icon="drag" className="size-4 text-grey-secondary cursor-grab" />
      </div>
      <div
        className={cn(
          'flex items-center gap-v2-md rounded-lg border border-grey-border p-v2-md',
          tableState.isCanceled && 'opacity-50',
        )}
      >
        <form.Field name="alias">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              placeholder={t('data:upload_data.name_placeholder')}
              className={cn('flex-1', tableState.isCanceled && 'line-through')}
              disabled={tableState.isCanceled}
            />
          )}
        </form.Field>
        <SelectV2
          value={displayedValue}
          placeholder={t('data:upload_data.object_placeholder')}
          onChange={(value) => {
            const isMainEntity = ftmEntities.includes(value as FtmEntityV2);
            if (isMainEntity) {
              form.setFieldValue('ftmEntity', value as FtmEntityV2);
              form.setFieldValue('ftmSubEntity', '');
            } else {
              form.setFieldValue('ftmSubEntity', value);
            }
          }}
          options={displayedOptions}
          className="w-48"
          disabled={tableState.isCanceled}
        />
        <form.Field name="mainTable">
          {(field) => (
            <label className="flex shrink-0 items-center gap-v2-sm cursor-pointer">
              <Switch
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked)}
                disabled={tableState.isCanceled}
              />
              <span className="text-s">{t('data:upload_data.main_table')}</span>
            </label>
          )}
        </form.Field>
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => updateTableState(tableId, { isCanceled: !tableState.isCanceled })}
      >
        <Icon icon={tableState.isCanceled ? 'restart-alt' : 'delete'} className="size-4" />
      </Button>
    </div>
  );
}
