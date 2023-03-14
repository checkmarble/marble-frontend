import { type Rule as RuleData } from '@marble-front/api/marble';
import { Consequence } from './Consequence';
import { LogicalOperator } from '../LogicalOperator';
import { Formula } from '../Formula';
import { type PlainMessage } from '@bufbuild/protobuf';
import { Fragment } from 'react';
import { Paper } from '../../Paper';

export function Rule({ rule }: { rule: PlainMessage<RuleData> }) {
  return (
    <div className="flex flex-col gap-4">
      {/* @ts-expect-error should disapear when V1 rules selector is finished */}
      <Consequence scoreIncrease={rule.consequence.scoreIncrease} />
      <Paper.Container>
        <div className="text-s grid grid-cols-[40px_1fr] gap-2">
          {rule.orGroups.map((orGroup, groupIndex) => {
            const isLastGroup = groupIndex === rule.orGroups.length - 1;
            return (
              <Fragment key={`group_${groupIndex}`}>
                {orGroup.conditions.map((formula, conditionIndex) => {
                  const isFirstCondition = conditionIndex === 0;
                  return (
                    <Fragment key={`condition_${conditionIndex}`}>
                      <LogicalOperator
                        operator={isFirstCondition ? 'if' : 'and'}
                      />
                      <Formula formula={formula} isRoot />
                    </Fragment>
                  );
                })}
                {!isLastGroup && (
                  <>
                    <LogicalOperator
                      operator="or"
                      className="bg-grey-02 uppercase"
                    />
                    <div className="flex items-center">
                      <div className="bg-grey-10 h-[1px] w-full" />
                    </div>
                  </>
                )}
              </Fragment>
            );
          })}
        </div>
      </Paper.Container>
    </div>
  );
}
