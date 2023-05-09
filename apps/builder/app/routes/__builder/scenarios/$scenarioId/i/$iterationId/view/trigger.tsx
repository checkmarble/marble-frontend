import { Callout, Paper } from '@marble-front/builder/components';
import { NotImplemented } from '@marble-front/builder/components/Scenario/Formula/NotImplemented';
import { LogicalOperator } from '@marble-front/builder/components/Scenario/LogicalOperator';
import { ScenarioBox } from '@marble-front/builder/components/Scenario/ScenarioBox';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { Fragment } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

import { useCurrentScenario } from '../../../../$scenarioId';
import { useCurrentScenarioIteration } from '../../$iterationId';

export const handle = {
  i18n: ['scenarios', 'common'] satisfies Namespace,
};

export default function Trigger() {
  const { t } = useTranslation(handle.i18n);

  const {
    scenarioId,
    body: { triggerCondition },
  } = useCurrentScenarioIteration();

  const { triggerObjectType } = useCurrentScenario();

  return (
    <Paper.Container>
      <div className="flex flex-col gap-2 lg:gap-4">
        <Paper.Title>{t('scenarios:trigger.run_scenario.title')}</Paper.Title>
        <p className="text-s text-grey-100 font-normal">
          <Trans
            t={t}
            i18nKey="scenarios:trigger.run_scenario.description.docs"
            components={{
              DocLink: (
                // eslint-disable-next-line jsx-a11y/anchor-has-content
                <a
                  className="text-purple-100"
                  href="https://docs.checkmarble.com/reference/introduction-1"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
          <br />
          <Trans
            t={t}
            i18nKey="scenarios:trigger.run_scenario.description.scenario_id"
            components={{
              ScenarioIdLabel: <code className="select-none" />,
              ScenarioIdValue: (
                <code
                  className="border-grey-10 cursor-pointer select-none rounded-sm border px-1"
                  onClick={() => {
                    navigator.clipboard.writeText(scenarioId).then(() => {
                      toast.success(
                        t('common:clipboard.copy', {
                          ns: 'common',
                          replace: { value: scenarioId },
                        })
                      );
                    });
                  }}
                />
              ),
            }}
            values={{
              scenarioId: scenarioId,
            }}
          />
        </p>
      </div>

      <div className="flex flex-col gap-2 lg:gap-4">
        <Paper.Title>{t('scenarios:trigger.trigger_object.title')}</Paper.Title>
        <Callout>{t('scenarios:trigger.trigger_object.callout')}</Callout>
      </div>

      <div className="text-s grid grid-cols-[8px_16px_max-content_1fr]">
        <ScenarioBox className="bg-grey-02 col-span-4 w-fit font-semibold text-purple-100">
          {triggerObjectType}
        </ScenarioBox>
        <NotImplemented
          value={`TriggerConditions: ${JSON.stringify(
            triggerCondition,
            null,
            '  '
          )}`}
        />
        {/* {trigger.conditions.map((condition, index) => {
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
        })} */}
      </div>
    </Paper.Container>
  );
}
