import { formatDateTime } from '@app-builder/utils/format';
import { type ScheduledExecution } from '@marble-api';
import { type ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import { Table, useVirtualTable } from '@ui-design-system';
import { Cross, RestartAlt, Tick } from '@ui-icons';
import clsx from 'clsx';
import { type ParseKeys } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { decisionsI18n } from './decisions-i18n';
import { ScheduledExecutionDetails } from './ScheduledExecutionDetails';

export function ScheduledExecutionsList({
  scheduledExecutions,
}: {
  scheduledExecutions: ScheduledExecution[];
}) {
  const {
    t,
    i18n: { language },
  } = useTranslation(decisionsI18n);

  const columns = useMemo<ColumnDef<ScheduledExecution, string>[]>(
    () => [
      {
        id: 'scenario-name',
        accessorFn: (s) => s.scenario_name,
        header: t('scheduledExecution:scenario_name'),
        size: 200,
      },
      {
        id: 'scenario-trigger_object_type',
        accessorFn: (s) => s.scenario_trigger_object_type,
        header: t('scheduledExecution:scenario_trigger_object_type'),
        size: 200,
      },
      {
        id: 'number-of-created-decisions',
        accessorFn: (s) =>
          s.status == 'success' ? s.number_of_created_decisions : '0',
        header: t('scheduledExecution:number_of_created_decisions'),
        size: 100,
      },
      {
        id: 'status',
        accessorFn: (s) => s.status,
        cell: ({ getValue }) => (
          <div className="flex flex-row items-center gap-2">
            {getStatusIcon(getValue<string>())}
            <p className="capitalize">{t(getStatusTKey(getValue<string>()))}</p>
          </div>
        ),
        header: t('scheduledExecution:status'),
        size: 200,
      },
      {
        id: 'created_at',
        accessorFn: (s) => formatDateTime(s.started_at, { language }),
        header: t('scheduledExecution:created_at'),
        size: 200,
      },
      {
        id: 'download',
        accessorFn: (s) => s.status == 'success' && s.id,
        header: '',
        size: 200,
        cell: (r) =>
          r.getValue() ? (
            <ScheduledExecutionDetails scheduleExecutionId={r.getValue()} />
          ) : null,
      },
    ],
    [language, t]
  );
  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: scheduledExecutions,
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
            />
          );
        })}
      </Table.Body>
    </Table.Container>
  );
}

const getStatusIcon = (status: string) => {
  if (status === 'success') {
    return <Tick className="text-green-100" height="24px" width="24px" />;
  }
  if (status === 'failure') {
    return <Cross className="text-red-100" height="24px" width="24px" />;
  }
  return <RestartAlt className="text-grey-50" height="24px" width="24px" />;
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
