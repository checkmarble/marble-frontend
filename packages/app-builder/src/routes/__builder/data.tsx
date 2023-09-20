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
import { Table, useVirtualTable } from '@ui-design-system';
import { Help as HelpIcon } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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

const formatFieldRelationshipDisplay = (
  fieldName: string,
  links: LinksToSingle[]
) => {
  for (const link of links) {
    if (link.childFieldName === fieldName) {
      return `${link.linkName}: ${link.linkedTableName}.${link.parentFieldName}`;
    }
  }
  return '';
};

const mapFieldToTableRow = (field: DataModelField, links: LinksToSingle[]) => ({
  name: field.name,
  description: 'this is a ' + field.name + " and it's a " + field.dataType,
  type: field.dataType + ', ' + (field.nullable ? 'optional' : 'required'),
  relationship: formatFieldRelationshipDisplay(field.name, links),
});

function TableFields({ tableModel }: { tableModel: DataModel }) {
  const { t } = useTranslation(handle.i18n);

  const fields = tableModel.fields.map((field) =>
    mapFieldToTableRow(field, tableModel.linksToSingle)
  );

  const columns = useMemo<ColumnDef<ReturnType<typeof mapFieldToTableRow>>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('data:table_name'),
        size: 200,
        enableSorting: true,
      },
      {
        id: 'type',
        accessorKey: 'type',
        size: 150,
        header: t('data:table_type'),
      },
      {
        id: 'relationship',
        accessorKey: 'relationship',
        header: t('data:table_relationship'),
        size: 250,
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: t('data:table_description'),
        size: 500,
      },
    ],
    [t]
  );

  const {
    table: tab,
    getBodyProps,
    rows,
    getContainerProps,
  } = useVirtualTable({
    data: fields,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div
      key={tableModel.name}
      className="mb-10 w-full overflow-hidden rounded-lg bg-white shadow-md"
    >
      <div className="bg-grey-02 border-grey-10 border px-8 py-6 text-lg font-bold capitalize">
        {tableModel.name}
      </div>
      <hr className="border-grey-10 border-t" />
      <div className="p-8 ">
        <div className="mb-8 ">{tableModel.description}</div>
        <Table.Container {...getContainerProps()}>
          <Table.Header headerGroups={tab.getHeaderGroups()} />
          <Table.Body {...getBodyProps()}>
            {rows.map((row) => (
              <Table.Row
                key={row.id}
                className="hover:bg-grey-02 mb-4 cursor-pointer"
                row={row}
              />
            ))}
          </Table.Body>
        </Table.Container>
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
