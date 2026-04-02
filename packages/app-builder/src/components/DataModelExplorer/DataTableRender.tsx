import useIntersection from '@app-builder/hooks/useIntersection';
import {
  type ClientDataListResponse,
  type ClientObjectDetail,
  type DataModelWithTableOptions,
  FieldStatistics,
  type NavigationOption,
  type TableModelWithOptions,
} from '@app-builder/models';
import { useClientObjectListQuery } from '@app-builder/queries/client-object-list';
import { parseUnknownData } from '@app-builder/utils/parse';
import {
  type ColumnPinningState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match, P } from 'ts-pattern';
import { Button, cn, MenuCommand, Popover } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { FormatData } from '../FormatData';
import { ClientObjectAnnotationPopover } from './ClientObjectAnnotationPopover';
import { type DataModelExplorerNavigationTab } from './types';

const CHARACTER_WIDTH = 8;
const DEFAULT_CELL_WIDTH = 300;

export type DataTableRenderProps = {
  caseId?: string;
  item: DataModelExplorerNavigationTab;
  dataModel: DataModelWithTableOptions;
  navigateTo: (tabItem: DataModelExplorerNavigationTab) => void;
};

export function DataTableRender({ caseId, dataModel, item, navigateTo }: DataTableRenderProps) {
  const { t } = useTranslation(['common', 'cases']);
  const currentTable = dataModel.find((t) => t.name === item.targetTableName);
  const sourceField = item.sourceObject[item.sourceFieldName];
  const filterFieldValue = typeof sourceField === 'string' || typeof sourceField === 'number' ? sourceField : '';

  const dataListQuery = useClientObjectListQuery({
    tableName: item.targetTableName,
    params: {
      sourceTableName: item.sourceTableName,
      filterFieldName: item.filterFieldName,
      filterFieldValue,
      orderingFieldName: item.orderingFieldName,
    },
  });

  if (!currentTable) {
    return (
      <div className="border-red-primary bg-red-background text-red-primary mt-3 rounded-sm border p-2">
        {t('common:global_error')}
      </div>
    );
  }

  return (
    <div className="mt-3 flex min-h-0 flex-1 flex-col">
      {match(dataListQuery)
        .with({ isError: true }, () => {
          return (
            <div className="border-red-primary bg-red-background text-red-primary mt-3 rounded-sm border p-2">
              {t('common:global_error')}
            </div>
          );
        })
        .with({ isPending: true }, () => {
          return <>Loading list of objects...</>;
        })
        .otherwise((query) => {
          return (
            <DataTable
              caseId={caseId}
              pivotObject={item.pivotObject}
              table={currentTable}
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
                  onNext={() => {
                    query.fetchNextPage();
                  }}
                />
              }
            />
          );
        })}
    </div>
  );
}

type DataTablePaginationProps = {
  hasNext: boolean;
  isLoading: boolean;
  onNext: () => void;
};

function DataTablePagination({ hasNext, isLoading, onNext }: DataTablePaginationProps) {
  const { t } = useTranslation(['common']);
  return (
    <>
      {hasNext ? (
        <Button variant="secondary" size="small" onClick={onNext} disabled={isLoading}>
          <Icon icon="arrow-up" className="size-4 rotate-180" />
          {t('common:load_more_results')}
        </Button>
      ) : null}
    </>
  );
}

