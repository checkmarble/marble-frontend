import { formatDateTime } from '@app-builder/utils/format';
import { type ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type ParseKeys } from 'i18next';
import { type ScheduledExecution } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useVirtualTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { scheduledExecutionI18n } from './scheduledExecution-i18n';
import { ScheduledExecutionDetails } from './ScheduledExecutionDetails';

export function ScheduledExecutionsList({
  scheduledExecutions,
}: {
  scheduledExecutions: ScheduledExecution[];
}) {
  const {
    t,
    i18n: { language },
  } = useTranslation(scheduledExecutionI18n);

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
        size: 200,
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
        size: 150,
      },
      {
        id: 'created_at',
        accessorFn: (s) => formatDateTime(s.started_at, { language }),
        header: t('scheduledExecution:created_at'),
        size: 200,
      },
      {
        id: 'download',
        accessorFn: (s) => s.number_of_created_decisions > 0 && s.id,
        header: '',
        size: 200,
        cell: (r) =>
          r.getValue() ? (
            <ScheduledExecutionDetails scheduleExecutionId={r.getValue()} />
          ) : null,
      },
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
    return <Icon icon="tick" className="size-6 text-green-100" />;
  }
  if (status === 'failure') {
    return <Icon icon="cross" className="size-6 text-red-100" />;
  }
  return <Icon icon="restart-alt" className="text-grey-50 size-6" />;
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
