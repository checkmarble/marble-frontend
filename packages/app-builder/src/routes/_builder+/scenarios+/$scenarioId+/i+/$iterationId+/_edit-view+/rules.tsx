import { FiltersButton } from '@app-builder/components/Filters/FiltersButton';
import { Highlight } from '@app-builder/components/Highlight';
import { Ping } from '@app-builder/components/Ping';
import { rulesFilterNames } from '@app-builder/components/Scenario/Rules/Filters/filters';
import { RulesFiltersBar } from '@app-builder/components/Scenario/Rules/Filters/RulesFiltersBar';
import {
  type RulesFilters,
  RulesFiltersProvider,
} from '@app-builder/components/Scenario/Rules/Filters/RulesFiltersContext';
import { RulesFiltersMenu } from '@app-builder/components/Scenario/Rules/Filters/RulesFiltersMenu';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { type ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import { CreateRule } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/create';
import { useEditorMode } from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import {
  findRuleValidation,
  hasRuleErrors,
  useGetScenarioErrorMessage,
} from '@app-builder/services/validation';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  type ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Input, Table, Tag, useVirtualTable } from 'ui-design-system';

import { useCurrentScenarioValidation } from '../_layout';

export const handle = {
  i18n: ['common', 'scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { scenarioIterationRuleRepository } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );

  const scenarioIterationId = fromParams(params, 'iterationId');

  const rules = await scenarioIterationRuleRepository.listRules({
    scenarioIterationId,
  });

  const ruleGroups = R.pipe(
    rules,
    R.map((rule) => rule.ruleGroup),
    R.filter((val) => !R.isEmpty(val)),
    R.unique(),
  );

  return json({ rules, ruleGroups });
}

const columnHelper = createColumnHelper<ScenarioIterationRule>();

export default function Rules() {
  const { t } = useTranslation(handle.i18n);
  const language = useFormatLanguage();

  const iterationId = useParam('iterationId');
  const scenarioId = useParam('scenarioId');
  const editorMode = useEditorMode();

  const { rules, ruleGroups } = useLoaderData<typeof loader>();
  const scenarioValidation = useCurrentScenarioValidation();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const columns = React.useMemo(
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
              <Highlight
                text={getValue()}
                query={query}
                className="hyphens-auto"
              />
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
      columnHelper.accessor((row) => row.ruleGroup, {
        id: 'ruleGroup',
        header: t('scenarios:rules.rule_group'),
        size: 100,
        filterFn: 'arrIncludesSome',
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value) return '';
          return <Tag>{value}</Tag>;
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

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const filterValues = R.pullObject(
    columnFilters,
    R.prop('id'),
    R.prop('value'),
  );
  const submitRulesFilters = React.useCallback((filters: RulesFilters) => {
    const nextColumnFilters = R.pipe(
      filters,
      R.entries(),
      R.filter(([_, value]) => value !== undefined),
      R.map(([id, value]) => ({
        id,
        value,
      })),
    );

    setColumnFilters(nextColumnFilters);
  }, []);

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
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    rowLink: ({ id }) => <Link to={`./${fromUUID(id)}`} />,
  });

  return (
    <div className="flex flex-col gap-4">
      <EvaluationErrors
        errors={scenarioValidation.rules.errors.map(getScenarioErrorMessage)}
      />

      <RulesFiltersProvider
        filterValues={filterValues}
        submitRulesFilters={submitRulesFilters}
        ruleGroups={ruleGroups}
      >
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

          <div className="flex flex-row gap-4">
            <RulesFiltersMenu filterNames={rulesFilterNames}>
              <FiltersButton />
            </RulesFiltersMenu>
            {editorMode === 'edit' ? (
              <CreateRule scenarioId={scenarioId} iterationId={iterationId} />
            ) : null}
          </div>
        </div>
        <RulesFiltersBar />
      </RulesFiltersProvider>

      <Table.Container {...getContainerProps()} className="bg-grey-00">
        <Table.Header headerGroups={table.getHeaderGroups()} />
        <Table.Body {...getBodyProps()}>
          {hasRules ? (
            rows.map((row) => <Table.Row key={row.id} row={row} />)
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
