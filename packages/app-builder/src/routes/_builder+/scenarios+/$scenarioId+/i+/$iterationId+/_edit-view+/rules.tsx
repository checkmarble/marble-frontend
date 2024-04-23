import { Highlight } from '@app-builder/components/Highlight';
import { Ping } from '@app-builder/components/Ping';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { CreateRule } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/create';
import { useEditorMode } from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import {
  findRuleValidation,
  hasRuleErrors,
  useCurrentScenarioValidation,
  useGetScenarioErrorMessage,
} from '@app-builder/services/validation';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { type ScenarioIterationRuleDto } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Table, useVirtualTable } from 'ui-design-system';

export const handle = {
  i18n: ['common', 'scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioIterationId = fromParams(params, 'iterationId');

  const scenarioIterationRules = await apiClient.listScenarioIterationRules({
    scenarioIterationId,
  });

  return json(scenarioIterationRules);
}

const columnHelper = createColumnHelper<ScenarioIterationRuleDto>();

export default function Rules() {
  const { t } = useTranslation(handle.i18n);
  const language = useFormatLanguage();

  const iterationId = useParam('iterationId');
  const scenarioId = useParam('scenarioId');
  const editorMode = useEditorMode();

  const navigate = useNavigate();
  const rules = useLoaderData<typeof loader>();
  const scenarioValidation = useCurrentScenarioValidation();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        header: () => <span className="ml-4">{t('scenarios:rules.name')}</span>,
        size: 200,
        cell: ({ getValue, row, table }) => {
          const tableState = table.getState();
          const query =
            typeof tableState.globalFilter === 'string'
              ? tableState.globalFilter
              : '';
          const hasErrors = hasRuleErrors(
            findRuleValidation(scenarioValidation, row.original.id),
          );

          return (
            <span className="flex items-center gap-2">
              <span className="flex w-2 items-center justify-center">
                {hasErrors ? (
                  <Ping className="relative box-content size-[6px] border border-transparent text-red-100" />
                ) : null}
              </span>
              <Highlight text={getValue()} query={query} />
            </span>
          );
        },
      }),
      columnHelper.accessor((row) => row.description, {
        id: 'description',
        header: t('scenarios:rules.description'),
        size: 400,
        cell: ({ getValue, table }) => {
          const tableState = table.getState();
          const query =
            typeof tableState.globalFilter === 'string'
              ? tableState.globalFilter
              : '';

          return <Highlight text={getValue()} query={query} />;
        },
      }),
      columnHelper.accessor((row) => row.scoreModifier, {
        id: 'score',
        cell: ({ getValue }) => {
          const scoreModifier = getValue();
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
      }),
    ],
    [language, scenarioValidation, t],
  );

  const hasRules = rules.length > 0;

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: rules,
    columns,
    columnResizeMode: 'onChange',
    enableSorting: hasRules,
    initialState: {
      sorting: [
        {
          id: 'name',
          desc: false,
        },
      ],
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <EvaluationErrors
        errors={scenarioValidation.rules.errors.map(getScenarioErrorMessage)}
      />

      <div className="flex flex-row items-center justify-between gap-4">
        <form className="flex grow items-center">
          <Input
            className="w-full max-w-xl"
            disabled={rules.length === 0}
            type="search"
            aria-label={t('common:search')}
            placeholder={t('common:search')}
            startAdornment="search"
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
            }}
          />
        </form>
        {editorMode === 'edit' ? (
          <CreateRule scenarioId={scenarioId} iterationId={iterationId} />
        ) : null}
      </div>

      <Table.Container {...getContainerProps()} className="bg-grey-00 max-h-96">
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
