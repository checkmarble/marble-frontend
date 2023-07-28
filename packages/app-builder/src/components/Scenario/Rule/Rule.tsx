import { adaptNodeDto,type AstNode } from '@app-builder/models';
import { type ScenarioIterationRule } from '@marble-api';
import { Fragment } from 'react';

import { Paper } from '../../Paper';
import { Formula } from '../Formula';
import { LogicalOperatorLabel } from '../LogicalOperator';
import { Consequence } from './Consequence';

/**
 * Design is opinionated: it assumes a rule will often be an OR operator with AND operands / AND operator with OR operands.
 *
 * 1. rule.formula is an OR operator with AND operands (same for AND with OR).
 *
 *      if  <Formula condition={rule.formula.children[0].children[0]} />
 *      and <Formula condition={rule.formula.children[0].children[1]} />
 *    OR
 *      if  <Formula condition={rule.formula.children[1].children[0]} />
 *
 * 2. rule.formula is an OR operator with other Boolean operators (same with AND)
 *
 *      if  <Formula condition={rule.formula.children[0]} />
 *    OR
 *      if  <Formula condition={rule.formula.children[1]} />
 *
 * 3. rule.formula is another Boolean operators
 *
 *      if  <Formula condition={rule.formula} />
 *
 * In case this is not an OR/AND operator, we simulate an OR operator with a single operand
 */
export function Rule({ rule }: { rule: ScenarioIterationRule }) {
  if (!rule.formula_ast_expression) {
    console.log(JSON.stringify(rule, null, 2))
    return
  }
  const nestedConditions = getNestedConditions(adaptNodeDto(rule.formula_ast_expression));
  console.log(JSON.stringify(nestedConditions, null, 2))

  return (
    <div className="flex flex-col gap-4">
      <Consequence scoreIncrease={rule.scoreModifier} />
      <Paper.Container>
        <div className="text-s grid grid-cols-[40px_1fr] gap-2">
          {nestedConditions.map((rootOperand, rootOperandIndex) => {
            const isLastOperand =
              rootOperandIndex === nestedConditions.length - 1;

            return (
              <Fragment key={`root_operand_${rootOperandIndex}`}>
                {rootOperand && rootOperand.operator?.map(
                  (nestedOperand, nestedOperandIndex) => {
                    return (
                      <Fragment key={`nested_operand_${nestedOperandIndex}`}>
                        <LogicalOperatorLabel
                          operator={nestedOperand.logicalOperator}
                        />
                        <Formula formula={nestedOperand.operator} isRoot />
                      </Fragment>
                    );
                  }
                )}
                {!isLastOperand && (
                  <>
                    <LogicalOperatorLabel
                      operator={rootOperand.logicalOperator}
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

function getNestedConditions(formula: AstNode) {
  switch (formula.name) {
    case 'And': {
      const andOperands = formula.children ?? [];

      return andOperands.map((andOperand) => {
        return {
          logicalOperator: 'and',
          operator:
            andOperand.name === 'Or'
              ? andOperand.children?.map(
                  (orOperand, orOperandIndex) =>
                    ({
                      logicalOperator: orOperandIndex === 0 ? 'if' : 'or',
                      operator: orOperand,
                    } as const)
                )
              : [
                  {
                    logicalOperator: 'if',
                    operator: andOperand,
                  } as const,
                ],
        } as const;
      });
    }

    case 'Or': {
      const orOperands = formula.children ?? [];

      return orOperands.map((orOperand) => {
        return {
          logicalOperator: 'or',
          operator:
            orOperand.name === 'And'
              ? orOperand.children?.map(
                  (andOperand, andOperandIndex) =>
                    ({
                      logicalOperator: andOperandIndex === 0 ? 'if' : 'and',
                      operator: andOperand,
                    } as const)
                )
              : [
                  {
                    logicalOperator: 'if',
                    operator: orOperand,
                  } as const,
                ],
        } as const;
      });
    }

    default:
      return [
        {
          logicalOperator: 'or',
          operator: [
            {
              logicalOperator: 'if',
              operator: formula,
            } as const,
          ],
        } as const,
      ];
  }
}
