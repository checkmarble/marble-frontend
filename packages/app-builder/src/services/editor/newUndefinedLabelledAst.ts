import {
  type LabelledAst,
  NewUndefinedAstNode,
  undefinedAstNodeName,
} from '@app-builder/models';

export function newUndefinedLabelledAst(): LabelledAst {
  return {
    name: '',
    operandType: undefinedAstNodeName,
    dataType: 'unknown',
    astNode: NewUndefinedAstNode(),
  };
}
