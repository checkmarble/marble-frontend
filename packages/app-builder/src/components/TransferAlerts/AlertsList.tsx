import { Highlight } from '@app-builder/components/Highlight';
import {
  type TransferAlert,
  type TransferAlertStatus,
} from '@app-builder/models/transfer-alert';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { type DateRangeFilter } from '@app-builder/utils/schema/filterSchema';
import { fromUUID } from '@app-builder/utils/short-uuid';
import {
  arrIncludesExactSome,
  dateRangeFilterFn,
} from '@app-builder/utils/table-filter-fn';
import { Link } from '@remix-run/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type OnChangeFn,
} from '@tanstack/react-table';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useTable } from 'ui-design-system';

import { FiltersButton } from '../Filters/FiltersButton';
import { alertsI18n } from './alerts-i18n';
import {
  type AlertsFilters,
  AlertsFiltersBar,
  AlertsFiltersMenu,
  AlertsFiltersProvider,
} from './Filters';
import { MessageFilter } from './Filters/FilterDetail/MessageFilter';
import { alertsFilterNames } from './Filters/filters';

interface AlertsListProps {
  alerts: TransferAlert[];
  className?: string;
}

type TransferAlertColumnFiltersState = (
  | { id: 'status'; value: TransferAlertStatus[] }
  | { id: 'createdAt'; value: DateRangeFilter }
  | { id: 'message'; value: string }
)[];

export function AlertsList({ alerts, className }: AlertsListProps) {
  const [columnFilters, setColumnFilters] =
    React.useState<TransferAlertColumnFiltersState>([]);

  const filterValues: AlertsFilters = columnFilters.reduce<AlertsFilters>(
    (acc, filter) => {
      if (filter.id === 'status') {
        acc.statuses = filter.value;
      }
      if (filter.id === 'createdAt') {
        acc.dateRange = filter.value;
      }
      if (filter.id === 'message') {
        acc.message = filter.value;
      }
      return acc;
    },
    {},
  );
  const submitRulesFilters = React.useCallback((filters: AlertsFilters) => {
    const nextColumnFilters: TransferAlertColumnFiltersState = [];
    if (filters.statuses) {
      nextColumnFilters.push({ id: 'status', value: filters.statuses });
    }
    if (filters.dateRange) {
      nextColumnFilters.push({ id: 'createdAt', value: filters.dateRange });
    }
    if (filters.message) {
      nextColumnFilters.push({ id: 'message', value: filters.message });
    }
    setColumnFilters(nextColumnFilters);
  }, []);

  return (
    <AlertsFiltersProvider
      filterValues={filterValues}
      submitAlertsFilters={submitRulesFilters}
    >
      <div className="flex flex-col gap-2 lg:gap-4">
        <div className="flex flex-row gap-2 lg:gap-4">
          <MessageFilter disabled={alerts.length === 0} />

          <div className="flex flex-row gap-4">
            <AlertsFiltersMenu filterNames={alertsFilterNames}>
              <FiltersButton />
            </AlertsFiltersMenu>
          </div>
        </div>
        <AlertsFiltersBar />
        <AlertsListTable
          alerts={alerts}
          className={className}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
      </div>
    </AlertsFiltersProvider>
  );
}

interface AlertsListTableProps {
  alerts: TransferAlert[];
  className?: string;
  columnFilters: TransferAlertColumnFiltersState;
  setColumnFilters: OnChangeFn<TransferAlertColumnFiltersState>;
}

const columnHelper = createColumnHelper<TransferAlert>();

function AlertsListTable({
  alerts,
  className,
  columnFilters,
  setColumnFilters,
}: AlertsListTableProps) {
  const { t } = useTranslation(alertsI18n);
  const language = useFormatLanguage();

  const columns = React.useMemo(
    () => [
      columnHelper.accessor((row) => row.status, {
        id: 'status',
        header: t('transfercheck:alerts.list.status'),
        size: 50,
        filterFn: arrIncludesExactSome,
        // TODO: cell renderer
      }),
      columnHelper.accessor((row) => row.message, {
        id: 'message', // Used for filtering, change in both places
        header: t('transfercheck:alerts.list.message'),
        size: 200,
        cell: ({ getValue, column }) => {
          const columnFilterValue = column.getFilterValue();
          const query =
            typeof columnFilterValue === 'string' ? columnFilterValue : '';

          return (
            <div className="py-2">
              <Highlight text={getValue()} query={query} />
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => row.createdAt, {
        id: 'createdAt',
        header: t('transfercheck:alerts.list.created_at'),
        size: 100,
        filterFn: dateRangeFilterFn,
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
    [language, t],
  );

  const { rows, table, getBodyProps, getContainerProps } = useTable({
    data: alerts,
    columns,
    columnResizeMode: 'onChange',
    state: { columnFilters },
    // @ts-expect-error ColumnFiltersState is currently not customizable
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    rowLink: (alert) => (
      <Link
        to={getRoute('/transfercheck/alerts/:alertId', {
          alertId: fromUUID(alert.id),
        })}
      />
    ),
  });

  if (rows.length === 0) {
    return (
      <div className="bg-grey-00 border-grey-10 flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
        <p className="text-s font-medium">
          {alerts.length === 0
            ? t('transfercheck:alerts.empty')
            : t('transfercheck:alerts.search.empty')}
        </p>
      </div>
    );
  }

  return (
    <Table.Container {...getContainerProps()} className={className}>
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
