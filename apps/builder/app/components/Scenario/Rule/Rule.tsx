import { type ScenarioIterationRule } from '@marble-front/api/marble';
import { type Operator } from '@marble-front/operators';
import { Fragment } from 'react';
import * as R from 'remeda';

import { Paper } from '../../Paper';
import { Formula } from '../Formula';
import { LogicalOperator } from '../LogicalOperator';
import { Consequence } from './Consequence';

/**
 * Design is opinionated: it assumes a rule will often be an OR operator with AND operands.
 *
 * ex: rule.formula is an an OR operator with AND operands.
 *
 *      if  <Formula condition={rule.formula.children[0].children[0]} />
 *      and <Formula condition={rule.formula.children[0].children[1]} />
 *    OR
 *      if  <Formula condition={rule.formula.children[1].children[0]} />
 *
 * ex: rule.formula is an OR operator with other Boolean operators
 *
 *      if  <Formula condition={rule.formula.children[0]} />
 *    OR
 *      if  <Formula condition={rule.formula.children[1]} />
 *
 * In case this is not an AND operator, we simulate an AND operator with a single operand
 *
 * ex: rule.formula is another Boolean operators
 *
 *      if  <Formula condition={rule.formula} />
 *
 * In case this is not an OR operator, we simulate an OR operator with a single operand
 */
export function Rule({ rule }: { rule: ScenarioIterationRule }) {
  const formula = rule.formula as Operator;

  const orOperands = R.pipe(
    formula,
    (formula) => (formula.type === 'OR' ? formula.children : [formula]),
    R.map((orOperand) =>
      orOperand.type === 'AND' ? orOperand.children : [orOperand]
    )
  );

  return (
    <div className="flex flex-col gap-4">
      <Consequence scoreIncrease={rule.scoreModifier} />
      <Paper.Container>
        <div className="text-s grid grid-cols-[40px_1fr] gap-2">
          {orOperands.map((andOperands, orOperandIndex) => {
            const isLastOperand = orOperandIndex === orOperands.length - 1;
            return (
              <Fragment key={`or_operand_${orOperandIndex}`}>
                {andOperands.map((andOperand, andOperandIndex) => {
                  const isFirstCondition = andOperandIndex === 0;
                  return (
                    <Fragment key={`and_operand_${andOperandIndex}`}>
                      <LogicalOperator
                        operator={isFirstCondition ? 'if' : 'and'}
                      />
                      <Formula formula={andOperand} isRoot />
                    </Fragment>
                  );
                })}
                {!isLastOperand && (
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
