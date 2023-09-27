import { type LabelledAst, NewUndefinedAstNode } from '@app-builder/models';

export function newUndefinedLabelledAst(): LabelledAst {
  return {
    name: getUndefinedDisplayName(),
    operandType: 'Undefined',
    dataType: 'unknown',
    astNode: NewUndefinedAstNode(),
  };
}

export function getUndefinedDisplayName(): string {
  return '';
}
