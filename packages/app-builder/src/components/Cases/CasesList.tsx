import { type Case } from '@app-builder/models/cases';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tooltip, useVirtualTable } from 'ui-design-system';

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
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();

  const columns = useMemo(
    () => [
      columnHelper.accessor(({ status }) => status, {
        id: 'status',
        header: t('cases:case.status'),
        size: 50,
        cell: ({ getValue }) => (
          <CaseStatus size="big" type="first-letter" status={getValue()} />
        ),
      }),
      columnHelper.accessor(({ name }) => name, {
        id: 'name',
        header: t('cases:case.name'),
        size: 200,
        minSize: 120,
        cell: ({ getValue }) => {
          const caseName = getValue();
          return (
            <Tooltip.Default content={caseName}>
              <span className="text-grey-00 text-s line-clamp-2 w-fit font-normal">
                {caseName}
              </span>
            </Tooltip.Default>
          );
        },
      }),
      columnHelper.accessor(({ createdAt }) => createdAt, {
        id: 'created_at',
        header: t('cases:case.date'),
        size: 70,
        minSize: 70,
        cell: ({ getValue }) => {
          const dateTime = getValue();
          return (
            <time dateTime={dateTime}>
              {formatDateTime(dateTime, { language, timeStyle: undefined })}
            </time>
          );
        },
      }),
      columnHelper.accessor(({ decisionsCount }) => decisionsCount, {
        id: 'decisions',
        header: t('cases:case.decisions'),
        size: 60,
        minSize: 60,
      }),
      columnHelper.accessor(({ tags }) => tags, {
        id: 'tags',
        header: t('cases:case.tags'),
        size: 100,
        cell: ({ getValue }) => (
          <div className="p-2">
            <CaseTags caseTagIds={getValue().map(({ tagId }) => tagId)} />
          </div>
        ),
      }),
      columnHelper.accessor(({ contributors }) => contributors, {
        id: 'contributors',
        header: t('cases:case.contributors'),
        size: 80,
        minSize: 80,
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
    rowLink: ({ id }) => (
      <Link
        to={getRoute('/cases/:caseId', {
          caseId: fromUUID(id),
        })}
      />
    ),
  });

  return (
    <Table.Container
      {...getContainerProps()}
      className={clsx('bg-grey-100', className)}
    >
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          return <Table.Row key={row.id} row={row} />;
        })}
      </Table.Body>
    </Table.Container>
  );
}
