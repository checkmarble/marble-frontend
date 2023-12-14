import { decisionsI18n, Outcome } from '@app-builder/components';
import { formatDateTime } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link, useNavigate } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type DecisionDetail } from 'marble-api';
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

type DecisionsListProps = {
  decisions: DecisionDetail[];
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
  const getSelectedDecisionsRef = useRef<() => DecisionDetail[]>(() => []);
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

const columnHelper = createColumnHelper<DecisionDetail>();

export function DecisionsList({
  decisions,
  columnVisibility,
  selectable,
  selectionProps,
}: DecisionsListProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation(decisionsI18n);
  const navigate = useNavigate();

  const columns = useMemo(() => {
    const columns = [
      columnHelper.accessor(
        (row) =>
          formatDateTime(row.created_at, { language, timeStyle: undefined }),
        {
          id: 'created_at',
          header: t('decisions:created_at'),
          size: 50,
        },
      ),
      columnHelper.accessor((row) => row.scenario.name, {
        id: 'scenario_name',
        header: t('decisions:scenario.name'),
        size: 100,
      }),
      columnHelper.accessor((row) => row.trigger_object_type, {
        id: 'trigger_object_type',
        header: t('decisions:trigger_object.type'),
        size: 100,
        cell: ({ getValue }) => (
          <span className="capitalize">{getValue()}</span>
        ),
      }),
      columnHelper.accessor((row) => row.case?.name ?? '-', {
        id: 'case',
        header: t('decisions:case'),
        size: 100,
        cell: ({ getValue, row }) => (
          <span className="bg-grey-02 text-grey-100 text-s flex h-8 w-fit items-center justify-center rounded px-2 font-normal">
            {row.original.case ? (
              <Link
                to={getRoute('/cases/:caseId', {
                  caseId: fromUUID(row.original.case.id),
                })}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-purple-120 focus:text-purple-120 font-semibold capitalize text-purple-100"
              >
                {getValue()}
              </Link>
            ) : (
              getValue()
            )}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.score, {
        id: 'score',
        header: t('decisions:score'),
        size: 50,
        cell: ({ getValue }) => <Score score={getValue()} />,
      }),
      columnHelper.accessor((row) => row.outcome, {
        id: 'outcome',
        header: t('decisions:outcome'),
        size: 50,
        cell: ({ getValue }) => (
          <Outcome border="square" size="big" outcome={getValue()} />
        ),
      }),
    ];

    if (selectable) {
      columns.unshift(
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
              checked={row.getIsSelected()}
              onClick={(e) => {
                e.stopPropagation();
                row.getToggleSelectedHandler()(e);
              }}
            />
          ),
          size: 30,
        }),
      );
    }

    return columns;
  }, [t, selectable, language]);

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
  });

  useImperativeHandle(
    selectionProps?.getSelectedDecisionsRef,
    () => () => table.getSelectedRowModel().flatRows.map((row) => row.original),
  );

  return (
    <Table.Container {...getContainerProps()} className="bg-grey-00">
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          return (
            <Table.Row
              key={row.id}
              tabIndex={0}
              className={clsx('hover:bg-grey-02 cursor-pointer')}
              row={row}
              onClick={() => {
                navigate(
                  getRoute('/decisions/:decisionId', {
                    decisionId: fromUUID(row.original.id),
                  }),
                );
              }}
            />
          );
        })}
      </Table.Body>
    </Table.Container>
  );
}
