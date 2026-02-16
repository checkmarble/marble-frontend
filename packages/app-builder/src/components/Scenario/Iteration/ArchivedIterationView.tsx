import { OutcomeBadge, scenarioI18n } from '@app-builder/components';
import { decisionsI18n } from '@app-builder/components/Decisions/decisions-i18n';
import { ScoreOutcomeThresholds } from '@app-builder/components/Decisions/ScoreOutcomeThresholds';
import { type ScenarioIterationRuleMetadata } from '@app-builder/models/scenario/iteration-rule';
import { type ScreeningConfig } from '@app-builder/models/screening-config';
import {
  useCurrentScenarioIteration,
  useScenarioIterationRulesMetadata,
} from '@app-builder/routes/_builder+/detection+/scenarios+/$scenarioId+/i+/$iterationId+/_layout';
import { createColumnHelper, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsible, Table, Tag, useTable } from 'ui-design-system';

export const archivedIterationI18n = [...decisionsI18n, ...scenarioI18n, 'common'] satisfies Namespace;

type RuleOrScreening = (ScenarioIterationRuleMetadata & { type: 'rule' }) | (ScreeningConfig & { type: 'sanction' });

const columnHelper = createColumnHelper<RuleOrScreening>();

export function ArchivedIterationView() {
  const { t } = useTranslation(archivedIterationI18n);
  const rulesMetadata = useScenarioIterationRulesMetadata();
  const { screeningConfigs, scoreReviewThreshold, scoreBlockAndReviewThreshold, scoreDeclineThreshold } =
    useCurrentScenarioIteration();

  const items: RuleOrScreening[] = useMemo(
    () => [
      ...rulesMetadata.map((r) => ({ ...r, type: 'rule' as const })),
      ...screeningConfigs.map((s) => ({ ...s, type: 'sanction' as const })),
    ],
    [rulesMetadata, screeningConfigs],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('scenarios:rules.name'),
        size: 200,
      }),
      columnHelper.accessor((row) => row.description, {
        id: 'description',
        header: t('scenarios:rules.description'),
        size: 360,
      }),
      columnHelper.accessor((row) => row.ruleGroup, {
        id: 'ruleGroup',
        header: t('scenarios:rules.rule_group'),
        size: 150,
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value) return null;
          return <Tag>{value}</Tag>;
        },
      }),
      columnHelper.accessor((row) => (row.type === 'sanction' ? row.forcedOutcome : undefined), {
        id: 'outcome',
        header: t('decisions:outcome'),
        size: 120,
        cell: ({ getValue }) => {
          const outcome = getValue();
          if (!outcome) return null;
          return <OutcomeBadge outcome={outcome} size="md" />;
        },
      }),
    ],
    [t],
  );

  const hasItems = items.length > 0;

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: items,
    columns,
    columnResizeMode: 'onChange',
    enableSorting: hasItems,
    initialState: {
      sorting: [{ id: 'name', desc: false }],
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const columnLength = table.getHeaderGroups()[0]?.headers.length ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <Table.Container {...getContainerProps()} className="bg-surface-card">
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

      <Collapsible.Container className="bg-surface-card max-w-3xl">
        <Collapsible.Title>{t('scenarios:decision.score_based.title')}</Collapsible.Title>
        <Collapsible.Content>
          <ScoreOutcomeThresholds
            scoreReviewThreshold={scoreReviewThreshold}
            scoreBlockAndReviewThreshold={scoreBlockAndReviewThreshold}
            scoreDeclineThreshold={scoreDeclineThreshold}
          />
        </Collapsible.Content>
      </Collapsible.Container>
    </div>
  );
}