function getColumnList(tableModel: TableModelWithOptions) {
  return tableModel.fields.filter((f) => f.displayed).map((f) => f.name);
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

type DataTableProps = {
  caseId?: string;
  pivotObject: DataModelExplorerNavigationTab['pivotObject'];
  table: TableModelWithOptions;
  list: ClientDataListResponse['data'];
  pagination: ReactElement;
  metadata: ClientDataListResponse['metadata'] | undefined;
  navigateTo: (tab: DataModelExplorerNavigationTab) => void;
};

const ROW_NUMBER_COL_WIDTH = 50;
const columnHelper = createColumnHelper<Record<string, unknown>>();

function DataTable({ caseId, pivotObject, table, list, metadata, pagination, navigateTo }: DataTableProps) {
  const { t } = useTranslation(['common', 'cases']);
  const [columnList, setColumnList] = useState(() => {
    return getColumnList(table);
  });
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({ left: [], right: [] });
  const tableData = useMemo(() => list.map((d) => d.data), [list]);
  const fieldOrder = useMemo(() => {
    return R.pipe(
      table.options.fieldOrder,
      R.map((fieldId) => table.fields.find((f) => f.id === fieldId)?.name),
      R.filter((fieldName): fieldName is string => !!fieldName),
    );
  }, [table]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const headerRefs = useRef<Map<string, HTMLTableCellElement>>(new Map());
  const rowNumberColRef = useRef<HTMLTableCellElement>(null);
  const intersection = useIntersection(sentinelRef, {
    root: wrapperRef.current,
    rootMargin: '1px',
    threshold: 1,
  });

  useEffect(() => {
    setColumnList(getColumnList(table));
    setColumnPinning({ left: [], right: [] });
  }, [table]);

  const columns = useMemo(() => {
    return columnList.map((colName) => {
      return columnHelper.accessor(colName, {
        header: () => colName,
        cell: (info) => {
          const parsedData = parseUnknownData(info.getValue());
          return (
            <span
              className={cn('relative line-clamp-1 px-4', {
                'text-right': parsedData.type === 'number' || parsedData.value === null,
              })}
            >
              <FormatData type={table.fields.find((f) => f.name === colName)?.dataType} data={parsedData} />
            </span>
          );
        },
      });
    });
  }, [columnList, table]);

  const reactTable = useReactTable({
    state: {
      columnOrder: fieldOrder,
      columnPinning,
    },
    onColumnPinningChange: setColumnPinning,
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const pinnedLeft = columnPinning.left ?? [];

  const getPinnedColumnOffset = (columnId: string): number => {
    const idx = pinnedLeft.indexOf(columnId);
    if (idx < 0) return 0;

    const rowNumWidth = rowNumberColRef.current?.getBoundingClientRect().width ?? ROW_NUMBER_COL_WIDTH;
    let offset = rowNumWidth;
    for (let i = 0; i < idx; i++) {
      const pinnedColId = pinnedLeft[i];
      if (!pinnedColId) continue;
      const el = headerRefs.current.get(pinnedColId);
      offset += el?.getBoundingClientRect().width ?? 150;
    }
    return offset;
  };

  const isLastPinnedColumn = (columnId: string): boolean => {
    return pinnedLeft[pinnedLeft.length - 1] === columnId;
  };

  const handleToggleColumn = (colName: string) => {
    setColumnList((cl) => {
      if (cl.includes(colName)) {
        const idx = cl.indexOf(colName);
        return [...cl.slice(0, idx), ...cl.slice(idx + 1)];
      } else {
        return [...cl, colName];
      }
    });
  };

  const handleTogglePin = (colName: string) => {
    setColumnPinning((prev) => {
      const left = prev.left ?? [];
      if (left.includes(colName)) {
        return { ...prev, left: left.filter((c) => c !== colName) };
      }
      return { ...prev, left: [...left, colName] };
    });
  };

  const hasPinnedColumns = pinnedLeft.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="text-m font-semibold">{table.name}</div>
        {list.length > 0 ? (
          <MenuCommand.Menu>
            <MenuCommand.Trigger>
              <Button variant="secondary">
                <Icon className="size-3.5" icon="column" />
                {t('cases:data_explorer.columns')}
              </Button>
            </MenuCommand.Trigger>
            <MenuCommand.Content sideOffset={4} align="start" sameWidth>
              <MenuCommand.List>
                {fieldOrder.map((fieldName) => {
                  const isPinned = pinnedLeft.includes(fieldName);
                  return (
                    <MenuCommand.Item key={fieldName} onSelect={() => handleToggleColumn(fieldName)}>
                      <div className="flex w-full items-center justify-between">
                        <span>{fieldName}</span>
                        <div className="flex items-center gap-1">
                          <span
                            role="button"
                            tabIndex={0}
                            className={cn(
                              'flex items-center justify-center rounded p-0.5 hover:bg-grey-background-light',
                              isPinned ? 'text-purple-primary' : 'text-grey-secondary',
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePin(fieldName);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                handleTogglePin(fieldName);
                              }
                            }}
                          >
                            <Icon icon="map-pin" className="size-3.5" />
                          </span>
                          {columnList.includes(fieldName) ? <Icon icon="tick" className="size-5" /> : null}
                        </div>
                      </div>
                    </MenuCommand.Item>
                  );
                })}
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 overflow-auto" ref={wrapperRef}>
        <div ref={sentinelRef} className="w-0" />
        {list.length > 0 ? (
          <table className="mb-4 border-separate border-spacing-0">
            <thead>
              {reactTable.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="text-grey-secondary border-grey-border bg-surface-card sticky top-0 z-20 h-10 text-left"
                >
                  <th
                    ref={rowNumberColRef}
                    className={cn(
                      'border-grey-border bg-surface-card sticky left-0 z-30 border-y border-r p-2 font-normal',
                      {
                        'shadow-sticky-left overflow-y-hidden': !intersection?.isIntersecting && !hasPinnedColumns,
                      },
                    )}
                  ></th>
                  {headerGroup.headers.map((header) => {
                    const fieldStatistic = metadata?.fieldStatistics[header.getContext().column.id];
                    const isPinned = header.column.getIsPinned();

                    return (
                      <th
                        key={header.id}
                        ref={(el) => {
                          if (el) headerRefs.current.set(header.column.id, el);
                          else headerRefs.current.delete(header.column.id);
                        }}
                        className={cn(
                          'border-grey-border border-y px-2 font-normal not-last:border-r box-border group/th',
                          {
                            'sticky z-30 bg-surface-card border-r': isPinned,
                            'shadow-sticky-left':
                              isPinned && isLastPinnedColumn(header.column.id) && !intersection?.isIntersecting,
                          },
                        )}
                        style={{
                          left: isPinned ? `${getPinnedColumnOffset(header.column.id)}px` : undefined,
                          ...getHeaderStyle(fieldStatistic),
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          <button
                            type="button"
                            aria-label={
                              isPinned ? t('cases:data_explorer.unpin_column') : t('cases:data_explorer.pin_column')
                            }
                            className={cn(
                              'shrink-0 transition-opacity',
                              isPinned
                                ? 'text-purple-primary opacity-100'
                                : 'opacity-0 group-hover/th:opacity-100 text-grey-secondary',
                            )}
                            onClick={() => header.column.pin(isPinned ? false : 'left')}
                          >
                            <Icon icon="map-pin" className="size-3" />
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {reactTable.getRowModel().rows.map((row) => {
                const fullSourceObject = list.find((item) => item.data === row.original);
                if (!fullSourceObject) {
                  return null;
                }

                return (
                  <tr key={row.id} className="border-grey-border group z-0 h-10">
                    <td
                      className={cn(
                        'border-grey-border bg-surface-card group-hover:bg-grey-background-light sticky left-0 z-10 h-full border-b border-r p-2',
                        {
                          'shadow-sticky-left overflow-y-hidden': !intersection?.isIntersecting && !hasPinnedColumns,
                        },
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {row.index + 1}
                        <DataTableActionsButton
                          caseId={caseId}
                          navigationOptions={table.navigationOptions}
                          pivotObject={pivotObject}
                          sourceObject={fullSourceObject}
                          tableName={table.name}
                          navigateTo={navigateTo}
                        />
                      </div>
                    </td>
                    {row.getVisibleCells().map((cell) => {
                      const isPinned = cell.column.getIsPinned();
                      return (
                        <td
                          className={cn(
                            'border-grey-border group-hover:bg-grey-background-light border-b not-last:border-r',
                            {
                              'sticky z-10 bg-surface-card border-r': isPinned,
                              'shadow-sticky-left':
                                isPinned && isLastPinnedColumn(cell.column.id) && !intersection?.isIntersecting,
                            },
                          )}
                          style={{
                            left: isPinned ? `${getPinnedColumnOffset(cell.column.id)}px` : undefined,
                          }}
                          key={cell.id}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="border-grey-border rounded-sm border p-2 text-center">
            {t('cases:data_explorer.no_table_data', { tableName: table.name })}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">{pagination}</div>
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
  const showCommentAction = annotationsCount > 0 || annotationMenuOpen;

  return (
    <Popover.Root open={annotationMenuOpen} onOpenChange={setAnnotationMenuOpen}>
      <Popover.Anchor asChild>
        <div className="relative flex">
          {showCommentAction ? (
            <Popover.Trigger asChild>
              <Button
                variant="secondary"
                size="small"
                className="hover:border-purple-primary data-[state=open]:border-purple-primary items-center rounded-r-none hover:z-10 data-[state=open]:z-10"
              >
                <Icon icon="comment" className="size-4" />
                <span className="text-xs font-normal">{annotationsCount}</span>
              </Button>
            </Popover.Trigger>
          ) : null}
          <Popover.Content
            side="right"
            align="start"
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
          <MenuCommand.Menu>
            <MenuCommand.Trigger>
              <Button
                variant="secondary"
                mode={showCommentAction ? 'normal' : 'icon'}
                className={cn(
                  'hover:border-purple-primary data-[state=open]:border-purple-primary hover:z-10 data-[state=open]:z-10',
                  {
                    '-ml-px rounded-l-none': showCommentAction,
                  },
                )}
              >
                <Icon icon="more-menu" className="size-3.5" />
              </Button>
            </MenuCommand.Trigger>
            <MenuCommand.Content side="right" align="start" sideOffset={4} className="text-r min-w-[280px]">
              <MenuCommand.List>
                {sourceObject.metadata.canBeAnnotated ? (
                  <MenuCommand.Group>
                    <MenuCommand.Item forceMount onSelect={() => setAnnotationMenuOpen(true)}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          {t('cases:annotations.popover.annotate.title')}{' '}
                          <span className="text-grey-disabled text-xs">{annotationsCount}</span>
                        </div>
                        <span className="text-grey-secondary">{t('cases:annotations.popover.annotate.subtitle')}</span>
                      </div>
                      <Icon icon="comment" className="size-5" />
                    </MenuCommand.Item>
                  </MenuCommand.Group>
                ) : null}
                {navigationOptions ? (
                  <>
                    <MenuCommand.Separator className="bg-grey-border" />
                    <MenuCommand.Group
                      heading={
                        <div className="p-1 py-2 text-xs font-semibold">
                          {t('cases:case_detail.pivot_panel.explore')}
                        </div>
                      }
                    >
                      {navigationOptions.map((navigationOption) => (
                        <MenuCommand.Item
                          forceMount
                          key={navigationOption.targetTableId}
                          onSelect={() => {
                            navigateTo({
                              pivotObject,
                              sourceObject: sourceObject.data,
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
                  </>
                ) : null}
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>
        </div>
      </Popover.Anchor>
    </Popover.Root>
  );
}
