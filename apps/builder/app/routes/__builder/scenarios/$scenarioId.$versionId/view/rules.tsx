import type { Rule } from '@marble-front/api/marble';
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

  const { rules } = useCurrentScenarioVersion();

  const columns = useMemo<ColumnDef<Rule>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('scenarios:rules.name'),
        size: 200,
        sortingFn: 'text',
        enableSorting: true,
      },
      {
        id: 'description',
        accessorFn: (row) => row.description,
        header: t('scenarios:rules.description'),
        size: 800,
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
