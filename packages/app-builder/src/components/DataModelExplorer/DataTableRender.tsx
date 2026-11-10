import {
  type ClientDataListResponse,
  type ClientObjectDetail,
  DataModel,
  type DataModelField,
  FieldStatistics,
  isRequestTimeoutError,
  type NavigationOption,
  TableModel,
} from '@app-builder/models';
import { isEnumField } from '@app-builder/models/enum-values';
import { useClientObjectListQuery } from '@app-builder/queries/client-object-list';
import { parseUnknownData } from '@app-builder/utils/parse';
import { createColumnHelper, flexRender, useTable as useTanStackTable } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type ReactElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match, P } from 'ts-pattern';
import type { MarbleTableFeatures } from 'ui-design-system';
import { Button, cn, MenuCommand, marbleTableFeatures, Popover } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Callout } from '../Callout';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { EnumTag } from '../Data/EnumTag';
import { FormatData } from '../FormatData';
import { Spinner } from '../Spinner';
import { ClientObjectAnnotationPopover } from './ClientObjectAnnotationPopover';
import { ColumnFilterChips, ColumnFilterPopover } from './ColumnFilter';
import { ColumnSettingsPanel } from './ColumnSettingsPanel';
import { type ColumnFilters, isColumnFilterActive, toExplorationFilters } from './column-filters';
import { useColumnPrefs } from './column-prefs';
import { type DataModelExplorerNavigationTab } from './types';

const CHARACTER_WIDTH = 8;
const DEFAULT_CELL_WIDTH = 300;

export type DataTableRenderProps = {
  caseId?: string;
  item: DataModelExplorerNavigationTab;
  dataModel: DataModel;
  filters: ColumnFilters;
  onFiltersChange: (filters: ColumnFilters) => void;
  navigateTo: (tabItem: DataModelExplorerNavigationTab) => void;
};

const FILTER_DEBOUNCE_MS = 400;

