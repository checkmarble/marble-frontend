import Callout from '@marble-front/builder/components/Callout';
import { Tag } from '@marble-front/ui/design-system';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['scenarios'],
};

export default function Decision() {
  const { t } = useTranslation(['scenarios']);

  const values = {
    approve: -30,
    decline: 150,
  };

  return (
    <div className="border-grey-10 flex w-fit max-w-3xl flex-col gap-8 rounded-lg border p-8">
      <p className="text-text-m-semibold text-grey-100">
        {t('scenarios:decision.score_based.title')}
      </p>
      <Callout>{t('decision.score_based.callout')}</Callout>
      <div className="grid grid-cols-[repeat(2,max-content)] items-center gap-y-4 gap-x-2">
        <Tag border="square" size="big" color="green">
          {t('scenarios:decision.score_based.approve')}
        </Tag>
        <div className="flex flex-row items-center gap-2">
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
        <div className="flex flex-row items-center gap-2">
          {t('scenarios:decision.score_based.decline_condition')}
          <Tag border="square" size="big" color="grey">
            {values.decline}
          </Tag>
        </div>
      </div>
    </div>
  );
}
