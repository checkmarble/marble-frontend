import { CollapsiblePaper } from '@app-builder/components';
import {
  type DataModel,
  type DataType,
  type TableModel,
  type UnicityConstraintType,
} from '@app-builder/models/data-model';
import { CreateField } from '@app-builder/routes/ressources+/data+/createField';
import { CreateLink } from '@app-builder/routes/ressources+/data+/createLink';
import { EditField } from '@app-builder/routes/ressources+/data+/editField';
import { EditTable } from '@app-builder/routes/ressources+/data+/editTable';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { getRoute } from '@app-builder/utils/routes';
import { NavLink } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Table, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { dataI18n } from './data-i18n';

interface TableDetailsProps {
  tableModel: TableModel;
  dataModel: DataModel;
}

export function TableDetails({ tableModel, dataModel }: TableDetailsProps) {
  const { t } = useTranslation(dataI18n);
  const {
    isCreateDataModelFieldAvailable,
    isEditDataModelInfoAvailable,
    isIngestDataAvailable,
    isCreateDataModelLinkAvailable,
  } = useDataModelFeatureAccess();

  const otherTablesWithUnique = useMemo(
    () =>
      dataModel
        .filter((table) => table.id !== tableModel.id)
        .filter((table) =>
          table.fields.some((field) => field.unicityConstraint === 'active_unique_constraint'),
        ),
    [dataModel, tableModel],
  );

  // Create table for client db table fields
  const fields = useMemo(
    () =>
      tableModel.fields.map((field) => ({
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
    [tableModel.fields],
  );

  // Create table for links (relations)
  const links = useMemo(
    () =>
      tableModel.linksToSingle.map((link) => ({
        foreignKey: link.childFieldName,
        parentTable: link.parentFieldName,
        parentFieldName: link.parentFieldName,
        exampleUsage: `${tableModel.name}.${link.name}.${link.parentFieldName} = ${tableModel.name}.${link.childFieldName}`,
      })),
    [tableModel.linksToSingle, tableModel.name],
  );

  return (
    <CollapsiblePaper.Container defaultOpen={false}>
      <CollapsiblePaper.Title>
        <span className="flex flex-1">{tableModel.name}</span>

        {isCreateDataModelFieldAvailable ? (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div
            onClick={(e) => {
              //necessary to prevent clicks on modal interactible to trigger the collapsible
              e.stopPropagation();
            }}
          >
            <CreateField tableId={tableModel.id}>
              <Button>
                <Icon icon="plus" className="size-6" />
                {t('data:create_field.title')}
              </Button>
            </CreateField>
          </div>
        ) : null}
        {isIngestDataAvailable ? (
          <NavLink
            className={clsx(
              'text-s flex flex-row items-center justify-center gap-1 rounded border border-solid px-4 py-2 font-semibold outline-none',
              'hover:bg-purple-60 active:bg-purple-60 text-grey-100 focus:border-grey-00 bg-purple-65 disabled:bg-purple-82',
            )}
            to={getRoute('/upload/:objectType', {
              objectType: tableModel.name,
            })}
          >
            <Icon icon="plus" className="size-6" />
            {t('data:upload_data')}
          </NavLink>
        ) : null}
      </CollapsiblePaper.Title>
      <CollapsiblePaper.Content>
        <div className="flex flex-col gap-6">
          {isEditDataModelInfoAvailable ? (
            <div className="before:hover:bg-grey-95 text-grey-00 group relative flex w-fit flex-row items-center gap-2 before:absolute before:-inset-3 before:block before:rounded before:transition-colors before:ease-in-out hover:cursor-pointer">
              <EditTable table={tableModel}>
                <div className="flex flex-row gap-5">
                  <FormatDescription description={tableModel.description || ''} />
                  <Icon
                    icon="edit-square"
                    className="group-hover:text-grey-00 relative size-6 text-transparent transition-colors ease-in-out"
                  />
                </div>
              </EditTable>
            </div>
          ) : (
            <FormatDescription description={tableModel.description || ''} />
          )}

          <TableDetailFields fields={fields} tableModel={tableModel} dataModel={dataModel} />

          {links.length > 0 ? (
            <>
              <p>
                <Trans
                  t={t}
                  i18nKey="data:links_from_table"
                  components={{
                    TableLocale: <span style={{ fontWeight: 'bold' }} />,
                  }}
                  values={{
                    tableName: tableModel.name,
                  }}
                />
              </p>
              <TableDetailLinks links={links} />
            </>
          ) : null}

          {isCreateDataModelLinkAvailable && R.hasAtLeast(otherTablesWithUnique, 1) ? (
            <CreateLink thisTable={tableModel} otherTables={otherTablesWithUnique}>
              <Button className="w-fit" variant="secondary">
                <Icon icon="plus" className="size-6" />
                {t('data:create_link.title')}
              </Button>
            </CreateLink>
          ) : null}
        </div>
      </CollapsiblePaper.Content>
    </CollapsiblePaper.Container>
  );
}

interface TableDetailColumnsProps {
  fields: {
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
  tableModel: TableModel;
  dataModel: DataModel;
}

const fieldsColumnHelper = createColumnHelper<TableDetailColumnsProps['fields'][number]>();

function TableDetailFields({ fields, tableModel, dataModel }: TableDetailColumnsProps) {
  const { t } = useTranslation(dataI18n);
  const { isEditDataModelFieldAvailable } = useDataModelFeatureAccess();

  const linksToThisTable = useMemo(
    () =>
      dataModel
        .filter((table) => table.id !== tableModel.id)
        .flatMap((table) =>
          table.linksToSingle.filter((link) => link.parentTableName === tableModel.name),
        ),
    [dataModel, tableModel],
  );

  const columnsFields = useMemo(
    () => [
      fieldsColumnHelper.accessor('name', {
        id: 'name',
        header: t('data:field_name'),
        size: 350,
      }),
      fieldsColumnHelper.accessor('displayType', {
        id: 'type',
        size: 150,
        header: t('data:field_type'),
      }),
      fieldsColumnHelper.accessor('nullable', {
        id: 'required',
        size: 100,
        header: t('data:field_required'),
        cell: ({ getValue }) => {
          return getValue() ? t('data:nullable') : t('data:required');
        },
      }),
      fieldsColumnHelper.accessor('unicityConstraint', {
        id: 'unicityConstraint',
        size: 70,
        header: t('data:unique.col_header'),
        cell: ({ getValue }) => {
          const unicityConstraint = getValue();
          if (unicityConstraint === 'active_unique_constraint') {
            return (
              <div className="flex size-full items-center justify-center">
                <Icon icon="tick" className="text-green-38 size-6 shrink-0 justify-center" />
              </div>
            );
          }
          if (unicityConstraint === 'pending_unique_constraint') {
            return (
              <div className="flex size-full items-center justify-center">
                <Icon icon="restart-alt" className="text-grey-50 size-6 shrink-0" />
              </div>
            );
          }
          return null;
        },
      }),
      fieldsColumnHelper.accessor('description', {
        id: 'description',
        header: t('data:description'),
        size: 400,
        cell: ({ cell }) => {
          return (
            <div className="flex flex-row items-center justify-between gap-1">
              <FormatDescription description={cell.row.original.description} />
              {isEditDataModelFieldAvailable ? (
                <EditField
                  key={cell.row.original.id}
                  field={cell.row.original}
                  linksToThisTable={linksToThisTable}
                >
                  <div className="group-hover:text-grey-00 group-hover:bg-grey-98 group-hover:border-grey-50 group-hover:hover:bg-grey-95 group-hover:active:bg-grey-90 relative cursor-pointer rounded border p-2 text-transparent transition-colors ease-in-out">
                    <Icon icon="edit-square" className="size-6" />
                  </div>
                </EditField>
              ) : null}
            </div>
          );
        },
      }),
    ],
    [isEditDataModelFieldAvailable, linksToThisTable, t],
  );

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: fields,
    columns: columnsFields,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: false,
  });

  return (
    <Table.Container {...getContainerProps()}>
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => (
          <Table.Row key={row.id} className="group mb-4 break-words" row={row} />
        ))}
      </Table.Body>
    </Table.Container>
  );
}

