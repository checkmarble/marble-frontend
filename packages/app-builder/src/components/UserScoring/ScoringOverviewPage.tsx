import { Spinner } from '@app-builder/components/Spinner';
import {
  SCORING_LEVELS_COLORS,
  SCORING_LEVELS_LABELS,
  type ScoringRuleset,
  type ScoringSettings as ScoringSettingsModel,
} from '@app-builder/models/scoring';
import { useGetScoreDistributionQuery } from '@app-builder/queries/scoring/get-score-distribution';
import { useListScoringRulesetsQuery } from '@app-builder/queries/scoring/list-rulesets';
import { ResponsivePie } from '@nivo/pie';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button } from 'ui-design-system';
import { CreateRulesetPanelContext } from './ScoringSectionLayout';
import { ScoringSettings } from './ScoringSettings';

export function ScoringOverviewPage({ settings }: { settings: ScoringSettingsModel | null }) {
  const { t } = useTranslation(['common', 'user-scoring']);
  const { setOpen } = CreateRulesetPanelContext.useValue();
  const rulesetsQuery = useListScoringRulesetsQuery();

  return (
    <div className="flex flex-col gap-v2-md">
      <ScoringSettings settings={settings} />
      {settings
        ? match(rulesetsQuery)
            .with({ isPending: true }, () => (
              <div className="flex justify-center">
                <Spinner />
              </div>
            ))
            .with({ isError: true }, () => (
              <div className="flex flex-col gap-v2-sm items-center justify-center">
                <span className="text-s text-grey-60 text-center">{t('common:generic_fetch_data_error')}</span>
                <Button variant="secondary" onClick={() => rulesetsQuery.refetch()}>
                  {t('common:retry')}
                </Button>
              </div>
            ))
            .with({ isSuccess: true }, ({ data }) => {
              const rulesets = data?.rulesets ?? [];
              if (rulesets.length > 0) {
                return (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(500px,1fr))] gap-v2-md">
                    {rulesets.map((ruleset) => (
                      <ScoringRulesetCard key={ruleset.id} ruleset={ruleset} settings={settings} />
                    ))}
                  </div>
                );
              }
              return (
                <div className="bg-surface-card border border-grey-border p-v2-md rounded-v2-md flex flex-col gap-v2-md">
                  <span>{t('user-scoring:overview.no_ruleset')}</span>
                  <Button appearance="stroked" onClick={() => setOpen(true)}>
                    {t('user-scoring:overview.configure_score')}
                  </Button>
                </div>
              );
            })
            .exhaustive()
        : null}
    </div>
  );
}

function ScoringRulesetCard({ ruleset, settings }: { ruleset: ScoringRuleset; settings: ScoringSettingsModel }) {
  const { t } = useTranslation(['user-scoring', 'common']);
  const distributionQuery = useGetScoreDistributionQuery(ruleset.recordType);
  const maxRiskLevel = settings.maxRiskLevel as 3 | 4 | 5 | 6;
  const colors = SCORING_LEVELS_COLORS[maxRiskLevel];
  const labels = SCORING_LEVELS_LABELS[maxRiskLevel];

  return (
    <div className="bg-surface-card border border-grey-border rounded-v2-md p-v2-md flex flex-col gap-v2-md h-[400px]">
      <p className="text-s font-medium">{t('user-scoring:overview.ruleset_card.title', { name: ruleset.name })}</p>
      {match(distributionQuery)
        .with({ isPending: true }, () => (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="size-10" />
          </div>
        ))
        .with({ isError: true }, () => (
          <div className="flex flex-1 items-center justify-center text-s text-grey-secondary">
            {t('common:generic_fetch_data_error')}
          </div>
        ))
        .with({ isSuccess: true }, (query) => {
          const distribution = query.data?.distribution ?? [];
          const total = distribution.reduce((sum, item) => sum + item.count, 0);

          if (total === 0)
            return (
              <div className="flex flex-1 items-center justify-center text-s text-grey-secondary">
                {t('user-scoring:overview.ruleset_card.no_distribution')}
              </div>
            );

          const pieData = distribution
            .filter((item) => item.count > 0)
            .map((item) => ({
              id: item.risk_level,
              label: labels[item.risk_level - 1] ?? item.risk_level.toString(),
              value: item.count,
              color: colors[item.risk_level - 1] ?? '#ccc',
            }));

          return (
            <div className="flex-1">
              <ResponsivePie
                data={pieData}
                innerRadius={0.7}
                padAngle={1}
                colors={{ datum: 'data.color' }}
                enableArcLabels={false}
                arcLinkLabel={(datum) => `${Math.round((datum.value / total) * 100)}%`}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLinkLabelsThickness={0}
                arcLinkLabelsDiagonalLength={12}
                arcLinkLabelsStraightLength={12}
                arcLinkLabelsTextColor="var(--color-grey-primary)"
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateY: 56,
                    itemsSpacing: 16,
                    itemWidth: 40,
                    itemHeight: 24,
                    itemDirection: 'left-to-right',
                    symbolSize: 12,
                    symbolShape: 'circle',
                  },
                ]}
                margin={{ top: 30, right: 40, bottom: 70, left: 40 }}
                theme={{
                  legends: {
                    text: {
                      fill: 'var(--color-grey-secondary)',
                      fontSize: 12,
                      fontWeight: 500,
                    },
                  },
                }}
              />
            </div>
          );
        })
        .exhaustive()}
    </div>
  );
}
