import { Outcome, type OutcomeProps } from '@app-builder/components';
import { formatCreatedAt } from '@app-builder/utils/format';
import { type Decision } from '@marble-api';
import { type ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import { Table, useVirtualTable } from '@ui-design-system';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function DecisionsList({
  decisions,
  selectedDecisionId,
  onSelectDecision,
}: {
  decisions: Decision[];
  selectedDecisionId: string | null;
  onSelectDecision: (decisionId: string) => void;
}) {
  const { t, i18n } = useTranslation(['decisions']);

  const columns = useMemo<ColumnDef<Decision, string>[]>(
    () => [
      {
        id: 'scenario.name',
        accessorFn: (row) => row.scenario.name,
        header: t('decisions:scenario.name'),
        size: 200,
      },
      {
        id: 'trigger_object_type',
        accessorFn: (row) => row.trigger_object_type,
        header: t('decisions:trigger_object.type'),
        size: 100,
      },
      {
        id: 'score',
        accessorFn: (row) => row.score,
        header: t('decisions:score'),
        size: 100,
      },
      {
        id: 'outcome',
        accessorFn: (row) => row.outcome,
        header: t('decisions:outcome'),
        size: 100,
        cell: ({ getValue }) => (
          <Outcome
            border="square"
            size="big"
            outcome={getValue<OutcomeProps['outcome']>()}
          />
        ),
      },
      {
        id: 'created_at',
        accessorFn: (row) => formatCreatedAt(i18n.language, row.created_at),
        header: t('decisions:created_at'),
        size: 200,
      },
    ],
    [i18n.language, t]
  );
  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: decisions,
    columns,
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
              className={clsx(
                'hover:bg-grey-02 cursor-pointer',
                row.original.id === selectedDecisionId && 'bg-grey-02'
              )}
              row={row}
              onClick={(e) => {
                onSelectDecision(row.original.id);
                e.stopPropagation(); // To prevent DecisionsRightPanel from closing
              }}
            />
          );
        })}
      </Table.Body>
    </Table.Container>
  );
}
