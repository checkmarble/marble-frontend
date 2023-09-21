import { Callout, Page } from '@app-builder/components';
import {
  adaptDataModelDto,
  type DataModel,
  type DataModelField,
  type LinksToSingle,
} from '@app-builder/models/data-model';
import { serverServices } from '@app-builder/services/init.server';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { Table, useTable } from '@ui-design-system';
import { Help as HelpIcon } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['navigation', 'data'] satisfies Namespace,
};

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const dataModelPromise = apiClient.getDataModel();

  return json({
    dataModels: adaptDataModelDto((await dataModelPromise).data_model),
  });
}

const mapFieldToTableRow = (field: DataModelField) => ({
  name: field.name,
  description: field.description,
  type: field.dataType,
  required: field.nullable ? 'optional' : 'required',
});

const mapLinkToTableRow = (table: DataModel, link: LinksToSingle) => ({
  foreignKey: link.childFieldName,
  parentTable: link.linkedTableName,
  parentFieldName: link.parentFieldName,
  exampleUsage: `${table.name}.${link.linkName}.${link.parentFieldName} = ${table.name}.${link.childFieldName}`,
});

function TableFields({ tableModel }: { tableModel: DataModel }) {
  const { t } = useTranslation(handle.i18n);

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
      },
    ],
    [t]
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
      className="w-fulloverflow-hidden mb-10 rounded-lg bg-white shadow-md"
    >
      <div className="bg-grey-02 border-grey-10 border px-8 py-6 text-lg font-bold capitalize">
        {tableModel.name}
      </div>
      <div className="flex flex-col gap-6 px-6 py-8">
        {tableModel.description && <div>{tableModel.description}</div>}
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
      </div>
    </div>
  );
}

export default function Data() {
  const { t } = useTranslation(handle.i18n);
  const { dataModels } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header>
        <HelpIcon className="mr-2" height="24px" width="24px" />
        {t('navigation:data')}
      </Page.Header>
      <Page.Content>
        <Callout className="whitespace-normal">
          {t('data:your_data_callout')}
        </Callout>
        <div>
          {dataModels.map((table) => (
            <TableFields key={table.name} tableModel={table} />
          ))}
        </div>
      </Page.Content>
    </Page.Container>
  );
}
