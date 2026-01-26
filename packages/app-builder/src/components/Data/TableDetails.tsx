import { CollapsiblePaper } from '@app-builder/components';
import { EditField } from '@app-builder/components/Data/EditField';
import { EditTable } from '@app-builder/components/Data/EditTable';
import {
  type DataModel,
  type DataType,
  type TableModel,
  type UnicityConstraintType,
} from '@app-builder/models/data-model';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { getRoute } from '@app-builder/utils/routes';
import { NavLink } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, ButtonV2, Table, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CreateField } from './CreateField';
import { CreateLink } from './CreateLink';
import { DeleteField } from './DeleteDataModel/DeleteField';
import { DeleteLink } from './DeleteDataModel/DeleteLink';
import { DeleteTable } from './DeleteDataModel/DeleteTable';
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
    isDeleteDataModelTableAvailable,
    isDeleteDataModelLinkAvailable,
  } = useDataModelFeatureAccess();

  const otherTablesWithUnique = useMemo(
    () =>
      dataModel
        .filter((table) => table.id !== tableModel.id)
        .filter((table) => table.fields.some((field) => field.unicityConstraint === 'active_unique_constraint')),
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
        id: link.id,
        name: link.name,
        foreignKey: link.childFieldName,
        parentTable: link.parentTableName,
        parentFieldName: link.parentFieldName,
        exampleUsage: `${tableModel.name}.${link.name}.${link.parentFieldName} = ${tableModel.name}.${link.childFieldName}`,
      })),
    [tableModel.linksToSingle, tableModel.name],
  );

  console.log('tableModel', tableModel);
  console.log('dataModel', dataModel);
  return (
    <CollapsiblePaper.Container defaultOpen={false}>
      <CollapsiblePaper.Title size="small">
        <span className="min-w-0 flex-1 truncate">{tableModel.name}</span>

        {isCreateDataModelFieldAvailable ? (
          <div
            className="flex items-center"
            onClick={(e) => {
              //necessary to prevent clicks on modal interactible to trigger the collapsible
              e.stopPropagation();
            }}
          >
            <CreateField tableId={tableModel.id}>
              <ButtonV2
                variant="primary"
                appearance="stroked"
                className="h-6 gap-1 rounded-lg px-2 py-1 text-xs shadow-sm"
              >
                <Icon icon="plus" className="size-4" />
                {t('data:create_field.title')}
              </ButtonV2>
            </CreateField>
          </div>
        ) : null}
        {isIngestDataAvailable ? (
          <NavLink
            className="flex h-6 items-center justify-center gap-1 rounded-lg border border-purple-primary bg-transparent px-2 py-1 text-xs font-medium text-purple-primary shadow-sm transition-colors hover:bg-purple-primary hover:border-purple-primary hover:text-white dark:border-purple-hover dark:text-purple-hover dark:hover:bg-purple-primary dark:hover:border-purple-primary dark:hover:text-grey-white"
            to={getRoute('/upload/:objectType', {
              objectType: tableModel.name,
            })}
          >
            <Icon icon="upload" className="size-4" />
            {t('data:upload_data')}
          </NavLink>
        ) : null}
        {isDeleteDataModelTableAvailable ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DeleteTable table={tableModel} />
          </div>
        ) : null}
      </CollapsiblePaper.Title>
      <CollapsiblePaper.Content>
        <div className="flex flex-col gap-6">
          {isEditDataModelInfoAvailable ? (
            <div className="hover:before:bg-grey-background text-grey-primary group relative flex w-fit flex-row items-center gap-2 before:absolute before:-inset-3 before:block before:rounded-sm before:transition-colors before:ease-in-out hover:cursor-pointer">
              <EditTable table={tableModel}>
                <div className="flex flex-row gap-5">
                  <FormatDescription description={tableModel.description || ''} />
                  <Icon
                    icon="edit-square"
                    className="group-hover:text-grey-primary relative size-6 text-transparent transition-colors ease-in-out"
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
              <TableDetailLinks links={links} isDeleteDataModelLinkAvailable={isDeleteDataModelLinkAvailable} />
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
  const { isEditDataModelFieldAvailable, isDeleteDataModelFieldAvailable } = useDataModelFeatureAccess();

  const linksToThisTable = useMemo(
    () =>
      dataModel
        .filter((table) => table.id !== tableModel.id)
        .flatMap((table) => table.linksToSingle.filter((link) => link.parentTableName === tableModel.name)),
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
          return getValue() ? t('data:create_field.option_optional') : t('data:create_field.option_required');
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
                <Icon icon="tick" className="text-green-primary size-6 shrink-0 justify-center" />
              </div>
            );
          }
          if (unicityConstraint === 'pending_unique_constraint') {
            return (
              <div className="flex size-full items-center justify-center">
                <Icon icon="restart-alt" className="text-grey-secondary size-6 shrink-0" />
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
            <div className="flex flex-row items-center gap-2">
              <div className="min-w-0 flex-1">
                <FormatDescription description={cell.row.original.description} />
              </div>
              {isEditDataModelFieldAvailable ? (
                <div className="flex-shrink-0">
                  <EditField key={cell.row.original.id} field={cell.row.original} linksToThisTable={linksToThisTable}>
                    <ButtonV2 variant="secondary" mode="icon" className="flex size-7">
                      <Icon icon="edit-square" className="size-6 text-purple-primary" />
                    </ButtonV2>
                  </EditField>
                </div>
              ) : null}
              {isDeleteDataModelFieldAvailable ? (
                <div className="flex-shrink-0">
                  {!['object_id', 'updated_at'].includes(cell.row.original.name) ? (
                    <DeleteField field={{ id: cell.row.original.id, name: cell.row.original.name }} />
                  ) : (
                    <div className="size-7" />
                  )}
                </div>
              ) : null}
            </div>
          );
        },
      }),
    ],
    [isDeleteDataModelFieldAvailable, isEditDataModelFieldAvailable, linksToThisTable, t],
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
    id: string;
    name: string;
    foreignKey: string;
    parentTable: string;
    parentFieldName: string;
    exampleUsage: string;
  }>;
  isDeleteDataModelLinkAvailable: boolean;
}

const linksColumnHelper = createColumnHelper<TableDetailLinksProps['links'][number]>();

function TableDetailLinks({ links, isDeleteDataModelLinkAvailable }: TableDetailLinksProps) {
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
        cell: ({ cell }) => {
          return (
            <div className="flex flex-row items-center gap-2">
              <div className="min-w-0 flex-1">
                <span className="truncate block">{cell.getValue()}</span>
              </div>
              {isDeleteDataModelLinkAvailable ? (
                <div className="flex-shrink-0">
                  <DeleteLink link={{ id: cell.row.original.id, name: cell.row.original.name }} />
                </div>
              ) : null}
            </div>
          );
        },
      }),
    ],
    [isDeleteDataModelLinkAvailable, t],
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
          <Table.Row key={row.id} className="group mb-4 break-words" row={row} />
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
        'relative first-letter:capitalize truncate block',
        description ? 'text-grey-primary' : 'text-grey-disabled',
      )}
      title={description || t('data:empty_description')}
    >
      {description || t('data:empty_description')}
    </span>
  );
}
