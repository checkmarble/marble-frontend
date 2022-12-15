import { useMemo } from 'react';
import { Page } from '@marble-front/builder/components/Page';
import { useTranslation } from 'react-i18next';

import type { ColumnDef } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { faker } from '@faker-js/faker';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Table } from '@marble-front/ui/design-system';

type List = {
  name: string;
  description: string;
};

const fakeLists = Array.from({ length: 2500 }).map(() => ({
  name: faker.name.fullName(),
  description: faker.lorem.sentences(),
}));

export async function loader() {
  /** TODO(data): get list from API */

  return json<List[]>(fakeLists);
}

export const handle = {
  i18n: ['lists', 'navigation'],
};

export default function Lists() {
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

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  return (
    <Page.Container>
      <Page.Header>{t('navigation:lists')}</Page.Header>
      <Page.Content>
        <Table.Default table={table} />
      </Page.Content>
    </Page.Container>
  );
}
