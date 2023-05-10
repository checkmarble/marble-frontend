import {
  listScenarioIterationRules,
  type ScenarioIterationRule,
} from '@marble-front/api/marble';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { fromParams, fromUUID } from '@marble-front/builder/utils/short-uuid';
import { Table, useVirtualTable } from '@marble-front/ui/design-system';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const scenarioIterationId = fromParams(params, 'iterationId');

  const scenarioIterationRules = await listScenarioIterationRules({
    scenarioIterationId,
  });

  return json(scenarioIterationRules);
}

export default function Rules() {
  const { t } = useTranslation(handle.i18n);

  const navigate = useNavigate();

  const rules = useLoaderData<typeof loader>();

  const columns = useMemo<ColumnDef<ScenarioIterationRule>[]>(
    () => [
      {
        id: 'name',
        accessorFn: (row) => row.name,
        header: t('scenarios:rules.name'),
        size: 200,
      },
      {
        id: 'description',
        accessorFn: (row) => row.description,
        header: t('scenarios:rules.description'),
        size: 600,
      },
      {
        id: 'score',
        accessorFn: (row) => {
          const scoreIncrease = row.scoreModifier;

          if (!scoreIncrease) return '';

          return scoreIncrease >= 0 ? `+${scoreIncrease}` : `-${scoreIncrease}`;
        },
        header: t('scenarios:rules.score'),
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
                navigate(`./${fromUUID(row.original.id)}`);
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
