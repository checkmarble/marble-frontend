import { Spinner } from '@app-builder/components/Spinner';
import {
  SCORING_LEVELS_COLORS,
  SCORING_LEVELS_LABEL_KEYS,
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
  const labelKeys = SCORING_LEVELS_LABEL_KEYS[maxRiskLevel];

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
              label: t(labelKeys[item.risk_level] ?? item.risk_level.toString()),
              value: item.count,
              color: colors[item.risk_level] ?? '#ccc',
            }));

          return (
            <div className="flex flex-1 flex-col gap-v2-sm">
              <div className="flex-1">
                <ResponsivePie
                  data={pieData}
                  innerRadius={0.7}
                  padAngle={1}
                  colors={{ datum: 'data.color' }}
                  enableArcLabels={false}
                  tooltip={({ datum }) => (
                    <div className="flex items-center gap-v2-xs bg-surface-card p-v2-xs rounded-lg border border-grey-border shadow-sm text-s text-grey-primary whitespace-nowrap">
                      <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: datum.color }} />
                      {datum.label}: {datum.value} ({Math.round((datum.value / total) * 100)}%)
                    </div>
                  )}
                  enableArcLinkLabels={false}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-v2-md gap-y-v2-xs">
                {pieData.map((item) => (
                  <div key={item.id} className="flex items-center gap-v2-xs">
                    <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-grey-secondary">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })
        .exhaustive()}
    </div>
  );
}
