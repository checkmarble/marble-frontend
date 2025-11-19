import { type ScreeningHitTableResponse } from '@app-builder/models/analytics';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TooltipV2, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Spinner } from '../Spinner';

const columnHelper = createColumnHelper<ScreeningHitTableResponse>();

export function ScreeningHits({ data, isLoading }: { data: ScreeningHitTableResponse[]; isLoading: boolean }) {
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

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('analytics:screening_hits.columns.name'),
        cell: ({ getValue }) => <span className="line-clamp-1">{getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.execs, {
        id: 'execs',
        header: () => (
          <div className="text-s text-grey-00 flex flex-row items-center font-semibold">
            {t('analytics:screening_hits.columns.execs')}
            <TooltipV2.Provider>
              <TooltipV2.Tooltip>
                <TooltipV2.TooltipTrigger asChild>
                  <Icon icon="tip" className="size-4 text-grey-60 hover:text-purple-65 cursor-pointer ml-v2-sm" />
                </TooltipV2.TooltipTrigger>
                <TooltipV2.TooltipContent>
                  <span className="font-normal">{t('analytics:screening_hits.columns.execs.tooltip')}</span>
                </TooltipV2.TooltipContent>
              </TooltipV2.Tooltip>
            </TooltipV2.Provider>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.hits, {
        id: 'hits',
        header: () => (
          <div className="text-s text-grey-00 flex flex-row items-center font-semibold">
            {t('analytics:screening_hits.columns.hits')}
            <TooltipV2.Provider>
              <TooltipV2.Tooltip>
                <TooltipV2.TooltipTrigger asChild>
                  <Icon icon="tip" className="size-4 text-grey-60 hover:text-purple-65 cursor-pointer ml-v2-sm" />
                </TooltipV2.TooltipTrigger>
                <TooltipV2.TooltipContent>
                  <span className="font-normal">{t('analytics:screening_hits.columns.hits.tooltip')}</span>
                </TooltipV2.TooltipContent>
              </TooltipV2.Tooltip>
            </TooltipV2.Provider>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.hitRatio, {
        id: 'hitRatio',
        header: () => (
          <div className="text-s text-grey-00 flex flex-row items-center font-semibold">
            {t('analytics:screening_hits.columns.hit_ratio')}
            <TooltipV2.Provider>
              <TooltipV2.Tooltip>
                <TooltipV2.TooltipTrigger asChild>
                  <Icon icon="tip" className="size-4 text-grey-60 hover:text-purple-65 cursor-pointer ml-v2-sm" />
                </TooltipV2.TooltipTrigger>
                <TooltipV2.TooltipContent>
                  <span className="font-normal">{t('analytics:screening_hits.columns.hit_ratio.tooltip')}</span>
                </TooltipV2.TooltipContent>
              </TooltipV2.Tooltip>
            </TooltipV2.Provider>
          </div>
        ),
        cell: ({ getValue }) => <span>{toPercent(getValue())}</span>,
      }),
      columnHelper.accessor((row) => row.avgHitsPerScreening, {
        id: 'avgHitsPerScreening',
        header: () => (
          <div className="text-s text-grey-00 flex flex-row items-center font-semibold">
            {t('analytics:screening_hits.columns.avg_hits_per_screening')}
            <TooltipV2.Provider>
              <TooltipV2.Tooltip>
                <TooltipV2.TooltipTrigger asChild>
                  <Icon icon="tip" className="size-4 text-grey-60 hover:text-purple-65 cursor-pointer ml-v2-sm" />
                </TooltipV2.TooltipTrigger>
                <TooltipV2.TooltipContent>
                  <span className="font-normal">
                    {t('analytics:screening_hits.columns.avg_hits_per_screening.tooltip')}
                  </span>
                </TooltipV2.TooltipContent>
              </TooltipV2.Tooltip>
            </TooltipV2.Provider>
          </div>
        ),
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
        <h2 className="text-h2 font-semibold">{t('analytics:screening_hits.title')}</h2>
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
                    {t('analytics:rule_hits.see_more.label')}
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
