import { type ScoringRuleset, type ScoringSettings as ScoringSettingsModel } from '@app-builder/models/scoring';
import { useListScoringRulesetsQuery } from '@app-builder/queries/scoring/list-rulesets';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button } from 'ui-design-system';
import { Spinner } from '../Spinner';
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
                      <ScoringRulesetCard key={ruleset.id} ruleset={ruleset} />
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

function ScoringRulesetCard({ ruleset }: { ruleset: ScoringRuleset }) {
  return (
    <div className="bg-surface-card border border-grey-border rounded-v2-md p-v2-md flex flex-col gap-v2-md h-[400px]">
      <p className="text-s font-medium">{ruleset.name}</p>
    </div>
  );
}
