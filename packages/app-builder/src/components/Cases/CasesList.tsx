import { formatDateTime } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { useNavigate } from '@remix-run/react';
import { type ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type Case } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useVirtualTable } from 'ui-design-system';

import { CaseContributors } from './CaseContributors';
import { casesI18n } from './cases-i18n';
import { CaseStatus } from './CaseStatus';

export function CasesList({ cases }: { cases: Case[] }) {
  const {
    t,
    i18n: { language },
  } = useTranslation(casesI18n);
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<Case, string>[]>(
    () => [
      {
        id: 'status',
        accessorFn: (c) => c.status,
        header: t('cases:case.status'),
        size: 50,
        cell: ({ getValue }) => (
          <CaseStatus status={getValue<Case['status']>()} />
        ),
      },
      {
        id: 'name',
        accessorFn: (c) => c.name,
        header: t('cases:case.name'),
        size: 200,
      },
      {
        id: 'created_at',
        accessorFn: (row) =>
          formatDateTime(row.created_at, { language, timeStyle: undefined }),
        header: t('cases:case.date'),
        size: 100,
      },
      {
        id: 'decisions',
        accessorFn: (c) => c.decisions_count,
        header: t('cases:case.decisions'),
        size: 100,
      },
      {
        id: 'contributors',
        accessorFn: (c) => c.contributors,
        header: t('cases:case.contributors'),
        size: 100,
        cell: ({ getValue }) => (
          <CaseContributors contributors={getValue<Case['contributors']>()} />
        ),
      },
    ],
    [language, t]
  );
  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: cases,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Table.Container {...getContainerProps()}>
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          return (
            <Table.Row
              key={row.id}
              className={clsx('hover:bg-grey-02 cursor-pointer')}
              row={row}
              onClick={() => {
                navigate(
                  getRoute('/cases/:caseId', {
                    caseId: fromUUID(row.original.id),
                  })
                );
              }}
            />
          );
        })}
      </Table.Body>
    </Table.Container>
  );
}
