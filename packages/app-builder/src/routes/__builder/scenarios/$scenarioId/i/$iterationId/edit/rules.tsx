import { CreateRule } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/rules/create';
import { serverServices } from '@app-builder/services/init.server';
import { formatNumber } from '@app-builder/utils/format';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import { type ScenarioIterationRuleDto } from '@marble-api';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { Table, useVirtualTable } from '@ui-design-system';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const scenarioIterationId = fromParams(params, 'iterationId');

  const scenarioIterationRules = await apiClient.listScenarioIterationRules({
    scenarioIterationId,
  });

  return json(scenarioIterationRules);
}

export default function Rules() {
  const {
    t,
    i18n: { language },
  } = useTranslation(handle.i18n);

  const iterationId = useParam('iterationId');
  const scenarioId = useParam('scenarioId');
  const navigate = useNavigate();
  const rules = useLoaderData<typeof loader>();

  const columns = useMemo<ColumnDef<ScenarioIterationRuleDto>[]>(
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
        size: 400,
      },
      {
        id: 'score',
        accessorFn: (row) => row.scoreModifier,
        cell: ({ getValue }) => {
          const scoreModifier = getValue<number>();
          if (!scoreModifier) return '';
          return (
            <span
              className={scoreModifier < 0 ? 'text-green-100' : 'text-red-100'}
            >
              {formatNumber(scoreModifier, {
                language,
                signDisplay: 'exceptZero',
              })}
            </span>
          );
        },
        header: t('scenarios:rules.score'),
        size: 100,
      },
    ],
    [language, t]
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-end">
        <CreateRule scenarioId={scenarioId} iterationId={iterationId} />
      </div>
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
    </div>
  );
}
