import { Spinner } from '@app-builder/components/Spinner';
import { type RuleHitTableResponse } from '@app-builder/models/analytics/rule-hit';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { AnalyticsTooltip } from './Tooltip';

const columnHelper = createColumnHelper<RuleHitTableResponse>();

export type RulesHitProps = {
  isComparingRanges: boolean;
  data: RuleHitTableResponse[];
  isLoading: boolean;
};

export function RulesHit({ isComparingRanges, data, isLoading }: RulesHitProps) {
  const { t } = useTranslation(['analytics']);
  const language = useFormatLanguage();
  const [expanded, setExpanded] = useState(false);

  const visibleData = useMemo(() => (expanded ? data : data.slice(0, 5)), [expanded, data]);

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.ruleName, {
        id: 'rule',
        header: t('analytics:rule_hits.columns.rule'),
        size: 220,
        cell: ({ getValue }) => <span className="line-clamp-1">{getValue()}</span>,
      }),
      ...(!isComparingRanges
        ? [
            columnHelper.accessor((row) => row.hitCount, {
              id: 'hitCount',
              header: () => (
                <div className="text-s text-grey-00 flex flex-row items-center font-semibold">
                  {t('analytics:rule_hits.columns.hit_count')}
                  <AnalyticsTooltip className="size-4" content={t('analytics:rule_hits.columns.hit_count.tooltip')} />
                </div>
              ),
              size: 100,
              cell: ({ getValue }) => <span>{formatNumber(getValue().value, { language })}</span>,
            }),
          ]
        : []),
      columnHelper.accessor((row) => row.hitRatio, {
        id: 'hitRatio',
        header: () => (
          <div className="text-s text-grey-00 flex flex-row items-center font-semibold">
            {t('analytics:rule_hits.columns.hit_ratio')}
            <AnalyticsTooltip className="size-4" content={t('analytics:rule_hits.columns.hit_ratio.tooltip')} />
          </div>
        ),
        size: 120,

        cell: ({ getValue }) => {
          const value = getValue().value;
          const compare = getValue().compare;

          return (
            <span className="grid grid-cols-3 items-start font-semibold w-50">
              <span>{formatNumber(Number(value), { language, maximumFractionDigits: 2 })}%</span>
              {compare !== undefined ? (
                <CompareValue value={compare} delta={compare - value} className="text-purple-65" />
              ) : null}
            </span>
          );
        },
      }),
      ...(!isComparingRanges
        ? [
            columnHelper.accessor((row) => row.distinctPivots, {
              id: 'distinctPivots',
              header: () => (
                <div className="text-s text-grey-00 flex flex-row items-center font-semibold">
                  {t('analytics:rule_hits.columns.pivot_count')}
                  <AnalyticsTooltip className="size-4" content={t('analytics:rule_hits.columns.pivot_count.tooltip')} />
                </div>
              ),
              size: 140,
              cell: ({ getValue }) => <span>{formatNumber(getValue().value, { language })}</span>,
            }),
          ]
        : []),
      columnHelper.accessor((row) => row.repeatRatio, {
        id: 'repeatRatio',
        header: () => (
          <div className="text-s text-grey-00 flex flex-row items-center font-semibold">
            {t('analytics:rule_hits.columns.pivot_ratio')}
            <AnalyticsTooltip className="size-4" content={t('analytics:rule_hits.columns.pivot_ratio.tooltip')} />
          </div>
        ),
        size: 160,
        cell: ({ getValue }) => {
          const value = getValue().value;
          const compare = getValue().compare;

          return (
            <span className="grid grid-cols-3 items-start w-50">
              <span>{formatNumber(Number(getValue().value), { language, maximumFractionDigits: 2 })} %</span>
              {compare !== undefined ? (
                <CompareValue value={compare} delta={compare - value} className="text-purple-65" />
              ) : null}
            </span>
          );
        },
      }),
    ],
    [columnHelper, language, t, isComparingRanges],
  );

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: visibleData,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });
  return (
    <div className="bg-grey-background-light rounded-v2-lg p-v2-md flex flex-col gap-v2-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold">{t('analytics:rule_hits.title')}</h2>
      </div>

      <div aria-busy={isLoading} className="relative">
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

type CompareValueProps = {
  value: number;
  delta: number;
  className?: string;
  higherIsBetter?: boolean;
};

const deltaColor = cva('flex flex-row items-center text-xs', {
  variants: {
    higherIsBetter: {
      true: '',
      false: '',
      undefined: 'text-purple-65',
    },
    delta: {
      higher: '',
      lower: '',
      equal: 'text-purple-65',
    },
  },
  compoundVariants: [
    {
      higherIsBetter: true,
      delta: 'higher',
      class: 'text-green-38',
    },
    {
      higherIsBetter: true,
      delta: 'lower',
      class: 'text-red-47',
    },
    {
      higherIsBetter: false,
      delta: 'lower',
      class: 'text-green-38',
    },
    {
      higherIsBetter: false,
      delta: 'higher',
      class: 'text-red-47',
    },
  ],
});

function CompareValue({ value, delta, className, higherIsBetter }: CompareValueProps) {
  const language = useFormatLanguage();
  const absoluteDelta = Math.abs(delta);

  return (
    <>
      <span className={className}>
        {formatNumber(value / 100, { language, maximumFractionDigits: 2, style: 'percent' })}
      </span>
      <span className={deltaColor({ higherIsBetter, delta: delta > 0 ? 'higher' : delta === 0 ? 'equal' : 'lower' })}>
        <Icon icon={delta > 0 ? 'arrow-2-up' : 'arrow-2-down'} className="size-6 shrink-0" />
        {formatNumber(absoluteDelta, { language, maximumFractionDigits: 2 })}pts
      </span>
    </>
  );
}
