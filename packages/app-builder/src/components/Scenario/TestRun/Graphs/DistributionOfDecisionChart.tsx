import { Collapsible } from 'ui-design-system';
import { useTranslation } from 'react-i18next';
import { TestRunDecision } from '@app-builder/models/testrun';
import { HamburgerChart, Versions } from './HamburgerGraph';

export const DistributionOfDecisionChart = ({
  decisions,
  versions,
}: {
  decisions: TestRunDecision[];
  versions: Versions;
}) => {
  const { t } = useTranslation(['scenarios', 'decisions']);

  return (
    <Collapsible.Container className="bg-grey-00" defaultOpen={false}>
      <Collapsible.Title>
        {t('scenarios:testrun.distribution')}
      </Collapsible.Title>
      <Collapsible.Content>
        <HamburgerChart
          versions={versions}
          items={decisions.map((d) => ({
            version: d.version,
            count: d.count,
            option: d.outcome,
          }))}
          mapping={{
            approve: {
              background: 'bg-green-100',
              border: 'border-green-100',
              text: 'text-grey-00',
              name: t('decisions:outcome.approve'),
            },
            review: {
              background: 'bg-yellow-100',
              border: 'border-yellow-100',
              text: 'text-grey-100',
              name: t('decisions:outcome.review'),
            },
            decline: {
              background: 'bg-red-100',
              border: 'border-red-100',
              text: 'text-grey-00',
              name: t('decisions:outcome.decline'),
            },
            block_and_review: {
              background: 'bg-orange-100',
              border: 'border-orange-100',
              text: 'text-grey-00',
              name: t('decisions:outcome.block_and_review'),
            },
          }}
        />
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
