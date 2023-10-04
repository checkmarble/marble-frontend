import { Callout, Page, usePermissionsContext } from '@app-builder/components';
import {
  type DataModelField,
  type LinksToSingle,
  type TableModel,
} from '@app-builder/models/data-model';
import { CreateField } from '@app-builder/routes/ressources/data/createField';
import { CreateLink } from '@app-builder/routes/ressources/data/createLink';
import { CreateTable } from '@app-builder/routes/ressources/data/createTable';
import { EditField } from '@app-builder/routes/ressources/data/editField';
import { EditTable } from '@app-builder/routes/ressources/data/editTable';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderArgs } from '@remix-run/node';
import { NavLink, useLoaderData } from '@remix-run/react';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { Table, useTable } from '@ui-design-system';
import { Edit, Harddrive, Plus } from '@ui-icons';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['navigation', 'data'] satisfies Namespace,
};

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const dataModel = await dataModelRepository.getDataModel();
  return json({ dataModel });
}

const mapFieldToTableRow = (field: DataModelField) => ({
  id: field.id,
  name: field.name,
  description: field.description,
  type: field.dataType,
  required: field.nullable ? 'optional' : 'required',
});

const mapLinkToTableRow = (table: TableModel, link: LinksToSingle) => ({
  foreignKey: link.childFieldName,
  parentTable: link.linkedTableName,
  parentFieldName: link.parentFieldName,
  exampleUsage: `${table.name}.${link.linkName}.${link.parentFieldName} = ${table.name}.${link.childFieldName}`,
});

function EditableText({ children }: { children: React.ReactNode }) {
  return (
    <div className="before:hover:bg-grey-05 group relative flex w-fit flex-row items-center gap-2 before:absolute before:-inset-3 before:block before:rounded before:transition-colors before:ease-in-out">
      <span className="text-grey-100 relative">{children}</span>
    </div>
  );
}

function FormatDescription({ description }: { description: string }) {
  const { t } = useTranslation(handle.i18n);
  return (
    <span className="text-grey-100 relative first-letter:capitalize">
      {description ? (
        description
      ) : (
        <p className="text-grey-25">{t('data:empty_description')}</p>
      )}
    </span>
  );
}

