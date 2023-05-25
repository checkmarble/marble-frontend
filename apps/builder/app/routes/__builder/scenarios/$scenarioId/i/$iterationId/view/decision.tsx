import {
  Callout,
  decisionI18n,
  Outcome,
  Paper,
} from '@marble-front/builder/components';
import { Tag } from '@marble-front/ui/design-system';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

import { useCurrentScenarioIteration } from '../../$iterationId';

export const handle = {
  i18n: [...decisionI18n, 'scenarios'] satisfies Namespace,
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
        <Outcome border="square" size="big" outcome="approve" />
        <div className="flex flex-row items-center gap-1 lg:gap-2">
          {t('scenarios:decision.score_based.approve_condition')}
          <Tag border="square" size="big" color="grey">
            {scoreReviewThreshold}
          </Tag>
        </div>

        <Outcome border="square" size="big" outcome="review" />
        {t('scenarios:decision.score_based.review_condition')}

        <Outcome border="square" size="big" outcome="decline" />
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
