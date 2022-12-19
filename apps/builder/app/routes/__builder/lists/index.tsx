import { useMemo } from 'react';
import { Page } from '@marble-front/builder/components/Page';
import { useTranslation } from 'react-i18next';

import { type ColumnDef } from '@tanstack/react-table';
import { getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { faker } from '@faker-js/faker';

import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { Table, useVirtualTable } from '@marble-front/ui/design-system';
import { Lists } from '@marble-front/ui/icons';

type List = {
  name: string;
  description: string;
};

const fakeLists = Array.from({ length: 2500 }).map(() => ({
  name: faker.name.fullName(),
  description: faker.lorem.sentences(),
}));

export async function loader() {
  /** TODO(data): get lists from API */

  return json<List[]>(fakeLists);
}

export const handle = {
  i18n: ['lists', 'navigation'],
};

export default function ListsPage() {
  const { t } = useTranslation(['navigation', 'lists']);
  const data = useLoaderData<typeof loader>();

  const columns = useMemo<ColumnDef<List>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('lists:name'),
        size: 200,
        sortingFn: 'text',
        enableSorting: true,
      },
      {
        id: 'description',
        accessorFn: (row) => row.description,
        header: t('lists:description'),
        size: 800,
      },
    ],
    [t]
  );

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const navigate = useNavigate();

  return (
    <Page.Container>
      <Page.Header>
        <Lists className="mr-2" height="24px" width="24px" />
        {t('navigation:lists')}
      </Page.Header>
      <Page.Content>
        <Table.Container {...getContainerProps()}>
          <Table.Header headerGroups={table.getHeaderGroups()} />
          <Table.Body {...getBodyProps()}>
            {rows.map((row) => (
              <Table.Row
                key={row.id}
                className="hover:bg-grey-02 cursor-pointer"
                row={row}
                onClick={() => {
                  navigate(`./${row.id}`);
                }}
              />
            ))}
          </Table.Body>
        </Table.Container>
      </Page.Content>
    </Page.Container>
  );
}
