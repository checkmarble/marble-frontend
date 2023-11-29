import { NewTimeNowAstNode, type TimeNowAstNode } from '../ast-node';
import { type LabelledAst } from './LabelledAst';

export function newTimeNowLabelledAst(
  node: TimeNowAstNode = NewTimeNowAstNode()
): LabelledAst {
  return {
    name: TimeNowName,
    description: 'The time when the scenario is run',
    operandType: 'Function',
    dataType: 'unknown',
    astNode: node,
  };
}

export const TimeNowName = 'Now';
