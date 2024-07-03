import { Highlight } from '@app-builder/components/Highlight';
import { type TransferAlertStatus } from '@app-builder/models/transfer-alert';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { type DateRangeFilter } from '@app-builder/utils/schema/filterSchema';
import {
  arrIncludesExactSome,
  dateRangeFilterFn,
} from '@app-builder/utils/table-filter-fn';
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
import { AlertStatus } from './AlertStatus';
import {
  type AlertsFilters,
  AlertsFiltersBar,
  AlertsFiltersMenu,
  AlertsFiltersProvider,
} from './Filters';
import { MessageFilter } from './Filters/FilterDetail/MessageFilter';
import { alertsFilterNames } from './Filters/filters';

interface AlertsListProps {
  alerts: TransferAlertRow[];
  className?: string;
  rowLink: (id: string) => JSX.Element;
}

type TransferAlertColumnFiltersState = (
  | { id: 'status'; value: TransferAlertStatus[] }
  | { id: 'createdAt'; value: DateRangeFilter }
  | { id: 'message'; value: string }
)[];

export function AlertsList({ alerts, className, rowLink }: AlertsListProps) {
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
          rowLink={rowLink}
        />
      </div>
    </AlertsFiltersProvider>
  );
}

interface TransferAlertRow {
  id: string;
  status: TransferAlertStatus;
  message: string;
  createdAt: string;
}

interface AlertsListTableProps {
  alerts: TransferAlertRow[];
  className?: string;
  columnFilters: TransferAlertColumnFiltersState;
  setColumnFilters: OnChangeFn<TransferAlertColumnFiltersState>;
  rowLink: (id: string) => JSX.Element;
}

const columnHelper = createColumnHelper<TransferAlertRow>();

function AlertsListTable({
  alerts,
  className,
  columnFilters,
  setColumnFilters,
  rowLink,
}: AlertsListTableProps) {
  const { t } = useTranslation(alertsI18n);
  const language = useFormatLanguage();

  const columns = React.useMemo(
    () => [
      columnHelper.accessor((row) => row.status, {
        id: 'status',
        header: t('transfercheck:alerts.status'),
        size: 50,
        filterFn: arrIncludesExactSome,
        cell: ({ getValue }) => {
          const status = getValue();
          return <AlertStatus className="relative" status={status} />;
        },
      }),
      columnHelper.accessor((row) => row.message, {
        id: 'message', // Used for filtering, change in both places
        header: t('transfercheck:alerts.message'),
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
        header: t('transfercheck:alerts.created_at'),
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
    rowLink: (row) => rowLink(row.id),
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
            row.original.status === 'archived' ? 'transparent' : 'bg-grey-00';
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