interface TableDetailLinksProps {
  links: Array<{
    foreignKey: string;
    parentTable: string;
    parentFieldName: string;
    exampleUsage: string;
  }>;
}

const linksColumnHelper = createColumnHelper<TableDetailLinksProps['links'][number]>();

function TableDetailLinks({ links }: TableDetailLinksProps) {
  const { t } = useTranslation(dataI18n);

  const columnsLinks = useMemo(
    () => [
      linksColumnHelper.accessor('foreignKey', {
        id: 'foreignKey',
        header: t('data:foreign_key'),
        size: 150,
        enableSorting: true,
      }),
      linksColumnHelper.accessor('parentTable', {
        id: 'parentTable',
        size: 150,
        header: t('data:parent_table'),
      }),
      linksColumnHelper.accessor('parentFieldName', {
        id: 'parentFieldName',
        size: 150,
        header: t('data:parent_field_name'),
      }),

      linksColumnHelper.accessor('exampleUsage', {
        id: 'exampleUsage',
        size: 300,
        header: t('data:example_usage'),
      }),
    ],
    [t],
  );

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: links,
    columns: columnsLinks,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: false,
  });

  return (
    <Table.Container {...getContainerProps()}>
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => (
          <Table.Row key={row.id} className="mb-4 break-words" row={row} />
        ))}
      </Table.Body>
    </Table.Container>
  );
}

function FormatDescription({ description }: { description: string }) {
  const { t } = useTranslation(dataI18n);

  return (
    <span
      className={clsx(
        'relative first-letter:capitalize',
        description ? 'text-grey-00' : 'text-grey-80',
      )}
    >
      {description || t('data:empty_description')}
    </span>
  );
}
