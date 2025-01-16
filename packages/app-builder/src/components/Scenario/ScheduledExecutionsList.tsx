import { type ScheduledExecution } from '@app-builder/models/decision';
import {
  formatDateTime,
  formatNumber,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { type ParseKeys } from 'i18next';
import qs from 'qs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useVirtualTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { type DecisionFilters } from '../Decisions';
import { scenarioI18n } from './scenario-i18n';

const columnHelper = createColumnHelper<ScheduledExecution>();

export function ScheduledExecutionsList({
  scheduledExecutions,
}: {
  scheduledExecutions: ScheduledExecution[];
}) {
  const { t } = useTranslation(scenarioI18n);
  const language = useFormatLanguage();

  const columns = useMemo(
    () => [
      columnHelper.accessor((s) => s.numberOfCreatedDecisions, {
        id: 'number-of-created-decisions',
        cell: ({ row, getValue }) => {
          const numberOfCreatedDecisions = getValue();
          const formattedNumber = formatNumber(numberOfCreatedDecisions, {
            language,
          });
          if (numberOfCreatedDecisions > 0) {
            return (
              <Link
                to={getDecisionRoute({
                  scheduledExecutionId: [row.original.id],
                })}
                className="hover:text-purple-60 focus:text-purple-60 text-purple-65 relative font-semibold hover:underline focus:underline"
              >
                {formattedNumber}
              </Link>
            );
          }
          return <span>{formattedNumber}</span>;
        },
        header: t('scenarios:scheduled_execution.number_of_created_decisions'),
        size: 100,
      }),
      columnHelper.accessor((s) => s.numberOfEvaluatedDecisions, {
        id: 'number-of-evaluated-decisions',
        cell: ({ getValue }) => {
          const numberOfEvaluatedDecisions = getValue();
          return (
            <span>
              {formatNumber(numberOfEvaluatedDecisions, {
                language,
              })}
            </span>
          );
        },
        header: t(
          'scenarios:scheduled_execution.number_of_evaluated_decisions',
        ),
        size: 100,
      }),
      columnHelper.accessor((s) => s.numberOfPlannedDecisions, {
        id: 'number-of-planned-decisions',
        cell: ({ getValue }) => {
          const numberOfPlannedDecisions = getValue();
          if (numberOfPlannedDecisions === null) {
            return null;
          }

          return (
            <span>
              {formatNumber(numberOfPlannedDecisions, {
                language,
              })}
            </span>
          );
        },
        header: t('scenarios:scheduled_execution.number_of_planned_decisions'),
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
        header: t('scenarios:scheduled_execution.status'),
        size: 100,
      }),
      columnHelper.accessor((s) => formatDateTime(s.startedAt, { language }), {
        id: 'created_at',
        header: t('scenarios:scheduled_execution.created_at'),
        size: 100,
        cell: ({ getValue, cell }) => {
          return (
            <time dateTime={cell.row.original.startedAt}>{getValue()}</time>
          );
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
      className="bg-grey-100 max-h-[70dvh]"
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

const getStatusIcon = (status: string) => {
  if (status === 'success') {
    return <Icon icon="tick" className="text-green-38 size-6 shrink-0" />;
  }
  if (status === 'failure' || status === 'partial_failure') {
    return <Icon icon="cross" className="text-red-47 size-6 shrink-0" />;
  }
  return <Icon icon="restart-alt" className="text-grey-50 size-6 shrink-0" />;
};

const getStatusTKey = (status: string): ParseKeys<['scenarios']> => {
  if (status === 'success') {
    return 'scenarios:scheduled_execution.status_success';
  }
  if (status === 'failure') {
    return 'scenarios:scheduled_execution.status_failure';
  }
  if (status === 'partial_failure') {
    return 'scenarios:scheduled_execution.status_partial_failure';
  }
  if (status === 'processing') {
    return 'scenarios:scheduled_execution.status_processing';
  }
  return 'scenarios:scheduled_execution.status_pending';
};

function getDecisionRoute(
  decisionFilters: Pick<DecisionFilters, 'scheduledExecutionId'>,
) {
  return `${getRoute('/decisions/')}?${qs.stringify(decisionFilters)}`;
}
