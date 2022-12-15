import type { PlainMessage } from '@bufbuild/protobuf';
import type { Rule, Scenario } from '@marble-front/api/marble';
import { Table } from '@marble-front/ui/design-system';
import { json } from '@remix-run/node';
import { useMatches, useParams } from '@remix-run/react';
import {
  type ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['lists'],
};

export default function Rules() {
  const { t } = useTranslation('lists');
  const matches = useMatches();
  const scenario = matches.find(
    ({ id }) => id === `routes/__builder/scenarios/$scenarioId`
  )?.data as Scenario;

  scenario.activeVersion

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
    data: [],
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  // return <Table.Default table={table} />;
}
