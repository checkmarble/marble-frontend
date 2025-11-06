import { CaseStatusBadge, decisionsI18n, OutcomeBadge } from '@app-builder/components';
import { SelectionProps } from '@app-builder/hooks/useTanstackTableListSelection';
import { type CaseStatus as TCaseStatus } from '@app-builder/models/cases';
import { type ReviewStatus } from '@app-builder/models/decision';
import { type Outcome } from '@app-builder/models/outcome';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { getTableSelectColumn } from '@app-builder/utils/table-selection';
import { Link } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tooltip, useTable } from 'ui-design-system';
import { Score } from './Score';

type Column =
  | 'created_at'
  | 'scenario_name'
  | 'trigger_object_type'
  | 'case'
  | 'pivot_value'
  | 'score'
  | 'outcome';

export interface DecisionViewModel {
  id: string;
  createdAt: string;
  scenario: {
    id: string;
    name: string;
    version: number;
    scenarioIterationId: string;
  };
  triggerObjectType: string;
  case?: {
    id: string;
    name: string;
    status: TCaseStatus;
  };
  pivotValues: {
    id?: string;
    value?: string;
  }[];
  score: number;
  outcome: Outcome;
  reviewStatus?: ReviewStatus;
}

type DecisionsListProps = {
  className?: string;
  decisions: DecisionViewModel[];
  columnVisibility?: Partial<Record<Column, boolean>>;
} & SelectionProps<DecisionViewModel>;

export function useSelectedDecisionIds() {
  const [rowSelection, setRowSelection] = useState({});
  const getSelectedDecisionsRef = useRef<() => DecisionViewModel[]>(() => []);
  const getSelectedDecisions = useCallback(() => getSelectedDecisionsRef.current(), []);

  return {
    hasSelection: Object.keys(rowSelection).length > 0,
    getSelectedDecisions,
    selectionProps: {
      rowSelection,
      setRowSelection,
      getSelectedDecisionsRef,
    },
  };
}

const columnHelper = createColumnHelper<DecisionViewModel>();

export function DecisionsList({
  className,
  decisions,
  columnVisibility,
  selectable,
  selectionProps,
  tableProps,
}: DecisionsListProps) {
  const { t } = useTranslation(decisionsI18n);
  const language = useFormatLanguage();

  const columns = useMemo(
    () => [
      ...getTableSelectColumn(columnHelper, selectable),

      columnHelper.accessor((row) => row.createdAt, {
        id: 'created_at',
        header: t('decisions:created_at'),
        size: 80,
        minSize: 80,
        cell: ({ getValue }) => {
          const dateTime = getValue();
          return (
            <time dateTime={dateTime}>
              {formatDateTimeWithoutPresets(dateTime, { language, dateStyle: 'short' })}
            </time>
          );
        },
      }),
      columnHelper.accessor((row) => row.scenario.name, {
        id: 'scenario_name',
        header: t('decisions:scenario.name'),
        size: 200,
        minSize: 120,
        cell: ({ getValue, row }) => (
          <div className="flex flex-row items-center gap-2">
            <Tooltip.Default content={getValue()}>
              <span className="text-grey-00 text-s line-clamp-2 font-normal">{getValue()}</span>
            </Tooltip.Default>
            <div className="border-grey-90 text-grey-00 rounded-full border px-3 py-1 font-semibold">
              {`V${row.original.scenario.version}`}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.triggerObjectType, {
        id: 'trigger_object_type',
        header: t('decisions:trigger_object.type'),
        size: 100,
        minSize: 100,
        cell: ({ getValue }) => (
          <span className="text-grey-00 text-s line-clamp-2 break-words font-normal">
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.case?.name ?? '-', {
        id: 'case',
        header: t('decisions:case'),
        size: 200,
        minSize: 150,
        cell: ({ getValue, row }) =>
          row.original.case ? (
            <div className="flex w-fit flex-row items-center justify-center gap-2 align-baseline">
              <CaseStatusBadge status={row.original.case.status} size="large" showText={false} />
              <Tooltip.Default content={getValue()}>
                <div className="bg-grey-98 flex h-8 items-center justify-center rounded-sm px-2">
                  <span className="text-grey-00 text-s line-clamp-1 font-normal">{getValue()}</span>
                </div>
              </Tooltip.Default>
            </div>
          ) : (
            <span className="bg-grey-98 text-grey-00 text-s flex size-8 items-center justify-center rounded-sm font-normal">
              {getValue()}
            </span>
          ),
      }),
      columnHelper.accessor((row) => row.pivotValues, {
        id: 'pivot_value',
        header: t('decisions:pivot_value'),
        size: 100,
        cell: ({ getValue }) => {
          const pivotValues = getValue() ?? [];
          if (pivotValues.length === 0) return null;
          return (
            <div className="relative flex flex-col gap-1">
              {pivotValues.map((pivotValue) => (
                <Tooltip.Default key={pivotValue.id} content={pivotValue.value}>
                  <span className="text-grey-00 text-s line-clamp-1 text-ellipsis">
                    {pivotValue.value}
                  </span>
                </Tooltip.Default>
              ))}
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => row.score, {
        id: 'score',
        header: t('decisions:score'),
        size: 50,
        minSize: 80,
        cell: ({ getValue }) => <Score score={getValue()} />,
      }),
      columnHelper.accessor((row) => ({ outcome: row.outcome, reviewStatus: row.reviewStatus }), {
        id: 'outcome',
        header: t('decisions:outcome'),
        size: 150,
        cell: ({ getValue }) => {
          const { outcome, reviewStatus } = getValue();
          return <OutcomeBadge outcome={outcome} reviewStatus={reviewStatus} size="md" />;
        },
      }),
    ],
    [t, selectable, language],
  );

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: decisions,
    columns,
    state: {
      columnVisibility,
      rowSelection: selectionProps?.rowSelection,
    },
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: selectable,
    enableSorting: false,
    ...tableProps,
    rowLink: (decision) => (
      <Link
        to={getRoute('/decisions/:decisionId', {
          decisionId: fromUUIDtoSUUID(decision.id),
        })}
      />
    ),
  });

  return (
    <Table.Container {...getContainerProps()} className={clsx('bg-grey-100', className)}>
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          return <Table.Row key={row.id} row={row} />;
        })}
      </Table.Body>
    </Table.Container>
  );
}
