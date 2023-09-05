import { type AstNode } from '@app-builder/models';
import { useCurrentScenario } from '@app-builder/routes/__builder/scenarios/$scenarioId';
import { useCurrentScenarioIteration } from '@app-builder/routes/__builder/scenarios/$scenarioId/i/$iterationId';
import clsx from 'clsx';
import { Fragment } from 'react';

import { Formula } from '../Formula';
import { LogicalOperatorLabel } from '../LogicalOperator';
import { ScenarioBox } from '../ScenarioBox';

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
export function TriggerCondition() {
  const { astNode } = useCurrentScenarioIteration();
  const { triggerObjectType } = useCurrentScenario();
  if (astNode == null) return;
  const conditions = getNestedConditions(astNode);

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
            <LogicalOperatorLabel
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

function getNestedConditions(triggerCondition: AstNode) {
  switch (triggerCondition.name) {
    case 'And': {
      const andOperands = triggerCondition.children ?? [];
      return andOperands.map(
        (operator, index) =>
          ({
            logicalOperator: index === 0 ? 'where' : 'and',
            condition: operator,
          } as const)
      );
    }
    case 'Or': {
      const orOperands = triggerCondition.children ?? [];
      return orOperands.map(
        (operator, index) =>
          ({
            logicalOperator: index === 0 ? 'where' : 'or',
            condition: operator,
          } as const)
      );
    }
    default:
      return [
        {
          logicalOperator: 'where',
          condition: triggerCondition,
        } as const,
      ];
  }
}
