import { CaseStatus, decisionsI18n } from '@app-builder/components';
import { type CaseStatus as TCaseStatus } from '@app-builder/models/cases';
import { type ReviewStatus } from '@app-builder/models/decision';
import { type Outcome } from '@app-builder/models/outcome';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Table, Tooltip, useTable } from 'ui-design-system';

import { OutcomeAndReviewStatus } from './OutcomeAndReviewStatus';
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
} & (WithSelectable | WithoutSelectable);

type WithSelectable = {
  selectable: true;
  selectionProps: ReturnType<typeof useSelectedDecisionIds>['selectionProps'];
};

type WithoutSelectable = {
  selectable?: false;
  selectionProps?: ReturnType<typeof useSelectedDecisionIds>['selectionProps'];
};

export function useSelectedDecisionIds() {
  const [rowSelection, setRowSelection] = useState({});
  const getSelectedDecisionsRef = useRef<() => DecisionViewModel[]>(() => []);
  const getSelectedDecisions = useCallback(
    () => getSelectedDecisionsRef.current(),
    [],
  );

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
}: DecisionsListProps) {
  const { t } = useTranslation(decisionsI18n);
  const language = useFormatLanguage();

  const columns = useMemo(
    () => [
      ...(selectable
        ? [
            columnHelper.display({
              id: 'select',
              header: ({ table }) => (
                <Checkbox
                  checked={
                    table.getIsAllPageRowsSelected()
                      ? true
                      : table.getIsSomeRowsSelected()
                        ? 'indeterminate'
                        : false
                  }
                  onClick={table.getToggleAllRowsSelectedHandler()}
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  className="relative"
                  checked={row.getIsSelected()}
                  onClick={(e) => {
                    e.stopPropagation();
                    row.getToggleSelectedHandler()(e);
                  }}
                />
              ),
              size: 58,
              enableResizing: false,
            }),
          ]
        : []),

      columnHelper.accessor((row) => row.createdAt, {
        id: 'created_at',
        header: t('decisions:created_at'),
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
      columnHelper.accessor((row) => row.scenario.name, {
        id: 'scenario_name',
        header: t('decisions:scenario.name'),
        size: 200,
        cell: ({ getValue, row }) => (
          <div className="flex flex-row items-center gap-2">
            <Tooltip.Default content={getValue()}>
              <Link
                to={getRoute('/scenarios/:scenarioId/i/:iterationId', {
                  scenarioId: fromUUID(row.original.scenario.id),
                  iterationId: fromUUID(
                    row.original.scenario.scenarioIterationId,
                  ),
                })}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-purple-120 focus:text-purple-120 relative line-clamp-2 font-semibold text-purple-100 hover:underline focus:underline"
              >
                {getValue()}
              </Link>
            </Tooltip.Default>
            <div className="border-grey-10 text-grey-100 rounded-full border px-3 py-1 font-semibold">
              {`V${row.original.scenario.version}`}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.triggerObjectType, {
        id: 'trigger_object_type',
        header: t('decisions:trigger_object.type'),
        size: 150,
      }),
      columnHelper.accessor((row) => row.case?.name ?? '-', {
        id: 'case',
        header: t('decisions:case'),
        size: 150,
        cell: ({ getValue, row }) =>
          row.original.case ? (
            <div className="flex w-fit flex-row items-center justify-center gap-2 align-baseline">
              <CaseStatus
                className="isolate size-8"
                status={row.original.case.status}
              />
              <Tooltip.Default content={getValue()}>
                <Link
                  to={getRoute('/cases/:caseId', {
                    caseId: fromUUID(row.original.case.id),
                  })}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-purple-120 focus:text-purple-120 relative line-clamp-2 font-semibold text-purple-100 hover:underline focus:underline"
                >
                  {getValue()}
                </Link>
              </Tooltip.Default>
            </div>
          ) : (
            <span className="bg-grey-02 text-grey-100 text-s flex h-8 w-fit items-center justify-center rounded px-2 font-normal">
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
                  <span className="text-grey-100 text-s line-clamp-1 text-ellipsis">
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
        size: 80,
        cell: ({ getValue }) => <Score score={getValue()} />,
      }),
      columnHelper.accessor(
        (row) => ({ outcome: row.outcome, reviewStatus: row.reviewStatus }),
        {
          id: 'outcome',
          header: t('decisions:outcome'),
          size: 150,
          cell: ({ getValue }) => {
            const { outcome, reviewStatus } = getValue();
            return (
              <OutcomeAndReviewStatus
                outcome={outcome}
                className="my-2 w-full"
                reviewStatus={reviewStatus}
              />
            );
          },
        },
      ),
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
    onRowSelectionChange: selectionProps?.setRowSelection,
    rowLink: (decision) => (
      <Link
        to={getRoute('/decisions/:decisionId', {
          decisionId: fromUUID(decision.id),
        })}
      />
    ),
  });

  useImperativeHandle(
    selectionProps?.getSelectedDecisionsRef,
    () => () => table.getSelectedRowModel().flatRows.map((row) => row.original),
  );

  return (
    <Table.Container
      {...getContainerProps()}
      className={clsx('bg-grey-00', className)}
    >
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          return (
            <Table.Row
              key={row.id}
              tabIndex={0}
              className={clsx('hover:bg-purple-05 relative cursor-pointer')}
              row={row}
            />
          );
        })}
      </Table.Body>
    </Table.Container>
  );
}
