import {
  type AstNode,
  isConstantNode,
  isMathAst,
  isPayload,
} from '@app-builder/models';

import { Constant, Math } from './Operators';
import { Default } from './Operators/Default';
import { Payload } from './Operators/Payload';

interface FormulaProps {
  formula: AstNode;
  isRoot?: boolean;
}

export function Formula({ formula, isRoot = false }: FormulaProps) {
  console.log("NAME : ", formula.name ?? "")
  if (isConstantNode(formula)) {
    return <Constant node={formula} isRoot={isRoot} />;
  }
  console.log("NOT CONSTANT : ", formula.name ?? "")

  // if (isDataFieldOperator(formula)) {
  //   return <DataField operator={formula} isRoot={isRoot} />;
  // }

  if (isMathAst(formula)) {
    return <Math node={formula} isRoot={isRoot} />;
  }

  if (isPayload(formula)) {
    return <Payload node={formula} isRoot={isRoot} />;
  }

  // if (formula.type === 'NOT') {
  //   return <Not operator={formula} isRoot={isRoot} />;
  // }

  return <Default node={formula} isRoot={isRoot}/>
}
