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
import { useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match, P } from 'ts-pattern';
import { Button, MenuCommand, Popover } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { FormatData } from '../FormatData';
import { ClientObjectAnnotationPopover } from './ClientObjectAnnotationPopover';
import { ClientObjectDataList } from './ClientObjectDataList';
import { type DataModelExplorerNavigationTab } from './types';

const CHARACTER_WIDTH = 8;
const DEFAULT_CELL_WIDTH = 300;

export type DataTableRenderProps = {
  caseId: string;
  item: DataModelExplorerNavigationTab;
  dataModel: DataModelWithTableOptions;
  navigateTo: (tabItem: DataModelExplorerNavigationTab) => void;
};

export function DataTableRender({ caseId, dataModel, item, navigateTo }: DataTableRenderProps) {
  const { t } = useTranslation(['common', 'cases']);
  const currentTable = dataModel.find((t) => t.name === item.targetTableName);
  const sourceField = item.sourceObject[item.sourceFieldName];
  const filterFieldValue =
    typeof sourceField === 'string' || typeof sourceField === 'number' ? sourceField : '';

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
      <div className="border-red-47 bg-red-95 text-red-47 mt-3 rounded-sm border p-2">
        {t('common:global_error')}
      </div>
    );
  }

  const sourceTableModel = dataModel.find((tm) => tm.name === item.sourceTableName);
  const pivotTableModel = dataModel.find((tm) => tm.name === item.pivotObject.pivotObjectName);

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {sourceTableModel ? (
          <div className="flex flex-col gap-2">
            <span className="text-s font-semibold">{item.sourceTableName}</span>
            <ClientObjectDataList tableModel={sourceTableModel} data={item.sourceObject} />
          </div>
        ) : null}
        {filterFieldValue !== item.pivotObject.pivotValue && pivotTableModel ? (
          <div className="col-start-2 flex flex-col gap-2">
            <span className="text-s font-semibold">{item.pivotObject.pivotObjectName}</span>
            <ClientObjectDataList
              tableModel={pivotTableModel}
              data={item.sourceObject}
              isIncompleteObject={!item.pivotObject.isIngested}
            />
          </div>
        ) : null}
      </div>
      <div className="bg-grey-90 h-px" />
      {match(dataListQuery)
        .with({ isError: true }, () => {
          return (
            <div className="border-red-47 bg-red-95 text-red-47 mt-3 rounded-sm border p-2">
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
    .with({ type: 'Bool' }, () => ({ minWidth: '50px' }))
    .with({ type: 'String', format: 'uuid' }, () => ({ minWidth: '100px' }))
    .with({ type: P.union('String', 'Float') }, ({ maxLength }) => ({
      minWidth: (maxLength !== undefined ? CHARACTER_WIDTH * maxLength : DEFAULT_CELL_WIDTH) + 'px',
    }))
    .exhaustive();
}

type DataTableProps = {
  caseId: string;
  pivotObject: DataModelExplorerNavigationTab['pivotObject'];
  table: TableModelWithOptions;
  list: ClientDataListResponse['data'];
  pagination: ReactElement;
  metadata: ClientDataListResponse['metadata'] | undefined;
  navigateTo: (tab: DataModelExplorerNavigationTab) => void;
};

function DataTable({
  caseId,
  pivotObject,
  table,
  list,
  metadata,
  pagination,
  navigateTo,
}: DataTableProps) {
  const { t } = useTranslation(['common', 'cases']);
  const language = useFormatLanguage();

  const columnHelper = createColumnHelper<Record<string, unknown>>();
  const [columnList, setColumnList] = useState(() => {
    return getColumnList(table);
  });
  const tableData = useMemo(() => list.map((d) => d.data), [list]);
  const fieldOrder = useMemo(() => {
    return R.pipe(
      table.options.fieldOrder,
      R.map((fieldId) => table.fields.find((f) => f.id === fieldId)?.name),
      R.filter((fieldName): fieldName is string => !!fieldName),
    );
  }, [table]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLTableElement>(null);
  const intersection = useIntersection(sentinelRef, {
    root: wrapperRef.current,
    rootMargin: '1px',
    threshold: 1,
  });

  useEffect(() => {
    setColumnList(getColumnList(table));
  }, [table]);

  const columns = useMemo(() => {
    return columnList.map((colName) => {
      return columnHelper.accessor(colName, {
        header: () => colName,
        cell: (info) => {
          const parsedData = parseUnknownData(info.getValue());
          return (
            <span
              className={clsx('relative line-clamp-1 px-4', {
                'text-right': parsedData.type === 'number' || parsedData.value === null,
              })}
            >
              <FormatData data={parsedData} language={language} />
            </span>
          );
        },
      });
    });
  }, [columnHelper, columnList, language]);

  const reactTable = useReactTable({
    state: {
      columnOrder: fieldOrder,
    },
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="text-m font-semibold">{table.name}</div>
        {list.length > 0 ? (
          <MenuCommand.Menu>
            <MenuCommand.Trigger>
              <Button variant="secondary">
                <Icon className="size-5" icon="column" />
                {t('cases:data_explorer.columns')}
              </Button>
            </MenuCommand.Trigger>
            <MenuCommand.Content sideOffset={4} align="start" sameWidth>
              <MenuCommand.List>
                {fieldOrder.map((fieldName) => {
                  return (
                    <MenuCommand.Item
                      key={fieldName}
                      onSelect={() => handleToggleColumn(fieldName)}
                    >
                      {fieldName}
                      {columnList.includes(fieldName) ? (
                        <Icon icon="tick" className="size-5" />
                      ) : null}
                    </MenuCommand.Item>
                  );
                })}
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>
        ) : null}
      </div>
      <div className="flex max-h-[480px] overflow-auto" ref={wrapperRef}>
        <div ref={sentinelRef} className="w-0" />
        {list.length > 0 ? (
          <table className="mb-4 border-separate border-spacing-0">
            <thead>
              {reactTable.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="text-grey-50 border-grey-90 bg-grey-100 sticky top-0 z-20 h-10 text-left"
                >
                  <th
                    className={clsx(
                      'border-grey-90 bg-grey-100 sticky left-0 z-10 h-full border-y border-r p-2 font-normal',
                      {
                        'shadow-sticky-left overflow-y-hidden': !intersection?.isIntersecting,
                      },
                    )}
                  ></th>
                  {headerGroup.headers.map((header) => {
                    const fieldStatistic = metadata?.fieldStatistics[header.getContext().column.id];

                    return (
                      <th
                        key={header.id}
                        className="border-grey-90 border-y px-2 font-normal not-last:border-r box-border"
                        style={getHeaderStyle(fieldStatistic)}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
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
                  <tr key={row.id} className="border-grey-90 group z-0 h-10">
                    <td
                      className={clsx(
                        'border-grey-90 bg-grey-100 group-hover:bg-grey-98 sticky left-0 z-10 h-full border-b border-r p-2',
                        {
                          'shadow-sticky-left overflow-y-hidden': !intersection?.isIntersecting,
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
                    {row.getVisibleCells().map((cell) => (
                      <td
                        className="border-grey-90 group-hover:bg-grey-98 border-b not-last:border-r"
                        key={cell.id}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="border-grey-90 rounded-sm border p-2 text-center">
            {t('cases:data_explorer.no_table_data', { tableName: table.name })}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">{pagination}</div>
    </div>
  );
}

type DataTableActionsButtonProps = {
  caseId: string;
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

  const annotationsCount =
    annotations.comments.length + annotations.files.length + annotations.tags.length;
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
                className="hover:border-purple-65 data-[state=open]:border-purple-65 items-center rounded-r-none hover:z-10 data-[state=open]:z-10"
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
                size="small"
                className={clsx(
                  'hover:border-purple-65 data-[state=open]:border-purple-65 hover:z-10 data-[state=open]:z-10',
                  {
                    '-ml-px rounded-l-none': showCommentAction,
                  },
                )}
              >
                <Icon icon="more-menu" className="size-4" />
              </Button>
            </MenuCommand.Trigger>
            <MenuCommand.Content
              side="right"
              align="start"
              sideOffset={4}
              className="text-r min-w-[280px]"
            >
              <MenuCommand.List>
                {sourceObject.metadata.canBeAnnotated ? (
                  <MenuCommand.Group>
                    <MenuCommand.Item forceMount onSelect={() => setAnnotationMenuOpen(true)}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          {t('cases:annotations.popover.annotate.title')}{' '}
                          <span className="text-grey-80 text-xs">{annotationsCount}</span>
                        </div>
                        <span className="text-grey-50">
                          {t('cases:annotations.popover.annotate.subtitle')}
                        </span>
                      </div>
                      <Icon icon="comment" className="size-5" />
                    </MenuCommand.Item>
                  </MenuCommand.Group>
                ) : null}
                {navigationOptions ? (
                  <>
                    <MenuCommand.Separator className="bg-grey-90" />
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
