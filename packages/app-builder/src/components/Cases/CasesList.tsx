import { type Case } from '@app-builder/models/cases';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import {
  formatDateRelative,
  formatDateTimeWithoutPresets,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel, type SortingState } from '@tanstack/react-table';
import clsx from 'clsx';
import { differenceInDays } from 'date-fns/differenceInDays';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tooltip, useVirtualTable } from 'ui-design-system';

import { CaseAssignedTo } from './CaseAssignedTo';
import { CaseContributors } from './CaseContributors';
import { CaseStatusBadge } from './CaseStatus';
import { CaseTags } from './CaseTags';
import { casesI18n } from './cases-i18n';

const columnHelper = createColumnHelper<Case>();

export function CasesList({
  className,
  initSorting,
  onSortingChange,
  cases,
}: {
  cases: Case[];
  initSorting: SortingState;
  onSortingChange: (state: SortingState) => void;
  className?: string;
}) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const [sorting, setSorting] = useState<SortingState>(initSorting);
  const { orgTags } = useOrganizationTags();

  useEffect(() => {
    onSortingChange(sorting);
  }, [sorting, onSortingChange]);

  const columns = useMemo(
    () => [
      columnHelper.accessor(({ status }) => ({ status }), {
        id: 'status',
        header: t('cases:case.status'),
        size: 30,
        enableSorting: false,
        cell: ({ getValue }) => (
          <CaseStatusBadge status={getValue().status} size="large" showText={false} />
        ),
      }),
      columnHelper.accessor(({ name }) => name, {
        id: 'name',
        header: t('cases:case.name'),
        size: 200,
        minSize: 120,
        enableSorting: false,
        cell: ({ getValue, row }) => {
          const caseName = getValue();

          return (
            <Tooltip.Default content={caseName}>
              <span className="text-s line-clamp-2 w-fit font-normal group-hover/row-link:text-purple-65 group-hover/row-link:underline">
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
          return Math.abs(differenceInDays(new Date(), dateTime)) > 1 ? (
            <time dateTime={dateTime}>
              {formatDateTimeWithoutPresets(dateTime, { language, dateStyle: 'short' })}
            </time>
          ) : (
            <Tooltip.Default
              arrow={false}
              className="border-grey-90 flex items-center border px-1.5 py-1"
              content={
                <span className="text-2xs font-normal">
                  {formatDateTimeWithoutPresets(dateTime, {
                    language,
                    dateStyle: 'short',
                  })}
                </span>
              }
            >
              <span>{formatDateRelative(dateTime, { language })}</span>
            </Tooltip.Default>
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
            <CaseTags caseTagIds={getValue().map(({ tagId }) => tagId)} orgTags={orgTags} />
          </div>
        ),
      }),
      columnHelper.accessor(({ assignedTo }) => assignedTo, {
        id: 'assignedTo',
        header: t('cases:case.assigned_to'),
        size: 80,
        minSize: 80,
        enableSorting: false,
        cell: ({ getValue }) => (getValue() ? <CaseAssignedTo userId={getValue()!} /> : null),
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
    [language, t, orgTags],
  );

  const { table, getBodyProps, rows, getContainerProps, scrollToTop } = useVirtualTable({
    data: cases,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    manualSorting: true,
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    rowLink: ({ id }) => <Link to={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(id) })} />,
  });

  useEffect(() => {
    scrollToTop();
  }, [cases]);

  return (
    <Table.Container {...getContainerProps()} className={clsx('bg-grey-100', className)}>
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          return <Table.Row key={row.id} row={row} />;
        })}
      </Table.Body>
    </Table.Container>
  );
}
