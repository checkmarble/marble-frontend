import {
  type DataModel,
  type DataModelField,
  type DataType,
  type LinkToSingle,
  type Pivot,
  type TableModel,
  type UnicityConstraintType,
} from '@app-builder/models/data-model';
import { CreatePivot } from '@app-builder/routes/ressources+/data+/create-pivot';
import { CreateField } from '@app-builder/routes/ressources+/data+/createField';
import { CreateLink } from '@app-builder/routes/ressources+/data+/createLink';
import { EditField } from '@app-builder/routes/ressources+/data+/editField';
import { EditTable } from '@app-builder/routes/ressources+/data+/editTable';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { getRoute } from '@app-builder/utils/routes';
import { NavLink } from '@remix-run/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Handle, type NodeProps, Position } from 'reactflow';
import * as R from 'remeda';
import { Icon } from 'ui-icons';

import {
  SchemaMenuMenuButton,
  SchemaMenuMenuItem,
  SchemaMenuMenuPopover,
  SchemaMenuRoot,
} from '../Schema/SchemaMenu';
import { dataI18n } from './data-i18n';
import { useSelectedPivot } from './SelectedPivot';

export interface TableModelNodeData {
  original: TableModel;
  dataModel: DataModel;
  pivot?: Pivot;
  linksToThisTable: LinkToSingle[];
  otherTablesWithUnique: TableModel[];
  id: string;
  name: string;
  description?: string;
  columns: {
    id: string;
    name: string;
    description: string;
    dataType: DataType;
    displayType: string;
    nullable: boolean;
    isEnum: boolean;
    tableId: string;
    unicityConstraint: UnicityConstraintType;
  }[];
}

export function adaptTableModelNodeData(
  tableModel: TableModel,
  dataModel: DataModel,
  pivots: Pivot[],
): TableModelNodeData {
  return {
    original: tableModel,
    dataModel,
    pivot: pivots.find((pivot) => pivot.baseTableId === tableModel.id),
    linksToThisTable: dataModel
      .filter((table) => table.id !== tableModel.id)
      .flatMap((table) =>
        table.linksToSingle.filter(
          (link) => link.parentTableName === tableModel.name,
        ),
      ),
    otherTablesWithUnique: dataModel
      .filter((table) => table.id !== tableModel.id)
      .filter((table) =>
        table.fields.some(
          (field) => field.unicityConstraint === 'active_unique_constraint',
        ),
      ),
    id: tableModel.id,
    name: tableModel.name,
    description: tableModel.description,
    columns: tableModel.fields.map((field) => ({
      id: field.id,
      name: field.name,
      description: field.description,
      dataType: field.dataType,
      displayType: field.isEnum ? `${field.dataType} (enum)` : field.dataType,
      nullable: field.nullable,
      isEnum: field.isEnum,
      tableId: field.tableId,
      unicityConstraint: field.unicityConstraint,
    })),
  };
}

export function getTableModelNodeDataId(data: TableModelNodeData): string {
  return data.name;
}

const columnHelper =
  createColumnHelper<TableModelNodeData['columns'][number]>();

