import { Paper, Callout } from '@marble-front/builder/components';
import { ScenarioBox } from '@marble-front/builder/components/Scenario/ScenarioBox';
import { Formula } from '@marble-front/builder/components/Scenario/Formula';
import { LogicalOperator } from '@marble-front/builder/components/Scenario/LogicalOperator';
import { triggerFixture } from '@marble-front/builder/fixtures/trigger';
import clsx from 'clsx';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['scenarios'] as const,
};

export default function Trigger() {
  const { t } = useTranslation(handle.i18n);

  const trigger = triggerFixture.complex;

  return (
    <Paper.Container>
      <Paper.Title>{t('scenarios:trigger.trigger_object.title')}</Paper.Title>
      <Callout>{t('scenarios:trigger.trigger_object.callout')}</Callout>

      <div className="text-s grid grid-cols-[8px_16px_max-content_1fr]">
        <ScenarioBox className="bg-grey-02 col-span-4 w-fit font-semibold text-purple-100">
          {trigger.rootTableName}
        </ScenarioBox>
        {trigger.conditions.map((condition, index) => {
          const isFirstCondition = index === 0;
          const isLastCondition = index === trigger.conditions.length - 1;
          return (
            <Fragment key={`condition_${index}`}>
              <div
                className={clsx(
                  'border-grey-10 col-span-4 w-2 border-r ',
                  isFirstCondition ? 'h-4' : 'h-2'
                )}
              />

              <div
                className={clsx(
                  'border-grey-10 border-r',
                  isLastCondition && 'h-5'
                )}
              />
              <div className="border-grey-10 h-5 border-b" />
              <LogicalOperator
                className="bg-grey-02 mr-2"
                operator={isFirstCondition ? 'where' : 'and'}
              />
              <div className="flex flex-row gap-2">
                <Formula isRoot formula={condition} />
              </div>
            </Fragment>
          );
        })}
      </div>
    </Paper.Container>
  );
}
