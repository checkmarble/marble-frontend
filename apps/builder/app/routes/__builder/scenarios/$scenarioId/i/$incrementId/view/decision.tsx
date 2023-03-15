import { Callout, Paper } from '@marble-front/builder/components';
import { Tag } from '@marble-front/ui/design-system';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['scenarios'] as const,
};

export default function Decision() {
  const { t } = useTranslation(handle.i18n);

  const values = {
    approve: -30,
    decline: 150,
  };

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
            {values.approve}
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
            {values.decline}
          </Tag>
        </div>
      </div>
    </Paper.Container>
  );
}
