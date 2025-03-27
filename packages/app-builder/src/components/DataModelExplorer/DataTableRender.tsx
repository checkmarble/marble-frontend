import { type ClientDataListResponse, type DataModel, type TableModel } from '@app-builder/models';
import { type PivotObject } from '@app-builder/models/cases';
import { useClientObjectListQuery } from '@app-builder/queries/client-object-list';
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
import { type TFunction } from 'i18next';
import { useMemo, useRef } from 'react';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { ClientObjectDataList } from './ClientObjectDataList';
import { type TabItem } from './DataModelExplorer';

export type DataTableRenderProps = {
  t: TFunction<'cases'[], undefined>;
  item: TabItem;
  dataModel: DataModel;
  navigateTo: (tabItem: TabItem) => void;
};

export function DataTableRender({ t, dataModel, item, navigateTo }: DataTableRenderProps) {
  const currentTable = dataModel.find((t) => t.name === item.targetTableName);
  const sourceField = item.sourceObject[item.sourceFieldName];
  const filterFieldValue =
    typeof sourceField === 'string' || typeof sourceField === 'number' ? sourceField : undefined;

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
    return <>ERROR: No table found</>;
  }

  if (dataListQuery.isPending) {
    return <>Loading...</>;
  }

  if (dataListQuery.isError) {
    return <>Oops an error has occured</>;
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="grid grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-s font-semibold">{item.sourceTableName}</span>
          <ClientObjectDataList t={t} data={item.sourceObject} />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-s font-semibold">{item.pivotObject.pivotObjectName}</span>
          <ClientObjectDataList t={t} data={item.pivotObject.pivotObjectData.data} />
        </div>
      </div>
      <div className="bg-grey-90 h-px" />
      <div className="overflow-x-auto">
        <DataTable
          pivotObject={item.pivotObject}
          table={currentTable}
          navigateTo={navigateTo}
          data={dataListQuery.data.clientDataListResponse}
        />
      </div>
    </div>
  );
}

type DataTableProps = {
  pivotObject: PivotObject;
  table: TableModel;
  data: ClientDataListResponse;
  navigateTo: (tab: TabItem) => void;
};

function DataTable({ pivotObject, table, data, navigateTo }: DataTableProps) {
  const { data: list, pagination } = data;

  const columnHelper = createColumnHelper<Record<string, unknown>>();
  const columnOrder = useMemo(
    () => ['object_id', ...table.fields.map((f) => f.name).filter((f) => f !== 'object_id')],
    [table],
  );
  const tableData = useMemo(() => list.map((d) => d.data), [list]);

  const columns = useMemo(() => {
    return table.fields.map((field) => {
      return columnHelper.accessor(field.name, {
        header: () => field.name,
        cell: (info) => (
          <span className="relative line-clamp-1 px-4">{info.getValue()?.toString() ?? '-'}</span>
        ),
      });
    });
  }, [columnHelper, table]);

  const reactTable = useReactTable({
    state: {
      columnOrder,
    },
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="mb-4 min-w-full">
      <thead>
        {reactTable.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="text-grey-50 h-10 text-left">
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="px-4 font-normal">
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
                  className="border-grey-90 w-fit min-w-[200px] last:border-l [&:not(:last-child)]:border-r"
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
                <HoverCardContent side="left" align="start" sideOffset={34} className="mt-1">
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
  );
}
