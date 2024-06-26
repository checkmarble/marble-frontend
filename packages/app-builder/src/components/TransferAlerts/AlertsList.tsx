import { type TransferAlert } from '@app-builder/models/transfer-alert';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useTable } from 'ui-design-system';

import { alertsI18n } from './alerts-i18n';

interface AlertsListProps {
  alerts: TransferAlert[];
}

const columnHelper = createColumnHelper<TransferAlert>();

export function AlertsList({ alerts }: AlertsListProps) {
  const { t } = useTranslation(alertsI18n);
  const language = useFormatLanguage();

  const columns = React.useMemo(
    () => [
      columnHelper.accessor((row) => row.status, {
        id: 'status',
        header: 'Status',
        size: 50,
      }),
      columnHelper.accessor((row) => row.message, {
        id: 'message',
        header: 'Message',
        size: 200,
        cell: ({ getValue }) => {
          const message = getValue();
          return <div className="py-2">{message}</div>;
        },
      }),
      columnHelper.accessor((row) => row.createdAt, {
        id: 'createdAt',
        header: 'Created At',
        size: 100,
        cell: ({ getValue }) => {
          const dateTime = getValue();
          return (
            <time dateTime={dateTime}>
              {formatDateTime(dateTime, { language, timeStyle: undefined })}
            </time>
          );
        },
      }),
    ],
    [language],
  );

  const { rows, table, getBodyProps, getContainerProps } = useTable({
    data: alerts,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    rowLink: (alert) => (
      <Link
        to={getRoute('/transfercheck/alerts/:alertId', {
          alertId: fromUUID(alert.id),
        })}
      />
    ),
  });

  if (rows.length === 0 || alerts.length === 0) {
    const emptyMessage =
      alerts.length === 0
        ? t('transfercheck:alerts.empty')
        : t('transfercheck:alerts.search.empty');
    return (
      <div className="bg-grey-00 border-grey-10 flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
        <p className="text-s font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <Table.Container {...getContainerProps()}>
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          const bgClassName =
            row.original.status === 'unread' ? 'bg-grey-00' : 'transparent';
          return (
            <Table.Row
              key={row.id}
              tabIndex={0}
              className={clsx(
                'hover:bg-grey-02 relative cursor-pointer',
                bgClassName,
              )}
              row={row}
            />
          );
        })}
      </Table.Body>
    </Table.Container>
  );
}