export function DataTableRender({
  caseId,
  dataModel,
  item,
  filters,
  onFiltersChange,
  navigateTo,
}: DataTableRenderProps) {
  const { t } = useTranslation(['common', 'cases']);
  const currentTable = dataModel.find((t) => t.name === item.targetTableName);
  const sourceField = item.sourceObject[item.sourceFieldName];
  const filterFieldValue = typeof sourceField === 'string' || typeof sourceField === 'number' ? sourceField : '';

  // Filters are applied by the server: wait for the user to stop typing before querying.
  const [appliedFilters, setAppliedFilters] = useState(filters);
  useEffect(() => {
    const timeout = setTimeout(() => setAppliedFilters(filters), FILTER_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [filters]);
  // Memoized: relative date filters resolve against the current time, which must not change the
  // query on every render.
  const explorationFilters = useMemo(() => toExplorationFilters(appliedFilters), [appliedFilters]);

  const dataListQuery = useClientObjectListQuery({
    tableName: item.targetTableName,
    params: {
      sourceTableName: item.sourceTableName,
      filterFieldName: item.filterFieldName,
      filterFieldValue,
      orderingFieldName: item.orderingFieldName,
      ...(explorationFilters.length > 0 ? { filters: explorationFilters } : {}),
    },
  });

  if (!currentTable) {
    return (
      <Callout color="red" icon="error" iconColor="red">
        {t('common:global_error')}
      </Callout>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-sm">
      <ColumnFilterChips table={currentTable} filters={filters} onChange={onFiltersChange} />
      {match(dataListQuery)
        .with({ isPending: true }, () => (
          <div className="flex min-h-60 flex-1 items-center justify-center">
            <Spinner className="size-6" />
          </div>
        ))
        // A failed "load more" keeps `data`: the rows already loaded stay on screen.
        .with({ data: P.nonNullable }, (query) => (
          <DataTable
            caseId={caseId}
            pivotObject={item.pivotObject}
            table={currentTable}
            filters={filters}
            onFiltersChange={onFiltersChange}
            // The rows of the previous filters stay visible while the new ones are fetched.
            isRefreshing={query.isPlaceholderData || filters !== appliedFilters}
            navigateTo={navigateTo}
            list={query.data.pages.flatMap((page) => page.clientDataListResponse.data)}
            metadata={query.data.pages.reduce(
              (mergedMetadata, page) => {
                if (!page.clientDataListResponse.metadata) return mergedMetadata;
                if (!mergedMetadata) return page.clientDataListResponse.metadata;

                return {
                  ...mergedMetadata,
                  ...page.clientDataListResponse.metadata,
                };
              },
              undefined as ClientDataListResponse['metadata'] | undefined,
            )}
            pagination={
              <DataTablePagination
                hasNext={query.hasNextPage}
                isLoading={query.isFetchingNextPage}
                isError={query.isFetchNextPageError}
                onNext={() => {
                  query.fetchNextPage();
                }}
              />
            }
          />
        ))
        .otherwise((query) => {
          // A timeout says nothing about the data: there may be matches the query had no time to find.
          const isTimeout = isRequestTimeoutError(query.error);
          return (
            <>
              <Callout
                color={isTimeout ? 'orange' : 'red'}
                icon={isTimeout ? 'warning' : 'error'}
                iconColor={isTimeout ? 'orange' : 'red'}
              >
                <div className="flex items-center justify-between gap-md">
                  {isTimeout ? t('cases:data_explorer.filters.timeout') : t('common:generic_fetch_data_error')}
                  <Button size="small" variant="secondary" onClick={() => query.refetch()}>
                    {t('common:retry')}
                  </Button>
                </div>
              </Callout>
              {/* The headers stay available: narrowing the search means adding a filter on another column. */}
              <DataTable
                caseId={caseId}
                pivotObject={item.pivotObject}
                table={currentTable}
                filters={filters}
                onFiltersChange={onFiltersChange}
                isRefreshing={filters !== appliedFilters}
                navigateTo={navigateTo}
                list={[]}
                metadata={undefined}
                pagination={null}
                hideEmptyState
              />
            </>
          );
        })}
    </div>
  );
}

type DataTablePaginationProps = {
  hasNext: boolean;
  isLoading: boolean;
  isError: boolean;
  onNext: () => void;
};

function DataTablePagination({ hasNext, isLoading, isError, onNext }: DataTablePaginationProps) {
  const { t } = useTranslation(['common', 'cases']);
  return (
    <>
      {isError ? (
        <span role="alert" className="text-red-primary text-small">
          {t('cases:data_explorer.load_more_error')}
        </span>
      ) : null}
      {hasNext ? (
        <Button variant="secondary" size="small" onClick={onNext} disabled={isLoading}>
          <Icon icon="arrow-up" className="size-4 rotate-180" />
          {t('common:load_more_results')}
        </Button>
      ) : null}
    </>
  );
}

function getHeaderStyle(fieldStatistic: FieldStatistics | undefined) {
  if (!fieldStatistic) return undefined;

  return match(fieldStatistic)
    .with({ type: 'Timestamp' }, () => ({ minWidth: '160px' }))
    .with({ type: 'IpAddress' }, () => ({ minWidth: '160px' }))
    .with({ type: 'Coords' }, () => ({ minWidth: '160px' }))
    .with({ type: 'Bool' }, () => ({ minWidth: '50px' }))
    .with({ type: 'String', format: 'uuid' }, () => ({ minWidth: '100px' }))
    .with({ type: P.union('String', 'Float') }, ({ maxLength }) => ({
      minWidth: (maxLength !== undefined ? CHARACTER_WIDTH * maxLength : DEFAULT_CELL_WIDTH) + 'px',
    }))
    .exhaustive();
}

function DataTableCell({ field, value }: { field: DataModelField; value: unknown }) {
  const { t } = useTranslation(['common']);

  if (value === null || value === undefined || value === '') {
    return <span className="text-grey-secondary">-</span>;
  }
  if (typeof value === 'boolean') {
    return <span>{value ? t('common:true') : t('common:false')}</span>;
  }
  if (isEnumField(field) && (typeof value === 'string' || typeof value === 'number')) {
    return <EnumTag field={field} value={value} />;
  }
  if (typeof value === 'string' && /(^|_)id$/i.test(field.name)) {
    return (
      <CopyToClipboardButton toCopy={value} size="sm" className="bg-surface-card font-mono text-2xs">
        <span className="line-clamp-1">{value}</span>
      </CopyToClipboardButton>
    );
  }
  return (
    <span className={cn('line-clamp-1', typeof value === 'number' && 'text-end')}>
      <FormatData compact type={field.dataType} data={parseUnknownData(value)} />
    </span>
  );
}

type DataTableProps = {
  caseId?: string;
  pivotObject: DataModelExplorerNavigationTab['pivotObject'];
  table: TableModel;
  list: ClientDataListResponse['data'];
  pagination: ReactElement | null;
  metadata: ClientDataListResponse['metadata'] | undefined;
  filters: ColumnFilters;
  onFiltersChange: (filters: ColumnFilters) => void;
  isRefreshing: boolean;
  /** Set when the caller already explains why there is no row (failed request). */
  hideEmptyState?: boolean;
  navigateTo: (tab: DataModelExplorerNavigationTab) => void;
};

const ROW_HEIGHT = 48;
const columnHelper = createColumnHelper<MarbleTableFeatures, Record<string, unknown>>();
const headerIconClassName =
  'flex size-6 shrink-0 items-center justify-center rounded-sm transition-opacity hover:text-purple-primary disabled:pointer-events-none';
const headerActionClassName = cn(headerIconClassName, 'border border-grey-border bg-surface-card');
// Hidden until the header (or the row) is hovered or holds the keyboard focus.
const revealOnHeaderClassName =
  'opacity-0 group-hover/th:opacity-100 group-focus-within/th:opacity-100 data-[state=open]:opacity-100';

function DataTable({
  caseId,
  pivotObject,
  table,
  list,
  metadata,
  pagination,
  filters,
  onFiltersChange,
  isRefreshing,
  hideEmptyState,
  navigateTo,
}: DataTableProps) {
  const { t } = useTranslation(['common', 'cases']);
  const [prefs, setPrefs] = useColumnPrefs(table);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hasActiveFilter = Object.values(filters).some(isColumnFilterActive);
  const tableData = useMemo(() => list.map((row) => row.data), [list]);
  const headerRefs = useRef<Map<string, HTMLTableCellElement>>(new Map());
  const [pinnedOffsets, setPinnedOffsets] = useState<Record<string, number>>({});
  // Hovering a header tints its whole column.
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const columns = useMemo(() => {
    return prefs.visible.flatMap((name) => {
      const field = table.fields.find((f) => f.name === name);
      if (!field) return [];
      return [
        columnHelper.accessor(name, {
          id: name,
          header: () => field.alias || field.name,
          cell: (info) => <DataTableCell field={field} value={info.getValue()} />,
        }),
      ];
    });
  }, [prefs.visible, table.fields]);

  // Stable identity: the table re-renders whenever its state object changes.
  const columnPinning = useMemo(() => ({ start: prefs.pinned, end: [] }), [prefs.pinned]);

  const reactTable = useTanStackTable({
    features: marbleTableFeatures,
    manualSorting: true,
    manualFiltering: true,
    state: { columnPinning },
    data: tableData,
    columns,
  });

  // Only the rows in view are rendered: a client can have thousands of loaded rows.
  const scrollRef = useRef<HTMLDivElement>(null);
  const tableRows = reactTable.getRowModel().rows;
  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom = rowVirtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1]?.end ?? 0);

  // Each pinned column sticks after the pinned columns before it. Widths depend on the content,
  // so they are measured after every render (state only changes when a width changed).
  useLayoutEffect(() => {
    const offsets: Record<string, number> = {};
    let offset = 0;
    for (const name of prefs.pinned) {
      offsets[name] = offset;
      offset += headerRefs.current.get(name)?.getBoundingClientRect().width ?? 0;
    }
    if (!R.isDeepEqual(pinnedOffsets, offsets)) setPinnedOffsets(offsets);
  });

  const lastPinned = prefs.pinned[prefs.pinned.length - 1];

  const handleTogglePin = (name: string) => {
    setPrefs({
      ...prefs,
      pinned: prefs.pinned.includes(name) ? prefs.pinned.filter((pinned) => pinned !== name) : [...prefs.pinned, name],
    });
  };

  const getPinnedCell = (name: string) => {
    const isPinned = prefs.pinned.includes(name);
    return {
      isPinned,
      className: cn(isPinned && 'sticky bg-surface-card', name === lastPinned && 'border-e border-grey-border'),
      style: isPinned ? { insetInlineStart: `${pinnedOffsets[name] ?? 0}px` } : undefined,
    };
  };

  return (
    <div className="flex min-h-0 flex-1 gap-md">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-sm">
        <div
          ref={scrollRef}
          aria-busy={isRefreshing}
          className={cn(
            'border-grey-border min-h-60 flex-1 overflow-auto rounded-md border transition-opacity',
            isRefreshing && 'opacity-60',
          )}
        >
          <table className="min-w-full border-separate border-spacing-0 text-small">
            <thead>
              {reactTable.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="h-10 text-start">
                  {headerGroup.headers.map((header) => {
                    const name = header.column.id;
                    const field = table.fields.find((f) => f.name === name);
                    const pinnedCell = getPinnedCell(name);
                    const isFiltered = isColumnFilterActive(filters[name]);

                    return (
                      <th
                        key={header.id}
                        ref={(el) => {
                          if (el) headerRefs.current.set(name, el);
                          else headerRefs.current.delete(name);
                        }}
                        className={cn(
                          'group/th border-grey-border bg-surface-card sticky top-0 z-20 border-b px-md font-medium',
                          pinnedCell.isPinned && 'z-30',
                          pinnedCell.className,
                          name === hoveredColumn && 'bg-grey-background-light',
                        )}
                        style={{ ...getHeaderStyle(metadata?.fieldStatistics[name]), ...pinnedCell.style }}
                        onMouseEnter={() => setHoveredColumn(name)}
                        onMouseLeave={() => setHoveredColumn(null)}
                      >
                        <div className="flex items-center gap-sm">
                          <span className="flex-1 truncate text-start">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {field ? (
                            <ColumnFilterPopover
                              field={field}
                              value={filters[name]}
                              onChange={(value) =>
                                onFiltersChange(value ? { ...filters, [name]: value } : R.omit(filters, [name]))
                              }
                            >
                              <button
                                type="button"
                                aria-label={t('cases:data_explorer.filters.filter_column')}
                                className={cn(
                                  headerIconClassName,
                                  isFiltered ? 'text-purple-primary' : ['text-grey-primary', revealOnHeaderClassName],
                                )}
                              >
                                <Icon icon="filters" className="size-5" />
                              </button>
                            </ColumnFilterPopover>
                          ) : null}
                          {/* While the column settings are open, their draft is the only place to pin. */}
                          <button
                            type="button"
                            disabled={settingsOpen}
                            aria-label={
                              pinnedCell.isPinned
                                ? t('cases:data_explorer.unpin_column')
                                : t('cases:data_explorer.pin_column')
                            }
                            className={cn(
                              headerActionClassName,
                              pinnedCell.isPinned
                                ? 'text-purple-primary'
                                : ['text-grey-secondary', revealOnHeaderClassName],
                            )}
                            onClick={() => handleTogglePin(name)}
                          >
                            <Icon icon={pinnedCell.isPinned ? 'pin' : 'pin-outline'} className="size-4" />
                          </button>
                        </div>
                      </th>
                    );
                  })}
                  <th className="border-grey-border bg-surface-card sticky end-0 top-0 z-30 w-px border-b px-sm">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        aria-pressed={settingsOpen}
                        aria-label={t('cases:data_explorer.column_settings.open')}
                        className={cn(
                          headerActionClassName,
                          'rounded-md shadow-md',
                          settingsOpen ? 'text-purple-primary' : 'text-grey-secondary',
                        )}
                        onClick={() => setSettingsOpen((open) => !open)}
                      >
                        <Icon icon="settings" className="size-4" />
                      </button>
                    </div>
                  </th>
                </tr>
              ))}
            </thead>

            <tbody>
              {paddingTop > 0 ? (
                <tr aria-hidden>
                  <td style={{ height: `${paddingTop}px` }} />
                </tr>
              ) : null}
              {virtualRows.map((virtualRow) => {
                const row = tableRows[virtualRow.index];
                // `tableData` is `list` mapped in order, so indexes match.
                const sourceObject = row ? list[row.index] : undefined;
                if (!row || !sourceObject) {
                  return null;
                }

                return (
                  <tr key={row.id} className="group" style={{ height: `${ROW_HEIGHT}px` }}>
                    {row.getVisibleCells().map((cell) => {
                      const pinnedCell = getPinnedCell(cell.column.id);
                      return (
                        <td
                          key={cell.id}
                          className={cn(
                            'group-hover:bg-grey-background-light px-md',
                            pinnedCell.isPinned && 'z-10',
                            pinnedCell.className,
                            cell.column.id === hoveredColumn && 'bg-grey-background-light',
                          )}
                          style={pinnedCell.style}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                    <td className="bg-surface-card group-hover:bg-grey-background-light sticky end-0 z-10 px-sm">
                      <DataTableActionsButton
                        caseId={caseId}
                        navigationOptions={table.navigationOptions}
                        pivotObject={pivotObject}
                        sourceObject={sourceObject}
                        tableName={table.name}
                        navigateTo={navigateTo}
                      />
                    </td>
                  </tr>
                );
              })}
              {paddingBottom > 0 ? (
                <tr aria-hidden>
                  <td style={{ height: `${paddingBottom}px` }} />
                </tr>
              ) : null}
            </tbody>
          </table>
          {list.length === 0 && !hideEmptyState ? (
            <div role="status" className="text-grey-secondary p-md text-center text-small">
              {hasActiveFilter
                ? t('cases:data_explorer.filters.no_match')
                : t('cases:data_explorer.no_table_data', { tableName: table.alias || table.name })}
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-sm">{pagination}</div>
      </div>
      {settingsOpen ? (
        <ColumnSettingsPanel table={table} prefs={prefs} onValidate={setPrefs} onClose={() => setSettingsOpen(false)} />
      ) : null}
    </div>
  );
}

type DataTableActionsButtonProps = {
  caseId?: string;
  navigationOptions: NavigationOption[] | undefined;
  pivotObject: DataModelExplorerNavigationTab['pivotObject'];
  sourceObject: ClientObjectDetail;
  tableName: string;
  navigateTo: (tab: DataModelExplorerNavigationTab) => void;
};

function DataTableActionsButton({
  caseId,
  navigationOptions,
  pivotObject,
  sourceObject,
  tableName,
  navigateTo,
}: DataTableActionsButtonProps) {
  const { t } = useTranslation(['cases', 'common']);
  const [annotationMenuOpen, setAnnotationMenuOpen] = useState(false);
  const annotations = sourceObject.annotations ?? { files: [], comments: [], tags: [] };

  const annotationsCount = annotations.comments.length + annotations.files.length + annotations.tags.length;
  const hasNavigationOptions = !!navigationOptions?.length;

  if (!sourceObject.metadata.canBeAnnotated && !hasNavigationOptions) return null;

  return (
    <Popover.Root open={annotationMenuOpen} onOpenChange={setAnnotationMenuOpen}>
      <Popover.Anchor asChild>
        <div
          className={cn(
            'relative flex justify-end gap-xs',
            // Rows without annotation only show their actions on hover or keyboard focus.
            annotationsCount === 0 &&
              !annotationMenuOpen &&
              'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 has-data-[state=open]:opacity-100',
          )}
        >
          {sourceObject.metadata.canBeAnnotated ? (
            <Popover.Trigger asChild>
              <Button
                variant="secondary"
                size="small"
                mode={annotationsCount > 0 ? 'normal' : 'icon'}
                aria-label={t('cases:annotations.popover.annotate.title')}
                className="border-purple-border text-purple-primary hover:border-purple-primary data-[state=open]:border-purple-primary shadow-md"
              >
                <Icon icon="comment" className="size-4" />
                {annotationsCount > 0 ? <span className="text-xs font-normal">{annotationsCount}</span> : null}
              </Button>
            </Popover.Trigger>
          ) : null}
          <Popover.Content
            side="bottom"
            align="end"
            sideOffset={4}
            collisionPadding={10}
            className="max-h-none w-[340px]"
          >
            {sourceObject.data.object_id ? (
              <ClientObjectAnnotationPopover
                caseId={caseId}
                tableName={tableName}
                objectId={sourceObject.data.object_id}
                annotations={sourceObject.annotations}
              />
            ) : null}
          </Popover.Content>
          {hasNavigationOptions ? (
            <MenuCommand.Menu>
              <MenuCommand.Trigger>
                <Button
                  variant="secondary"
                  size="small"
                  mode="icon"
                  aria-label={t('cases:case_detail.pivot_panel.explore')}
                  className="hover:border-purple-primary data-[state=open]:border-purple-primary shadow-md"
                >
                  <Icon icon="more-menu" className="size-3.5" />
                </Button>
              </MenuCommand.Trigger>
              <MenuCommand.Content side="bottom" align="end" sideOffset={4} className="text-r min-w-[280px]">
                <MenuCommand.List>
                  <MenuCommand.Group
                    heading={
                      <div className="p-xs py-xs text-xs font-semibold">
                        {t('cases:case_detail.pivot_panel.explore')}
                      </div>
                    }
                  >
                    {navigationOptions.map((navigationOption) => (
                      <MenuCommand.Item
                        forceMount
                        key={navigationOption.id}
                        onSelect={() => {
                          navigateTo({
                            pivotObject,
                            sourceObject: sourceObject.data,
                            navigationOptionId: navigationOption.id,
                            sourceTableName: tableName,
                            sourceFieldName: navigationOption.sourceFieldName,
                            filterFieldName: navigationOption.filterFieldName,
                            targetTableName: navigationOption.targetTableName,
                            orderingFieldName: navigationOption.orderingFieldName,
                          });
                        }}
                      >
                        {navigationOption.targetTableName}
                        <Icon icon="north-east" className="size-5" />
                      </MenuCommand.Item>
                    ))}
                  </MenuCommand.Group>
                </MenuCommand.List>
              </MenuCommand.Content>
            </MenuCommand.Menu>
          ) : null}
        </div>
      </Popover.Anchor>
    </Popover.Root>
  );
}
