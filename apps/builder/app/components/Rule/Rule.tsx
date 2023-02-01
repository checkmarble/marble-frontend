import type { Rule as RuleData } from '@marble-front/api/marble';
import { Consequence } from './Consequence';
import { LogicalOperator } from './LogicalOperator';
import { Formula } from './Formula';
import type { PlainMessage } from '@bufbuild/protobuf';
import { Fragment } from 'react';
import { Paper } from '../Paper';
import { RuleRightPannel } from './RuleRightPannel';

export function Rule({ rule }: { rule: PlainMessage<RuleData> }) {
  return (
    <RuleRightPannel.Provider>
      <div className="flex flex-col gap-4">
        {/* @ts-expect-error should disapear when V1 rules selector is finished */}
        <Consequence scoreIncrease={rule.consequence.scoreIncrease} />
        <Paper.Container>
          <div className="text-s grid grid-cols-[40px_1fr] gap-2">
            {rule.orGroups.map((orGroup, groupIndex) => (
              <Fragment key={`group_${groupIndex}`}>
                {orGroup.conditions.map((formula, conditionIndex) => (
                  <Fragment key={`condition_${conditionIndex}`}>
                    <LogicalOperator
                      operator={conditionIndex === 0 ? 'if' : 'and'}
                    />
                    <Formula formula={formula} isRoot />
                  </Fragment>
                ))}
                {groupIndex !== rule.orGroups.length - 1 && (
                  <>
                    <LogicalOperator operator="or" />
                    <div className="flex items-center">
                      <div className="bg-grey-10 h-[1px] w-full" />
                    </div>
                  </>
                )}
              </Fragment>
            ))}
          </div>
        </Paper.Container>
      </div>
    </RuleRightPannel.Provider>
  );
}
