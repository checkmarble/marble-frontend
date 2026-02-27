import { type DebugUpdateJob, type DebugUpdateJobStatus } from '@app-builder/models/continuous-screening-debug';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useTable } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

const columnHelper = createColumnHelper<DebugUpdateJob>();

const statusIcon: Record<DebugUpdateJobStatus, { icon: IconName; className: string }> = {
  pending: { icon: 'schedule', className: 'text-yellow-primary' },
  processing: { icon: 'spinner', className: 'text-blue-58 animate-spin' },
  completed: { icon: 'tick', className: 'text-green-primary' },
  failed: { icon: 'error', className: 'text-red-primary' },
};

interface UpdateJobsTableProps {
  items: DebugUpdateJob[];
}

export const UpdateJobsTable: FunctionComponent<UpdateJobsTableProps> = ({ items }) => {
  const { t } = useTranslation(['settings']);
  const language = useFormatLanguage();

  const columns = useMemo(
    () => [
      columnHelper.accessor('status', {
        id: 'status',
        header: t('settings:continuous_screening_debug.update_jobs.status'),
        size: 40,
        cell: ({ getValue }) => {
          const status = getValue();
          const { icon, className } = statusIcon[status];
          return (
            <div
              className="flex justify-center"
              title={t(`settings:continuous_screening_debug.status.${status}` as const)}
            >
              <Icon icon={icon} className={clsx('size-5', className)} />
            </div>
          );
        },
      }),
      columnHelper.accessor('datasetName', {
        id: 'dataset_name',
        header: t('settings:continuous_screening_debug.update_jobs.dataset_name'),
        size: 80,
        cell: ({ getValue }) => <span className="text-grey-primary text-sm">{getValue()}</span>,
      }),
      columnHelper.accessor('datasetVersion', {
        id: 'dataset_version',
        header: t('settings:continuous_screening_debug.update_jobs.version'),
        size: 120,
        cell: ({ getValue }) => <span className="text-grey-primary font-mono text-xs">{getValue()}</span>,
      }),
      columnHelper.accessor('totalItems', {
        id: 'total_items',
        header: t('settings:continuous_screening_debug.update_jobs.total_items'),
        size: 100,
        cell: ({ getValue }) => <span className="text-grey-primary text-sm">{getValue()}</span>,
      }),
      columnHelper.accessor('createdAt', {
        id: 'created_at',
        header: t('settings:continuous_screening_debug.update_jobs.created_at'),
        size: 80,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <span className="text-grey-primary text-sm">
              {formatDateTimeWithoutPresets(value, {
                language,
                dateStyle: 'short',
                timeStyle: 'medium',
              })}
            </span>
          ) : (
            <span className="text-grey-secondary">-</span>
          );
        },
      }),
      columnHelper.accessor('updatedAt', {
        id: 'updated_at',
        header: t('settings:continuous_screening_debug.update_jobs.updated_at'),
        size: 80,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <span className="text-grey-primary text-sm">
              {formatDateTimeWithoutPresets(value, {
                language,
                dateStyle: 'short',
                timeStyle: 'medium',
              })}
            </span>
          ) : (
            <span className="text-grey-secondary">-</span>
          );
        },
      }),
    ],
    [language, t],
  );

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: items,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Table.Container {...getContainerProps()}>
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => (
          <Table.Row key={row.id} row={row} />
        ))}
      </Table.Body>
    </Table.Container>
  );
};
