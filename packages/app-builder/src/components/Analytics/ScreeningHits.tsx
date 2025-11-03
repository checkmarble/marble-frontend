import { type ScreeningHitTableResponse } from '@app-builder/models/analytics';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useTable } from 'ui-design-system';
import { Spinner } from '../Spinner';

export function ScreeningHits({
  data,
  isLoading,
}: {
  data: ScreeningHitTableResponse[];
  isLoading: boolean;
}) {
  const { t } = useTranslation(['analytics']);
  const language = useFormatLanguage();
  const [expanded, setExpanded] = useState(false);

  const toPercent = (value: number) =>
    formatNumber(value > 1 ? value / 100 : value, {
      language,
      style: 'percent',
      maximumFractionDigits: 1,
    });

  const visibleData = useMemo(() => (expanded ? data : data.slice(0, 5)), [expanded, data]);

  const columnHelper = createColumnHelper<ScreeningHitTableResponse>();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('analytics:screeninghits.columns.name'),
        cell: ({ getValue }) => <span className="line-clamp-1">{getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.execs, {
        id: 'execs',
        header: t('analytics:screeninghits.columns.execs'),
      }),
      columnHelper.accessor((row) => row.hits, {
        id: 'hits',
        header: t('analytics:screeninghits.columns.hits'),
      }),
      columnHelper.accessor((row) => row.hitRatio, {
        id: 'hitRatio',
        header: t('analytics:screeninghits.columns.hit_ratio'),
        cell: ({ getValue }) => <span>{toPercent(getValue())}</span>,
      }),
      columnHelper.accessor((row) => row.avgHitsPerScreening, {
        id: 'avgHitsPerScreening',
        header: t('analytics:screeninghits.columns.avg_hits_per_screening'),
        cell: ({ getValue }) => <span>{formatNumber(getValue(), { language })}</span>,
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
        <h2 className="text-h2 font-semibold">{t('analytics:screeninghits.title')}</h2>
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
      </div>
    </div>
  );
}
