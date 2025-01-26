import { type Case } from '@app-builder/models/cases';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import {
  createColumnHelper,
  getCoreRowModel,
  type SortingState,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tooltip, useVirtualTable } from 'ui-design-system';

import { CaseContributors } from './CaseContributors';
import { casesI18n } from './cases-i18n';
import { CaseStatus } from './CaseStatus';
import { CaseTags } from './CaseTags';

const columnHelper = createColumnHelper<Case>();

export function CasesList({
  className,
  onSortingChange,
  cases,
}: {
  cases: Case[];
  onSortingChange: (state: SortingState) => void;
  className?: string;
}) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    onSortingChange(sorting);
  }, [sorting, onSortingChange]);

  const columns = useMemo(
    () => [
      columnHelper.accessor(({ status }) => status, {
        id: 'status',
        header: t('cases:case.status'),
        size: 50,
        enableSorting: false,
        cell: ({ getValue }) => (
          <CaseStatus size="big" type="first-letter" status={getValue()} />
        ),
      }),
      columnHelper.accessor(({ name }) => name, {
        id: 'name',
        header: t('cases:case.name'),
        size: 200,
        minSize: 120,
        enableSorting: false,
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
        enableSorting: false,
      }),
      columnHelper.accessor(({ tags }) => tags, {
        id: 'tags',
        header: t('cases:case.tags'),
        size: 100,
        enableSorting: false,
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
        enableSorting: false,
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
    state: {
      sorting,
    },
    manualSorting: true,
    onSortingChange: setSorting,
    rowLink: ({ id, inboxId }) => (
      <Link
        to={getRoute('/inboxes/:inboxId/cases/:caseId/', {
          caseId: fromUUID(id),
          inboxId: fromUUID(inboxId),
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
