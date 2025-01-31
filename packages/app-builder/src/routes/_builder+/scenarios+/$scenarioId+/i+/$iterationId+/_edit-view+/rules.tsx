import { OutcomeTag } from '@app-builder/components';
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
import { type KnownOutcome } from '@app-builder/models/outcome';
import { type ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import { type ScenarioIterationSanction } from '@app-builder/models/scenario-iteration-sanction';
import { CreateRule } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/create';
import { CreateSanction } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/sanctions+/create';
import { useEditorMode } from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import {
  findRuleValidation,
  hasRuleErrors,
  useGetScenarioErrorMessage,
} from '@app-builder/services/validation';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  type ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { type FeatureAccessDto } from 'marble-api/generated/license-api';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import {
  CtaClassName,
  Input,
  Table,
  Tag,
  useVirtualTable,
} from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useCurrentScenarioValidation } from '../_layout';

export const handle = {
  i18n: ['common', 'scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const {
    scenarioIterationRuleRepository,
    scenarioIterationSanctionRepository,
    entitlements,
  } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioIterationId = fromParams(params, 'iterationId');

  const rules = await scenarioIterationRuleRepository.listRules({
    scenarioIterationId,
  });

  const sanctions = await scenarioIterationSanctionRepository.listSanctions({
    scenarioIterationId,
  });

  const items = [
    ...rules.map((r) => ({ ...r, type: 'rule' as const })),
    ...sanctions.map((s) => ({ ...s, type: 'sanction' as const })),
  ];

  const ruleGroups = R.pipe(
    items,
    R.map((i) => i.ruleGroup),
    R.filter((val) => !R.isEmpty(val)),
    R.unique(),
  );

  return {
    items,
    ruleGroups,
    isSanctionAvailable: entitlements.sanctions,
  };
}

const columnHelper = createColumnHelper<
  | (ScenarioIterationRule & { type: 'rule' })
  | (ScenarioIterationSanction & { type: 'sanction' })
>();

const AddRuleOrSanction = ({
  scenarioId,
  iterationId,
  isSanctionAvailable,
}: {
  scenarioId: string;
  iterationId: string;
  isSanctionAvailable: FeatureAccessDto;
}) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger
      className={CtaClassName({ variant: 'primary', color: 'purple' })}
    >
      <Icon icon="plus" className="size-6" />
      Add
    </DropdownMenu.Trigger>
    <DropdownMenu.Content
      align="end"
      className="bg-grey-100 border-grey-90 z-10 mt-2 flex flex-col gap-2 rounded border p-2"
    >
      <CreateRule scenarioId={scenarioId} iterationId={iterationId} />
      <CreateSanction
        scenarioId={scenarioId}
        iterationId={iterationId}
        isSanctionAvailable={isSanctionAvailable}
      />
    </DropdownMenu.Content>
  </DropdownMenu.Root>
);

export default function Rules() {
  const { t } = useTranslation(['scenarios', 'decisions', 'common']);
  const language = useFormatLanguage();

  const iterationId = useParam('iterationId');
  const scenarioId = useParam('scenarioId');
  const editorMode = useEditorMode();

  const { items, ruleGroups, isSanctionAvailable } =
    useLoaderData<typeof loader>();
  const scenarioValidation = useCurrentScenarioValidation();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();
  const organization = useOrganizationDetails();

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
          const hasErrors =
            row.original.type === 'rule'
              ? hasRuleErrors(
                  findRuleValidation(scenarioValidation, row.original.id),
                )
              : false;

          return (
            <span className="flex items-center gap-2">
              <span className="flex w-2 items-center justify-center">
                {hasErrors ? (
                  <Ping className="text-red-47 relative box-content size-[6px] border border-transparent" />
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
      columnHelper.accessor(
        (row) => (row.type === 'rule' ? row.scoreModifier : undefined),
        {
          id: 'score',
          cell: ({ getValue }) => {
            const scoreModifier = getValue();
            if (!scoreModifier) return '';
            return (
              <span
                className={scoreModifier < 0 ? 'text-green-38' : 'text-red-47'}
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
      ),
      columnHelper.accessor(() => undefined, {
        id: 'outcome',
        cell: ({ row }) =>
          row.original.type === 'sanction' ? (
            <OutcomeTag
              outcome={
                organization.org.sanctionCheck.forcedOutcome as KnownOutcome
              }
            />
          ) : undefined,
        header: t('decisions:outcome'),
        size: 100,
      }),
    ],
    [language, scenarioValidation, t, organization],
  );

  const hasItems = items.length > 0;

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const filterValues = R.pullObject(
    columnFilters,
    R.prop('id'),
    R.prop('value'),
  );

  const submitRulesFilters = useCallback((filters: RulesFilters) => {
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
    data: items,
    columns,
    columnResizeMode: 'onChange',
    enableSorting: hasItems,
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
    rowLink: ({ id, type }) =>
      type === 'rule' ? (
        <Link to={`./${fromUUID(id)}`} />
      ) : (
        <Link
          to={getRoute(
            '/scenarios/:scenarioId/i/:iterationId/sanctions/:sanctionId',
            {
              scenarioId: fromUUID(scenarioId),
              iterationId: fromUUID(iterationId),
              sanctionId: fromUUID(id),
            },
          )}
        />
      ),
  });

  const columnLength = table.getHeaderGroups()[0]?.headers.length ?? 1;

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
              disabled={!hasItems}
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
              <AddRuleOrSanction
                scenarioId={scenarioId}
                iterationId={iterationId}
                isSanctionAvailable={isSanctionAvailable}
              />
            ) : null}
          </div>
        </div>
        <RulesFiltersBar />
      </RulesFiltersProvider>

      <Table.Container {...getContainerProps()} className="bg-grey-100">
        <Table.Header headerGroups={table.getHeaderGroups()} />
        <Table.Body {...getBodyProps()}>
          {hasItems ? (
            rows.map((row) => <Table.Row key={row.id} row={row} />)
          ) : (
            <tr className="h-28">
              <td colSpan={columnLength}>
                <p className="text-center">{t('scenarios:rules.empty')}</p>
              </td>
            </tr>
          )}
        </Table.Body>
      </Table.Container>
    </div>
  );
}
