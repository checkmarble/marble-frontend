import { type TestRunDecision } from '@app-builder/models/testrun';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';

import { HamburgerChart, type Versions } from './HamburgerGraph';

export const DistributionOfDecisionChart = ({
  decisions,
  versions,
}: {
  decisions: TestRunDecision[];
  versions: Versions;
}) => {
  const { t } = useTranslation(['scenarios', 'decisions']);

  return (
    <Collapsible.Container className="bg-surface-card" defaultOpen={true}>
      <Collapsible.Title>{t('scenarios:testrun.distribution')}</Collapsible.Title>
      <Collapsible.Content>
        {decisions.length === 0 ? (
          <span className="text-grey-placeholder inline-block w-full text-center font-semibold">
            {t('scenarios:testrun.no_decisions')}
          </span>
        ) : (
          <HamburgerChart
            versions={versions}
            items={decisions
              .filter((d) => d.count > 0)
              .map((d) => ({
                version: d.version,
                count: d.count,
                option: d.outcome,
              }))}
            mapping={{
              approve: {
                background: 'bg-green-38',
                border: 'border-green-38',
                text: 'text-grey-white',
                name: t('decisions:outcome.approve'),
              },
              decline: {
                background: 'bg-red-primary',
                border: 'border-red-primary',
                text: 'text-grey-white',
                name: t('decisions:outcome.decline'),
              },
              block_and_review: {
                background: 'bg-orange-primary',
                border: 'border-orange-primary',
                text: 'text-grey-white',
                name: t('decisions:outcome.block_and_review'),
              },
              review: {
                background: 'bg-yellow-50',
                border: 'border-yellow-50',
                text: 'text-grey-primary',
                name: t('decisions:outcome.review'),
              },
            }}
          />
        )}
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
