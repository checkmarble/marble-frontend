import {
  type ClientDataListResponse,
  type DataModelWithTableOptions,
  type TableModelWithOptions,
} from '@app-builder/models';
import { type PivotObject } from '@app-builder/models/cases';
import { useClientObjectListQuery } from '@app-builder/queries/client-object-list';
import { useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import {
  HoverCard,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
} from '@radix-ui/react-hover-card';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match } from 'ts-pattern';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { FormatData } from '../FormatData';
import { ClientObjectDataList } from './ClientObjectDataList';
import { type DataModelExplorerNavigationTab } from './types';

export type DataTableRenderProps = {
  item: DataModelExplorerNavigationTab;
  dataModel: DataModelWithTableOptions;
  navigateTo: (tabItem: DataModelExplorerNavigationTab) => void;
};

export function DataTableRender({ dataModel, item, navigateTo }: DataTableRenderProps) {
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
      <div className="border-red-47 bg-red-95 text-red-47 mt-3 rounded border p-2">
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
              data={item.pivotObject.pivotObjectData.data}
              isIncompleteObject={!item.pivotObject.isIngested}
            />
          </div>
        ) : null}
      </div>
      <div className="bg-grey-90 h-px" />
      {match(dataListQuery)
        .with({ isError: true }, () => {
          return (
            <div className="border-red-47 bg-red-95 text-red-47 mt-3 rounded border p-2">
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
              pivotObject={item.pivotObject}
              table={currentTable}
              navigateTo={navigateTo}
              list={query.data.pages.flatMap((page) => page.clientDataListResponse.data)}
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

type DataTableProps = {
  pivotObject: PivotObject;
  table: TableModelWithOptions;
  list: ClientDataListResponse['data'];
  pagination: ReactElement;
  navigateTo: (tab: DataModelExplorerNavigationTab) => void;
};

function DataTable({ pivotObject, table, list, pagination, navigateTo }: DataTableProps) {
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
      <div className="overflow-x-auto">
        {list.length > 0 ? (
          <table className="mb-4 min-w-full">
            <thead>
              {reactTable.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="text-grey-50 border-grey-90 h-10 border-y text-left"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="border-grey-90 px-4 font-normal last:border-l [&:not(:last-child)]:border-r"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {reactTable.getRowModel().rows.map((row) => {
                const rowElement = (
                  <tr key={row.id} className="hover:bg-grey-98 border-grey-90 h-10 border-y">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        className="border-grey-90 w-fit min-w-[300px] last:border-l [&:not(:last-child)]:border-r"
                        key={cell.id}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );

                return table.navigationOptions ? (
                  <HoverCard key={row.id} openDelay={50} closeDelay={100}>
                    <HoverCardTrigger asChild aria-disabled={true}>
                      {rowElement}
                    </HoverCardTrigger>
                    <HoverCardPortal>
                      <HoverCardContent
                        side="left"
                        align="start"
                        sideOffset={34}
                        className="z-10 mt-1"
                      >
                        <MenuCommand.Menu>
                          <MenuCommand.Trigger>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute -left-full size-8"
                            >
                              <Icon icon="more-menu" className="size-5" />
                            </Button>
                          </MenuCommand.Trigger>
                          <MenuCommand.Content align="start" sideOffset={4}>
                            <MenuCommand.List>
                              {table.navigationOptions.map((navigationOption) => (
                                <MenuCommand.Item
                                  key={navigationOption.targetTableId}
                                  onSelect={() => {
                                    navigateTo({
                                      pivotObject,
                                      sourceObject: row.original,
                                      sourceTableName: table.name,
                                      sourceFieldName: navigationOption.sourceFieldName,
                                      filterFieldName: navigationOption.filterFieldName,
                                      targetTableName: navigationOption.targetTableName,
                                      orderingFieldName: navigationOption.orderingFieldName,
                                    });
                                  }}
                                >
                                  Show {navigationOption.targetTableName}
                                </MenuCommand.Item>
                              ))}
                            </MenuCommand.List>
                          </MenuCommand.Content>
                        </MenuCommand.Menu>
                      </HoverCardContent>
                    </HoverCardPortal>
                  </HoverCard>
                ) : (
                  rowElement
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="border-grey-90 rounded border p-2 text-center">
            {t('cases:data_explorer.no_table_data', { tableName: table.name })}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">{pagination}</div>
    </div>
  );
}
