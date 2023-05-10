import { Callout, Paper } from '@marble-front/builder/components';
import { Tag } from '@marble-front/ui/design-system';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

import { useCurrentScenarioIteration } from '../../$iterationId';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export default function Decision() {
  const { t } = useTranslation(handle.i18n);

  const {
    body: { scoreRejectThreshold, scoreReviewThreshold },
  } = useCurrentScenarioIteration();

  return (
    <Paper.Container>
      <div className="flex flex-col gap-2 lg:gap-4">
        <Paper.Title>{t('scenarios:decision.score_based.title')}</Paper.Title>
        <Callout>{t('scenarios:decision.score_based.callout')}</Callout>
      </div>

      <div className="grid grid-cols-[repeat(2,max-content)] items-center gap-y-2 gap-x-1 lg:gap-y-4 lg:gap-x-2">
        <Tag border="square" size="big" color="green">
          {t('scenarios:decision.score_based.approve')}
        </Tag>
        <div className="flex flex-row items-center gap-1 lg:gap-2">
          {t('scenarios:decision.score_based.approve_condition')}
          <Tag border="square" size="big" color="grey">
            {scoreReviewThreshold}
          </Tag>
        </div>

        <Tag border="square" size="big" color="yellow">
          {t('scenarios:decision.score_based.review')}
        </Tag>
        {t('scenarios:decision.score_based.review_condition')}

        <Tag border="square" size="big" color="red">
          {t('scenarios:decision.score_based.decline')}
        </Tag>
        <div className="flex flex-row items-center gap-1 lg:gap-2">
          {t('scenarios:decision.score_based.decline_condition')}
          <Tag border="square" size="big" color="grey">
            {scoreRejectThreshold}
          </Tag>
        </div>
      </div>
    </Paper.Container>
  );
}
