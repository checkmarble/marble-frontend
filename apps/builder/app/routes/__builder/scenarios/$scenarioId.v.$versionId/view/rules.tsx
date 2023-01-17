import { Decision } from '@marble-front/api/marble';
import { useCurrentScenarioVersion } from '@marble-front/builder/hooks/scenarios';
import { Table, useVirtualTable } from '@marble-front/ui/design-system';
import { useNavigate } from '@remix-run/react';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['scenarios'] as const,
};

export default function Rules() {
  const { t } = useTranslation(handle.i18n);

  const navigate = useNavigate();

  const {
    body: { rules },
  } = useCurrentScenarioVersion();

  const columns = useMemo<ColumnDef<typeof rules[number]>[]>(
    () => [
      {
        id: 'id',
        accessorFn: (row) => row.id,
        header: t('scenarios:rules.id_TEMP'),
        size: 200,
        sortingFn: 'text',
        enableSorting: true,
      },
      {
        id: 'name',
        //@ts-expect-error waiting for name to be added on model
        accessorFn: (row) => row.name,
        header: t('scenarios:rules.name'),
        size: 200,
      },
      {
        id: 'description',
        //@ts-expect-error waiting for name to be added on model
        accessorFn: (row) => row.description,
        header: t('scenarios:rules.description'),
        size: 600,
      },
      {
        id: 'score',
        accessorFn: (row) => {
          const scoreIncrease = row.consequence?.scoreIncrease;

          if (!scoreIncrease) return '';

          return scoreIncrease >= 0 ? `+${scoreIncrease}` : `-${scoreIncrease}`;
        },
        header: t('scenarios:rules.score'),
        size: 100,
      },
      {
        id: 'decision',
        accessorFn: (row) => {
          const decision = row.consequence?.decision;

          switch (decision) {
            case Decision.Accept:
              return 'Accept';
            case Decision.Warning:
              return 'Warn';
            case Decision.Refuse:
              return 'Refuse';
            default:
              return '';
          }
        },
        header: t('scenarios:rules.decision'),
        size: 100,
      },
    ],
    [t]
  );

  const hasRules = rules.length > 0;

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: rules,
    columns,
    columnResizeMode: 'onChange',
    enableSorting: hasRules,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table.Container {...getContainerProps()}>
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {hasRules ? (
          rows.map((row) => (
            <Table.Row
              key={row.id}
              className="hover:bg-grey-02 cursor-pointer"
              row={row}
              onClick={() => {
                navigate(`./${row.original.id}`);
              }}
            />
          ))
        ) : (
          <tr className="h-28">
            <td colSpan={columns.length}>
              <p className="text-center">{t('scenarios:rules.empty')}</p>
            </td>
          </tr>
        )}
      </Table.Body>
    </Table.Container>
  );
}
