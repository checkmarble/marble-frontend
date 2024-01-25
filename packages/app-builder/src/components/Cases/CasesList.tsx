import { formatDateTime } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { useNavigate } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type Case } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useVirtualTable } from 'ui-design-system';

import { CaseContributors } from './CaseContributors';
import { casesI18n } from './cases-i18n';
import { CaseStatus } from './CaseStatus';
import { CaseTags } from './CaseTags';

const columnHelper = createColumnHelper<Case>();

export function CasesList({
  className,
  cases,
}: {
  cases: Case[];
  className?: string;
}) {
  const {
    t,
    i18n: { language },
  } = useTranslation(casesI18n);
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      columnHelper.accessor(({ status }) => status, {
        id: 'status',
        header: t('cases:case.status'),
        size: 50,
        cell: ({ getValue }) => <CaseStatus status={getValue()} />,
      }),
      columnHelper.accessor(({ name }) => name, {
        id: 'name',
        header: t('cases:case.name'),
        size: 200,
      }),
      columnHelper.accessor(
        ({ created_at }) =>
          formatDateTime(created_at, { language, timeStyle: undefined }),
        {
          id: 'created_at',
          header: t('cases:case.date'),
          size: 100,
        },
      ),
      columnHelper.accessor(({ decisions_count }) => decisions_count, {
        id: 'decisions',
        header: t('cases:case.decisions'),
        size: 100,
      }),
      columnHelper.accessor(({ tags }) => tags, {
        id: 'tags',
        header: t('cases:case.tags'),
        size: 100,
        cell: ({ getValue }) => (
          <div className="p-2">
            <CaseTags caseTagIds={getValue().map(({ tag_id }) => tag_id)} />
          </div>
        ),
      }),
      columnHelper.accessor(({ contributors }) => contributors, {
        id: 'contributors',
        header: t('cases:case.contributors'),
        size: 100,
        cell: ({ getValue }) => <CaseContributors contributors={getValue()} />,
      }),
    ],
    [language, t],
  );
  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: cases,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Table.Container
      {...getContainerProps()}
      className={clsx('bg-grey-00', className)}
    >
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
                  }),
                );
              }}
            />
          );
        })}
      </Table.Body>
    </Table.Container>
  );
}
