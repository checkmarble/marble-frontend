import { Spinner } from '@app-builder/components/Spinner';
import { type RuleHitTableResponse } from '@app-builder/models/analytics/rule-hit';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useTable } from 'ui-design-system';

const columnHelper = createColumnHelper<RuleHitTableResponse>();

export function RulesHit({
  data,
  isLoading,
}: {
  data: RuleHitTableResponse[];
  isLoading: boolean;
}) {
  const { t } = useTranslation(['analytics']);
  const language = useFormatLanguage();
  const [expanded, setExpanded] = useState(false);

  const visibleData = useMemo(() => (expanded ? data : data.slice(0, 5)), [expanded, data]);

  const toPercent = (value: number) =>
    formatNumber(value > 1 ? value / 100 : value, {
      language,
      style: 'percent',
      maximumFractionDigits: 1,
    });

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.ruleName, {
        id: 'rule',
        header: t('analytics:ruleshit.columns.rule'),
        size: 220,
        cell: ({ getValue }) => <span className="line-clamp-1">{getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.hitCount, {
        id: 'hitCount',
        header: t('analytics:ruleshit.columns.hit_count'),
        size: 100,
        cell: ({ getValue }) => <span>{formatNumber(getValue(), { language })}</span>,
      }),
      columnHelper.accessor((row) => row.hitRatio, {
        id: 'hitRatio',
        header: t('analytics:ruleshit.columns.hit_ratio'),
        size: 120,
        cell: ({ getValue }) => <span>{toPercent(getValue())}</span>,
      }),
      columnHelper.accessor((row) => row.pivotCount, {
        id: 'pivotCount',
        header: t('analytics:ruleshit.columns.pivot_count'),
        size: 140,
        cell: ({ getValue }) => <span>{formatNumber(getValue(), { language })}</span>,
      }),
      columnHelper.accessor((row) => row.pivotRatio, {
        id: 'pivotRatio',
        header: t('analytics:ruleshit.columns.pivot_ratio'),
        size: 160,
        cell: ({ getValue }) => <span>{toPercent(getValue())}</span>,
      }),
    ],
    [columnHelper, language, t],
  );

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: visibleData,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });
  return (
    <div className="mt-v2-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold">{t('analytics:ruleshit.title')}</h2>
      </div>

      <div
        aria-busy={isLoading}
        className="bg-white border border-grey-90 rounded-lg p-v2-md shadow-sm mt-v2-sm relative"
      >
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-grey-98/80 hover:bg-grey-95/80">
            <Spinner className="size-6" />
          </div>
        ) : null}
        <div className="flex w-full flex-col items-start gap-v2-md">
          <Table.Container {...getContainerProps()} className="bg-grey-100 w-full">
            <Table.Header headerGroups={table.getHeaderGroups()} />
            <Table.Body {...getBodyProps()}>
              {rows.map((row) => (
                <Table.Row key={row.id} row={row} />
              ))}
              {!expanded && data.length > 5 ? (
                <tr
                  className="even:bg-grey-98 h-12 hover:bg-purple-98 cursor-pointer"
                  onClick={() => setExpanded(true)}
                >
                  <td
                    className="text-s w-full truncate px-4 font-medium text-purple-65"
                    colSpan={table.getHeaderGroups()[0]?.headers.length ?? 5}
                  >
                    {t('analytics:ruleshit.see_more.label')}
                  </td>
                </tr>
              ) : null}
            </Table.Body>
          </Table.Container>
        </div>
        {!isLoading && !data.length ? (
          <div className="flex items-center justify-center h-full min-h-40">
            <span className="text-v2-md text-grey-80">{t('analytics:no_data')}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
