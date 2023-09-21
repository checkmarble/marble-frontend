import {
  type LabelledAst,
  NewUndefinedAstNode,
  undefinedAstNodeName,
} from '@app-builder/models';

export function newUndefinedLabelledAst(): LabelledAst {
  return {
    name: getUndefinedDisplayName(),
    operandType: undefinedAstNodeName,
    dataType: 'unknown',
    astNode: NewUndefinedAstNode(),
  };
}

export function getUndefinedDisplayName(): string {
  return '';
}
