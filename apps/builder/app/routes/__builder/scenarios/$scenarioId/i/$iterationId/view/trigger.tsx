import { type Operator } from '@marble-front/api/marble';
import { Callout, Paper } from '@marble-front/builder/components';
import { Formula } from '@marble-front/builder/components/Scenario/Formula';
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
    <Paper.Container className="max-w-3xl">
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
        <Callout className="w-fit">
          {t('scenarios:trigger.trigger_object.callout')}
        </Callout>
      </div>

      <TriggerCondition
        triggerObjectType={triggerObjectType}
        triggerCondition={triggerCondition}
      />
    </Paper.Container>
  );
}

/**
 * Design is opinionated: it assumes a trigger condition will often be an AND/OR operator.
 *
 * 1. condition is an AND operator
 *
 *    Transaction
 *        |-> Where <Formula condition={condition.children[0]} />
 *        |-> And   <Formula condition={condition.children[1]} />
 *        |-> And   <Formula condition={condition.children[2]} />
 *
 * 2. condition is an OR operator
 *
 *    Transaction
 *        |-> Where <Formula condition={condition.children[0]} />
 *        |-> Or    <Formula condition={condition.children[1]} />
 *        |-> Or    <Formula condition={condition.children[2]} />
 *
 * 3. condition is another Boolean operator
 *
 *    Transaction
 *        |-> Where <Formula condition={condition} />
 *
 */
function TriggerCondition({
  triggerObjectType,
  triggerCondition,
}: {
  triggerObjectType: string;
  triggerCondition?: Operator;
}) {
  const conditions = getNestedConditions(triggerCondition);

  return (
    <div className="text-s grid grid-cols-[8px_16px_max-content_1fr]">
      <ScenarioBox className="bg-grey-02 col-span-4 w-fit p-2 font-semibold text-purple-100">
        {triggerObjectType}
      </ScenarioBox>
      {conditions.map(({ condition, logicalOperator }, index) => {
        const isFirstCondition = index === 0;
        const isLastCondition = index === conditions.length - 1;

        return (
          <Fragment key={`condition_${index}`}>
            {/* Row 1 */}
            <div
              className={clsx(
                'border-grey-10 col-span-4 w-2 border-r ',
                isFirstCondition ? 'h-4' : 'h-2'
              )}
            />

            {/* Row 2 */}
            <div
              className={clsx(
                'border-grey-10 border-r',
                isLastCondition && 'h-5'
              )}
            />
            <div className="border-grey-10 h-5 border-b" />
            <LogicalOperator
              className="bg-grey-02 mr-2 p-2"
              operator={logicalOperator}
            />
            <div className="flex flex-row gap-2">
              <Formula isRoot formula={condition} />
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

function getNestedConditions(triggerCondition?: Operator) {
  if (!triggerCondition) return [];
  switch (triggerCondition.type) {
    case 'AND':
      return triggerCondition.children.map(
        (operator, index) =>
          ({
            logicalOperator: index === 0 ? 'where' : 'and',
            condition: operator,
          } as const)
      );
    case 'OR':
      return triggerCondition.children.map(
        (operator, index) =>
          ({
            logicalOperator: index === 0 ? 'where' : 'or',
            condition: operator,
          } as const)
      );
    default:
      return [
        {
          logicalOperator: 'where',
          condition: triggerCondition,
        } as const,
      ];
  }
}
