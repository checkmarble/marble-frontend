import { CaseStatus, decisionsI18n, Outcome } from '@app-builder/components';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import {
  type CaseStatus as TCaseStatus,
  type Outcome as TOutcome,
} from 'marble-api';
import {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Table, useVirtualTable } from 'ui-design-system';

import { Score } from './Score';

type Column =
  | 'created_at'
  | 'scenario_name'
  | 'trigger_object_type'
  | 'case'
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
  score: number;
  outcome: TOutcome;
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
                  className="isolate"
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
          <Link
            to={getRoute('/scenarios/:scenarioId', {
              scenarioId: fromUUID(row.original.scenario.id),
            })}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-purple-120 focus:text-purple-120 isolate font-semibold capitalize text-purple-100 hover:underline focus:underline"
          >
            {getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor((row) => row.scenario.version, {
        id: 'scenario_version',
        header: 'Vi',
        size: 20,
        cell: ({ getValue, row }) => (
          <Link
            to={getRoute('/scenarios/:scenarioId/i/:iterationId', {
              scenarioId: fromUUID(row.original.scenario.id),
              iterationId: fromUUID(row.original.scenario.scenarioIterationId),
            })}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-purple-120 focus:text-purple-120 isolate font-semibold capitalize text-purple-100 hover:underline focus:underline"
          >
            {`V${getValue()}`}
          </Link>
        ),
      }),
      columnHelper.accessor((row) => row.triggerObjectType, {
        id: 'trigger_object_type',
        header: t('decisions:trigger_object.type'),
        size: 200,
        cell: ({ getValue }) => (
          <span className="capitalize">{getValue()}</span>
        ),
      }),
      columnHelper.accessor((row) => row.case?.name ?? '-', {
        id: 'case',
        header: t('decisions:case'),
        size: 200,
        cell: ({ getValue, row }) =>
          row.original.case ? (
            <div className="flex w-fit flex-row items-center justify-center gap-1">
              <CaseStatus status={row.original.case.status} />
              <Link
                to={getRoute('/cases/:caseId', {
                  caseId: fromUUID(row.original.case.id),
                })}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-purple-120 focus:text-purple-120 isolate font-semibold capitalize text-purple-100 hover:underline focus:underline"
              >
                {getValue()}
              </Link>
            </div>
          ) : (
            <span className="bg-grey-02 text-grey-100 text-s flex h-8 w-fit items-center justify-center rounded px-2 font-normal">
              {getValue()}
            </span>
          ),
      }),
      columnHelper.accessor((row) => row.score, {
        id: 'score',
        header: t('decisions:score'),
        size: 100,
        cell: ({ getValue }) => <Score score={getValue()} />,
      }),
      columnHelper.accessor((row) => row.outcome, {
        id: 'outcome',
        header: t('decisions:outcome'),
        size: 100,
        cell: ({ getValue }) => (
          <Outcome border="square" size="big" outcome={getValue()} />
        ),
      }),
    ],
    [t, selectable, language],
  );

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
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
              className={clsx('hover:bg-grey-02 relative cursor-pointer')}
              row={row}
            />
          );
        })}
      </Table.Body>
    </Table.Container>
  );
}