export function TableModelNode({ data }: NodeProps<TableModelNodeData>) {
  const { t } = useTranslation(dataI18n);
  const { displayPivot, isFieldPartOfPivot, isTablePartOfPivot } =
    useSelectedPivot();
  const { isEditDataModelFieldAvailable } = useDataModelFeatureAccess();

  const columns = React.useMemo(
    () => [
      columnHelper.group({
        id: 'name',
        header: () => (
          <div className="flex justify-between gap-2 p-4">
            <div className="flex flex-col gap-2 text-start">
              <span className="text-grey-100 text-[30px]">{data.name}</span>
              <FormatDescription description={data.description || ''} />
            </div>
            <div className="flex flex-row gap-2">
              <MoreMenu data={data} />
            </div>
          </div>
        ),
        columns: [
          columnHelper.accessor((row) => row.name, {
            id: 'name',
            header: () => (
              <span className="text-grey-100 flex p-2 text-start font-medium">
                {t('data:field_name')}
              </span>
            ),
            cell: ({ getValue }) => {
              return (
                <span className="text-grey-100 font-semibold">
                  {getValue()}
                </span>
              );
            },
          }),
          columnHelper.accessor((row) => row.displayType, {
            id: 'displayType',
            header: () => (
              <span className="text-grey-100 flex p-2 text-start font-medium">
                {t('data:field_type')}
              </span>
            ),
          }),
          columnHelper.accessor((row) => row.description, {
            id: 'description',
            header: () => (
              <span className="text-grey-100 flex p-2 text-start font-medium">
                {t('data:description')}
              </span>
            ),
            cell: ({ getValue }) => {
              return (
                <FormatDescription description={getValue<string>() || ''} />
              );
            },
          }),
          ...(isEditDataModelFieldAvailable
            ? [
                columnHelper.display({
                  id: 'row-link',
                  header: '',
                  cell: ({ cell }) => (
                    <EditDataModelField
                      key={cell.row.original.id}
                      field={cell.row.original}
                      linksToThisTable={data.linksToThisTable}
                    />
                  ),
                }),
              ]
            : []),
        ],
      }),
    ],
    [isEditDataModelFieldAvailable, data, t],
  );

  const table = useReactTable({
    data: data.columns,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="border-grey-50 bg-grey-00 overflow-hidden rounded-xl border">
      <table
        className={clsx(
          'isolate table-auto border-collapse',
          displayPivot && !isTablePartOfPivot(data.original.id) && 'opacity-20',
        )}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="bg-grey-02 border-b-grey-25 border-b"
            >
              {/* This is the handle for the left side of the table */}
              <th></th>
              {headerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
              {/* This is the handle for the right side of the table */}
              <th></th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const visibleCells = row.getVisibleCells();
            return (
              <tr
                key={row.id}
                className={clsx(
                  'border-t-grey-25 relative scale-100 border-t',
                  !displayPivot &&
                    isEditDataModelFieldAvailable &&
                    'hover:bg-purple-10 group',
                  displayPivot &&
                    isFieldPartOfPivot(row.original.id) &&
                    'bg-purple-10',
                  displayPivot &&
                    !isFieldPartOfPivot(row.original.id) &&
                    'opacity-20',
                )}
              >
                <td className="relative">
                  <Handle
                    type="target"
                    id={row.original.name}
                    position={Position.Left}
                    // For now, we don't want to show the handle or allow connections
                    style={{ background: 'transparent', border: 'none' }}
                    isConnectable={false}
                  />
                </td>
                {visibleCells.map((cell) => {
                  return (
                    <td key={cell.id} className="max-w-96 p-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
                <td className="relative">
                  <Handle
                    type="source"
                    id={row.original.name}
                    position={Position.Right}
                    // For now, we don't want to show the handle or allow connections
                    style={{ background: 'transparent', border: 'none' }}
                    isConnectable={false}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EditDataModelField({
  field,
  linksToThisTable,
}: {
  field: DataModelField;
  linksToThisTable: LinkToSingle[];
}) {
  const { displayPivot } = useSelectedPivot();
  return (
    <EditField field={field} linksToThisTable={linksToThisTable}>
      <button
        disabled={displayPivot}
        className="group-hover:text-grey-100 focus:text-grey-100 block overflow-hidden text-transparent after:absolute after:inset-0 after:content-['']"
      >
        <Icon icon="edit-square" className="size-5" />
      </button>
    </EditField>
  );
}

function FormatDescription({ description }: { description: string }) {
  const { t } = useTranslation(dataI18n);

  return (
    <span
      className={clsx(
        'relative font-normal first-letter:capitalize',
        description ? 'text-grey-100' : 'text-grey-25',
      )}
    >
      {description || t('data:empty_description')}
    </span>
  );
}

function MoreMenu({ data }: { data: TableModelNodeData }) {
  const { t } = useTranslation(dataI18n);

  const { setSelectedPivot } = useSelectedPivot();
  const {
    isIngestDataAvailable,
    isEditDataModelInfoAvailable,
    isCreateDataModelFieldAvailable,
    isCreateDataModelLinkAvailable,
    isCreateDataModelPivotAvailable,
  } = useDataModelFeatureAccess();

  const menuItems = [];
  if (isEditDataModelInfoAvailable) {
    menuItems.push(
      <EditTable key="edit-description" table={data.original}>
        <SchemaMenuMenuItem>
          <Icon icon="edit-square" className="size-6" />
          {t('data:edit_table.title')}
        </SchemaMenuMenuItem>
      </EditTable>,
    );
  }
  if (isIngestDataAvailable) {
    menuItems.push(
      <SchemaMenuMenuItem
        key="upload-data"
        render={
          <NavLink
            to={getRoute('/upload/:objectType', {
              objectType: data.original.name,
            })}
          />
        }
      >
        <Icon icon="upload" className="size-6" />
        {t('data:upload_data')}
      </SchemaMenuMenuItem>,
    );
  }
  if (isCreateDataModelFieldAvailable) {
    menuItems.push(
      <CreateField tableId={data.original.id} key="create-field">
        <SchemaMenuMenuItem>
          <Icon icon="plus" className="size-6" />
          {t('data:create_field.title')}
        </SchemaMenuMenuItem>
      </CreateField>,
    );
  }
  if (
    isCreateDataModelLinkAvailable &&
    R.hasAtLeast(data.otherTablesWithUnique, 1)
  ) {
    menuItems.push(
      <CreateLink
        key="create-link"
        thisTable={data.original}
        otherTables={data.otherTablesWithUnique}
      >
        <SchemaMenuMenuItem>
          <Icon icon="plus" className="size-6" />
          {t('data:create_link.title')}
        </SchemaMenuMenuItem>
      </CreateLink>,
    );
  }
  const { pivot } = data;
  if (pivot) {
    menuItems.push(
      <SchemaMenuMenuItem
        key="view-pivot"
        onClick={() => {
          setSelectedPivot(pivot);
        }}
      >
        <Icon icon="center-focus" className="size-6" />
        {t('data:view_pivot.button')}
      </SchemaMenuMenuItem>,
    );
  } else if (isCreateDataModelPivotAvailable) {
    menuItems.push(
      <CreatePivot
        key="create-pivot"
        tableModel={data.original}
        dataModel={data.dataModel}
      >
        <SchemaMenuMenuItem>
          <Icon icon="plus" className="size-6" />
          {t('data:create_pivot.title')}
        </SchemaMenuMenuItem>
      </CreatePivot>,
    );
  }

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <SchemaMenuRoot>
      <SchemaMenuMenuButton>
        <Icon icon="more-menu" className="size-6 shrink-0" />
      </SchemaMenuMenuButton>
      <SchemaMenuMenuPopover>{menuItems}</SchemaMenuMenuPopover>
    </SchemaMenuRoot>
  );
}
