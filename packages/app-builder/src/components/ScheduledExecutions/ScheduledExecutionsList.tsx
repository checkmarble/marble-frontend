import { type ScheduledExecution } from '@app-builder/models/decision';
import {
  formatDateTime,
  formatNumber,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type ParseKeys } from 'i18next';
import qs from 'qs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useVirtualTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { type DecisionFilters } from '../Decisions';
import { scheduledExecutionI18n } from './scheduledExecution-i18n';
import { ScheduledExecutionDetails } from './ScheduledExecutionDetails';

const columnHelper = createColumnHelper<ScheduledExecution>();

export function ScheduledExecutionsList({
  scheduledExecutions,
}: {
  scheduledExecutions: ScheduledExecution[];
}) {
  const { t } = useTranslation(scheduledExecutionI18n);
  const language = useFormatLanguage();

  const columns = useMemo(
    () => [
      columnHelper.accessor((s) => s.scenarioName, {
        id: 'scenario-name',
        header: t('scheduledExecution:scenario_name'),
        size: 200,
      }),
      columnHelper.accessor((s) => s.scenarioTriggerObjectType, {
        id: 'scenario-trigger_object_type',
        header: t('scheduledExecution:scenario_trigger_object_type'),
        size: 200,
      }),
      columnHelper.accessor((s) => s.numberOfCreatedDecisions, {
        id: 'number-of-created-decisions',
        cell: ({ row, getValue }) => {
          const numberOfCreatedDecisions = getValue();
          const formattedNumber = formatNumber(numberOfCreatedDecisions, {
            language,
          });
          if (
            row.original.status === 'success' &&
            numberOfCreatedDecisions > 0
          ) {
            return (
              <Link
                to={getDecisionRoute({
                  scheduledExecutionId: [row.original.id],
                })}
                className="hover:text-purple-120 focus:text-purple-120 relative font-semibold text-purple-100 hover:underline focus:underline"
              >
                {formattedNumber}
              </Link>
            );
          }
          return <span>{formattedNumber}</span>;
        },
        header: t('scheduledExecution:number_of_created_decisions'),
        size: 100,
      }),
      columnHelper.accessor((s) => s.status, {
        id: 'status',

        cell: ({ getValue }) => (
          <div className="flex flex-row items-center gap-2">
            {getStatusIcon(getValue<string>())}
            <p className="capitalize">{t(getStatusTKey(getValue()))}</p>
          </div>
        ),
        header: t('scheduledExecution:status'),
        size: 150,
      }),
      columnHelper.accessor((s) => formatDateTime(s.startedAt, { language }), {
        id: 'created_at',
        header: t('scheduledExecution:created_at'),
        size: 200,
        cell: ({ getValue, cell }) => {
          return (
            <time dateTime={cell.row.original.startedAt}>{getValue()}</time>
          );
        },
      }),
      columnHelper.display({
        id: 'download',
        header: '',
        size: 200,
        cell: (cell) => {
          if (cell.row.original.numberOfCreatedDecisions > 0) {
            return (
              <ScheduledExecutionDetails
                scheduleExecutionId={cell.row.original.id}
              />
            );
          }
          return null;
        },
      }),
    ],
    [language, t],
  );
  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: scheduledExecutions,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Table.Container
      {...getContainerProps()}
      className="bg-grey-00 max-h-[70dvh]"
    >
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          return (
            <Table.Row
              key={row.id}
              className={clsx('hover:bg-grey-02 cursor-pointer')}
              row={row}
            />
          );
        })}
      </Table.Body>
    </Table.Container>
  );
}

const getStatusIcon = (status: string) => {
  if (status === 'success') {
    return <Icon icon="tick" className="size-6 shrink-0 text-green-100" />;
  }
  if (status === 'failure') {
    return <Icon icon="cross" className="size-6 shrink-0 text-red-100" />;
  }
  return <Icon icon="restart-alt" className="text-grey-50 size-6 shrink-0" />;
};

const getStatusTKey = (status: string): ParseKeys<['scheduledExecution']> => {
  if (status === 'success') {
    return 'scheduledExecution:status_success';
  }
  if (status === 'failure') {
    return 'scheduledExecution:status_failure';
  }
  if (status === 'processing') {
    return 'scheduledExecution:status_processing';
  }
  return 'scheduledExecution:status_pending';
};

function getDecisionRoute(
  decisionFilters: Pick<DecisionFilters, 'scheduledExecutionId'>,
) {
  return `${getRoute('/decisions/')}?${qs.stringify(decisionFilters)}`;
}
