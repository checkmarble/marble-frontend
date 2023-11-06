import {
  decisionsI18n,
  Outcome,
  type OutcomeProps,
} from '@app-builder/components';
import { formatDateTime, formatNumber } from '@app-builder/utils/format';
import { type ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type Decision } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag, useVirtualTable } from 'ui-design-system';

export function DecisionsList({ decisions }: { decisions: Decision[] }) {
  const {
    t,
    i18n: { language },
  } = useTranslation(decisionsI18n);

  const columns = useMemo<ColumnDef<Decision, string>[]>(
    () => [
      {
        id: 'created_at',
        accessorFn: (row) => formatDateTime(row.created_at, { language }),
        header: t('decisions:created_at'),
        size: 100,
      },
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
        cell: ({ getValue }) => (
          <span className="capitalize">{getValue<string>()}</span>
        ),
      },
      {
        id: 'score',
        accessorFn: (row) => row.score,
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
    ],
    [language, t]
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
              className={clsx('hover:bg-grey-02 cursor-pointer')}
              row={row}
            />
          );
        })}
      </Table.Body>
    </Table.Container>
  );
}

const Score = ({ score }: { score: number }) => {
  const {
    i18n: { language },
  } = useTranslation(decisionsI18n);
  return (
    <Tag color="purple" border="square" size="big" className="w-16">
      {formatNumber(score, { language, signDisplay: 'exceptZero' })}
    </Tag>
  );
};
