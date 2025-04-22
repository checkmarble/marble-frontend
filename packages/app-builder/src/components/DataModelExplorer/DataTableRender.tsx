import { type ClientDataListResponse, type DataModel, type TableModel } from '@app-builder/models';
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
import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { FormatData } from '../FormatData';
import { ClientObjectDataList } from './ClientObjectDataList';
import { type DataModelExplorerNavigationTab } from './types';

export type DataTableRenderProps = {
  item: DataModelExplorerNavigationTab;
  dataModel: DataModel;
  navigateTo: (tabItem: DataModelExplorerNavigationTab) => void;
};

export function DataTableRender({ dataModel, item, navigateTo }: DataTableRenderProps) {
  const { t } = useTranslation(['common', 'cases']);
  const currentTable = dataModel.find((t) => t.name === item.targetTableName);
  const sourceField = item.sourceObject[item.sourceFieldName];
  const filterFieldValue =
    typeof sourceField === 'string' || typeof sourceField === 'number' ? sourceField : '';
  const [currentOffset, setCurrentOffset] = useState<string | number | null>(null);
  const uniqueRelationKey = `${filterFieldValue}_${item.targetTableName}`;
  const uniqueRelationKeyRef = useRef(uniqueRelationKey);

  if (uniqueRelationKeyRef.current !== uniqueRelationKey) {
    uniqueRelationKeyRef.current = uniqueRelationKey;
    setCurrentOffset(null);
  }

  const dataListQuery = useClientObjectListQuery({
    tableName: item.targetTableName,
    params: {
      sourceTableName: item.sourceTableName,
      filterFieldName: item.filterFieldName,
      filterFieldValue,
      orderingFieldName: item.orderingFieldName,
      offsetId: currentOffset,
    },
  });

  if (!currentTable) {
    return (
      <div className="border-red-47 bg-red-95 text-red-47 mt-3 rounded border p-2">
        {t('common:global_error')}
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="grid grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-s font-semibold">{item.sourceTableName}</span>
          <ClientObjectDataList data={item.sourceObject} />
        </div>
        {filterFieldValue !== item.pivotObject.pivotValue ? (
          <div className="flex flex-col gap-2">
            <span className="text-s font-semibold">{item.pivotObject.pivotObjectName}</span>
            <ClientObjectDataList data={item.pivotObject.pivotObjectData.data} />
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
              list={query.data.clientDataListResponse.data}
              pagination={
                <DataTablePagination
                  pagination={query.data.clientDataListResponse.pagination}
                  onNext={(offsetId) => {
                    setCurrentOffset(offsetId);
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
  pagination: ClientDataListResponse['pagination'];
  onNext: (offsetId: string | number) => void;
};

function DataTablePagination({ pagination, onNext }: DataTablePaginationProps) {
  const nextCursorId =
    pagination.hasNextPage && pagination.nextCursorId ? pagination.nextCursorId : null;
  return (
    <>
      {nextCursorId ? (
        <Button variant="secondary" onClick={() => onNext(nextCursorId)}>
          <Icon icon="arrow-right" className="size-4" />
        </Button>
      ) : null}
    </>
  );
}

type DataTableProps = {
  pivotObject: PivotObject;
  table: TableModel;
  list: ClientDataListResponse['data'];
  pagination: ReactElement;
  navigateTo: (tab: DataModelExplorerNavigationTab) => void;
};

function DataTable({ pivotObject, table, list, pagination, navigateTo }: DataTableProps) {
  const { t } = useTranslation(['common', 'cases']);
  const language = useFormatLanguage();

  const columnHelper = createColumnHelper<Record<string, unknown>>();
  const [columnList, setColumnList] = useState(() => table.fields.map((f) => f.name));
  const columnOrder = useMemo(
    () => ['object_id', ...table.fields.map((f) => f.name).filter((f) => f !== 'object_id')],
    [table],
  );
  const tableData = useMemo(() => list.map((d) => d.data), [list]);

  useEffect(() => {
    setColumnList(table.fields.map((f) => f.name));
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
                'text-right': parsedData.type === 'number',
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
      columnOrder,
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
        <MenuCommand.Menu>
          <MenuCommand.Trigger>
            <Button variant="secondary">
              <Icon className="size-5" icon="column" />
              {t('cases:data_explorer.columns')}
            </Button>
          </MenuCommand.Trigger>
          <MenuCommand.Content sideOffset={4} align="start" sameWidth>
            <MenuCommand.List>
              {table.fields.map((field) => {
                return (
                  <MenuCommand.Item
                    key={field.name}
                    onSelect={() => handleToggleColumn(field.name)}
                  >
                    {field.name}
                    {columnList.includes(field.name) ? (
                      <Icon icon="tick" className="size-5" />
                    ) : null}
                  </MenuCommand.Item>
                );
              })}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      </div>
      <div className="overflow-x-auto">
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
      </div>
      <div className="flex justify-end gap-2">{pagination}</div>
    </div>
  );
}