function TableDetails({
  tableModel,
  dataModel,
}: {
  tableModel: TableModel;
  dataModel: TableModel[];
}) {
  const { t } = useTranslation(handle.i18n);
  const { canIngestData, canEditDataModel } = usePermissionsContext();

  const otherTables = useMemo(
    () => dataModel.filter((table) => table.id !== tableModel.id),
    [dataModel, tableModel]
  );

  // Create table for client db table fields
  const fields = useMemo(
    () => tableModel.fields.map((field) => mapFieldToTableRow(field)),
    [tableModel.fields]
  );

  const columnsFields = useMemo<
    ColumnDef<ReturnType<typeof mapFieldToTableRow>>[]
  >(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: t('data:field_name'),
        size: 150,
      },
      {
        id: 'type',
        accessorKey: 'type',
        size: 80,
        header: t('data:field_type'),
      },
      {
        id: 'required',
        accessorKey: 'required',
        size: 80,
        header: t('data:field_required'),
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: t('data:description'),
        size: 500,
        cell: ({ cell }) => {
          return canEditDataModel ? (
            <EditableText key={cell.row.original.id}>
              <EditField
                fieldId={cell.row.original.id}
                description={cell.row.original.description}
              >
                <div className="flex flex-row gap-5">
                  <FormatDescription
                    description={cell.row.original.description}
                  />
                  <Edit
                    className="text-grey-00 group-hover:text-grey-100 relative bg-transparent transition-colors ease-in-out"
                    width={'24px'}
                    height={'24px'}
                  />
                </div>
              </EditField>
            </EditableText>
          ) : (
            <FormatDescription description={cell.row.original.description} />
          );
        },
      },
    ],
    [canEditDataModel, t]
  );

  const {
    table: tableFields,
    getBodyProps: getBodyPropsFields,
    rows: rowsFields,
    getContainerProps: getContainerPropsFields,
  } = useTable({
    data: fields,
    columns: columnsFields,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: false,
  });

  // Create table for links (relations)
  const links = useMemo(
    () =>
      tableModel.linksToSingle.map((link) =>
        mapLinkToTableRow(tableModel, link)
      ),
    [tableModel]
  );

  const columnsLinks = useMemo<
    ColumnDef<ReturnType<typeof mapLinkToTableRow>>[]
  >(
    () => [
      {
        id: 'foreignKey',
        accessorKey: 'foreignKey',
        header: t('data:foreign_key'),
        size: 50,
        enableSorting: true,
      },
      {
        id: 'parentTable',
        accessorKey: 'parentTable',
        size: 50,
        header: t('data:parent_table'),
      },
      {
        id: 'parentFieldName',
        accessorKey: 'parentFieldName',
        header: t('data:parent_field_name'),
        size: 50,
      },
      {
        id: 'exampleUsage',
        accessorKey: 'exampleUsage',
        header: t('data:example_usage'),
        size: 100,
      },
    ],
    [t]
  );

  const {
    table: tableLinks,
    getBodyProps: getBodyPropsLinks,
    rows: rowsLinks,
    getContainerProps: getContainerPropsLinks,
  } = useTable({
    data: links,
    columns: columnsLinks,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: false,
  });

  return (
    <div
      key={tableModel.name}
      className="mb-10 w-full overflow-hidden rounded-lg bg-white shadow-md"
    >
      <div className="bg-grey-02 border-grey-10 flex flex-row items-center justify-between border px-8 py-4 text-lg font-bold capitalize">
        {tableModel.name}
        <div className="flex flex-row justify-end gap-3">
          {canEditDataModel && <CreateField tableId={tableModel.id} />}
          {canIngestData && (
            <NavLink
              className={clsx(
                'text-s flex flex-row items-center justify-center gap-1 rounded border border-solid px-4 py-2 text-base font-semibold outline-none',
                'hover:bg-purple-110 active:bg-purple-120 text-grey-00  border-bg-purple-100 focus:border-grey-100  bg-purple-100 disabled:bg-purple-50'
              )}
              to={getRoute('/upload/:objectType', {
                objectType: tableModel.name,
              })}
            >
              <Plus width={'24px'} height={'24px'} />
              {t('data:upload_data')}
            </NavLink>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-6 px-6 py-8">
        {canEditDataModel ? (
          <EditableText>
            <EditTable table={tableModel}>
              <div className="flex flex-row gap-5">
                <FormatDescription description={tableModel.description || ''} />
                <Edit
                  className="text-grey-00 group-hover:text-grey-100 relative bg-transparent transition-colors ease-in-out"
                  width={'24px'}
                  height={'24px'}
                />
              </div>
            </EditTable>
          </EditableText>
        ) : (
          <FormatDescription description={tableModel.description || ''} />
        )}

        <div>
          <Table.Container {...getContainerPropsFields()}>
            <Table.Header headerGroups={tableFields.getHeaderGroups()} />
            <Table.Body {...getBodyPropsFields()}>
              {rowsFields.map((row) => (
                <Table.Row key={row.id} className="mb-4 break-all" row={row} />
              ))}
            </Table.Body>
          </Table.Container>
        </div>
        {links.length > 0 && (
          <div>
            <p className="pb-6">
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
            <div>
              <Table.Container {...getContainerPropsLinks()}>
                <Table.Header headerGroups={tableLinks.getHeaderGroups()} />
                <Table.Body {...getBodyPropsLinks()}>
                  {rowsLinks.map((row) => (
                    <Table.Row
                      key={row.id}
                      className="mb-4 break-all"
                      row={row}
                    />
                  ))}
                </Table.Body>
              </Table.Container>
            </div>
          </div>
        )}
        {canEditDataModel && otherTables.length > 0 && (
          <CreateLink thisTable={tableModel} otherTables={otherTables} />
        )}
      </div>
    </div>
  );
}

export default function Data() {
  const { t } = useTranslation(handle.i18n);
  const { canEditDataModel } = usePermissionsContext();
  const { dataModel } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="items-center: flex flex-row items-center">
          <Harddrive className="mr-2" height="24px" width="24px" />
          {t('navigation:data')}
        </div>
      </Page.Header>
      <Page.Content>
        <Callout className="whitespace-normal">
          {t('data:your_data_callout')}
        </Callout>
        {canEditDataModel && (
          <div className="max-w-150">
            <CreateTable />
          </div>
        )}
        <div>
          {dataModel.map((table) => (
            <TableDetails
              key={table.name}
              tableModel={table}
              dataModel={dataModel}
            />
          ))}
        </div>
      </Page.Content>
    </Page.Container>
  );
}
