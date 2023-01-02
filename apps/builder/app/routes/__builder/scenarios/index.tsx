import { Page } from '@marble-front/builder/components/Page';
import { useTranslation } from 'react-i18next';
import { Link } from '@remix-run/react';
import { Scenarios } from '@marble-front/ui/icons';
import { Tag } from '@marble-front/ui/design-system';
import { useScenarios } from '@marble-front/builder/hooks/scenarios';

export const handle = {
  i18n: ['scenarios', 'navigation'] as const,
};

export default function ScenariosPage() {
  const { t } = useTranslation(handle.i18n);
  const scenarios = useScenarios();

  return (
    <Page.Container>
      <Page.Header>
        <Scenarios className="mr-2" height="24px" width="24px" />
        {t('navigation:scenarios')}
      </Page.Header>
      <Page.Content>
        <div className="flex flex-col gap-2">
          {scenarios.length ? (
            scenarios.map(({ id, name, description, activeVersion }) => (
              <Link
                key={id}
                to={`/scenarios/${id}/${activeVersion?.id}/view/trigger`}
              >
                <div className="bg-grey-00 border-grey-10 flex max-w-3xl flex-col gap-1 rounded-lg border border-solid p-4 hover:shadow-md">
                  <div className="text-text-m-bold flex flex-row gap-2">
                    {name}
                    {activeVersion && (
                      <Tag color="purple" className="capitalize">
                        {t('scenarios:live')}
                      </Tag>
                    )}
                  </div>
                  <p className="text-text-s-medium line-clamp-2">
                    {description}
                  </p>
                </div>
              </Link>
            ))
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
