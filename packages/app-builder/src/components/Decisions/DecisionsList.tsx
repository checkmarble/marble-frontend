import {
  decisionsI18n,
  Outcome,
  type OutcomeProps,
} from '@app-builder/components';
import { formatDateTime } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link, useNavigate } from '@remix-run/react';
import { type ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type DecisionDetail } from 'marble-api';
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
  selectedDecisionIds: string[];
  setSelectedDecisionIds: (ids: string[]) => void;
};

type WithoutSelectable = {
  selectable?: false;
  selectedDecisionIds?: never;
  setSelectedDecisionIds?: never;
};

export function DecisionsList({
  decisions,
  columnVisibility,
  selectable,
  selectedDecisionIds,
  setSelectedDecisionIds,
}: DecisionsListProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation(decisionsI18n);
  const navigate = useNavigate();

  const columns: ColumnDef<DecisionDetail, string>[] = [
    {
      id: 'created_at',
      accessorFn: (row) =>
        formatDateTime(row.created_at, { language, timeStyle: undefined }),
      header: t('decisions:created_at'),
      size: 50,
    },
    {
      id: 'scenario_name',
      accessorFn: (row) => row.scenario.name,
      header: t('decisions:scenario.name'),
      size: 100,
    },
    {
      id: 'trigger_object_type',
      accessorFn: (row) => row.trigger_object_type,
      header: t('decisions:trigger_object.type'),
      size: 100,
      cell: ({ getValue }) => (
        <span className="capitalize">{getValue<string>()}</span>
      ),
    },
    {
      id: 'case',
      accessorFn: (row) => row.case?.name ?? '-',
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
              {getValue<string>()}
            </Link>
          ) : (
            getValue<string>()
          )}
        </span>
      ),
    },
    {
      id: 'score',
      accessorFn: (row) => row.score.toString(),
      header: t('decisions:score'),
      size: 50,
      cell: ({ getValue }) => <Score score={getValue<number>()} />,
    },
    {
      id: 'outcome',
      accessorFn: (row) => row.outcome,
      header: t('decisions:outcome'),
      size: 50,
      cell: ({ getValue }) => (
        <Outcome
          border="square"
          size="big"
          outcome={getValue<OutcomeProps['outcome']>()}
        />
      ),
    },
  ];

  if (selectable) {
    columns.unshift({
      id: 'select',
      header: () => (
        <Checkbox
          defaultChecked={selectedDecisionIds.length === decisions.length}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedDecisionIds(decisions.map((d) => d.id));
            } else {
              setSelectedDecisionIds([]);
            }
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          defaultChecked={selectedDecisionIds.includes(row.original.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedDecisionIds([...selectedDecisionIds, row.original.id]);
            } else {
              setSelectedDecisionIds(
                selectedDecisionIds.filter((id) => id !== row.original.id)
              );
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      ),
      size: 30,
    });
  }

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: decisions,
    columns,
    state: {
      columnVisibility,
    },
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Table.Container {...getContainerProps()}>
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
                  })
                );
              }}
            />
          );
        })}
      </Table.Body>
    </Table.Container>
  );
}
