import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type ParseKeys } from 'i18next';
import { type ScheduledExecution } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useVirtualTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

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
      columnHelper.accessor((s) => s.scenario_name, {
        id: 'scenario-name',
        header: t('scheduledExecution:scenario_name'),
        size: 200,
      }),
      columnHelper.accessor((s) => s.scenario_trigger_object_type, {
        id: 'scenario-trigger_object_type',
        header: t('scheduledExecution:scenario_trigger_object_type'),
        size: 200,
      }),
      columnHelper.accessor(
        (s) => (s.status == 'success' ? s.number_of_created_decisions : '0'),
        {
          id: 'number-of-created-decisions',
          header: t('scheduledExecution:number_of_created_decisions'),
          size: 100,
        },
      ),
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
      columnHelper.accessor((s) => formatDateTime(s.started_at, { language }), {
        id: 'created_at',
        header: t('scheduledExecution:created_at'),
        size: 200,
        cell: ({ getValue, cell }) => {
          return (
            <time dateTime={cell.row.original.started_at}>{getValue()}</time>
          );
        },
      }),
      columnHelper.display({
        id: 'download',
        header: '',
        size: 200,
        cell: (cell) => {
          if (cell.row.original.number_of_created_decisions > 0) {
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
  return 'scheduledExecution:status_pending';
};
