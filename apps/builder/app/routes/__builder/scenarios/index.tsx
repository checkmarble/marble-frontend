import { Page } from '@marble-front/builder/components/Page';
import { useTranslation } from 'react-i18next';
import { Link } from '@remix-run/react';
import { Scenarios } from '@marble-front/ui/icons';
import { Tag } from '@marble-front/ui/design-system';
import { useScenarios } from '@marble-front/builder/hooks/scenarios';
import {
  createScenario,
  ScenarioPredicates,
} from '@marble-front/builder/services/business-logic';
import * as R from 'remeda';

export const handle = {
  i18n: ['scenarios', 'navigation'] as const,
};

export default function ScenariosPage() {
  const { t } = useTranslation(handle.i18n);
  const scenarios = useScenarios();

  const scenariosList = R.pipe(
    scenarios,
    R.map(createScenario),
    R.filter(ScenarioPredicates.hasVersionToOpen)
  );

  return (
    <Page.Container>
      <Page.Header>
        <Scenarios className="mr-2" height="24px" width="24px" />
        {t('navigation:scenarios')}
      </Page.Header>
      <Page.Content>
        <div className="flex flex-col gap-2 lg:gap-4">
          {scenariosList.length ? (
            scenariosList.map((scenario) => {
              return (
                <Link
                  key={scenario.id}
                  to={`/scenarios/${scenario.id}/${scenario.versionIdToOpen}/view/trigger`}
                >
                  <div className="bg-grey-00 border-grey-10 flex max-w-3xl flex-col gap-1 rounded-lg border border-solid p-4 hover:shadow-md">
                    <div className="text-text-m-bold flex flex-row gap-2">
                      {scenario.name}
                      {ScenarioPredicates.isLive(scenario) && (
                        <Tag color="purple" className="capitalize">
                          {t('scenarios:live')}
                        </Tag>
                      )}
                    </div>
                    <p className="text-text-s-medium line-clamp-2">
                      {scenario.description}
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="bg-grey-00 border-grey-10 flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
              <p className="text-text-s-medium">
                {t('scenarios:empty_scenario_list')}
              </p>
            </div>
          )}
        </div>
      </Page.Content>
    </Page.Container>
  );
}
