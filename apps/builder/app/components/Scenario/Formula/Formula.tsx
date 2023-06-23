import { type Operator } from '@marble-front/api/marble';
import {
  isConstantNode,
  isConstantOperator,
  isDataFieldNode,
  isDataFieldOperator,
  isMathOperator,
  isMathOperatorNode,
  type OperatorNode,
} from '@marble-front/operators';
import { assertNever } from '@marble-front/typescript-utils';

import { NotImplemented } from './NotImplemented';
import {
  Constant,
  DataField,
  Math,
  NewConstant,
  NewDataField,
  NewMath,
  Not,
} from './Operators';

interface FormulaProps {
  formula: Operator;
  isRoot?: boolean;
}

export function Formula({ formula, isRoot = false }: FormulaProps) {
  if (isConstantOperator(formula)) {
    return <Constant operator={formula} isRoot={isRoot} />;
  }

  if (isDataFieldOperator(formula)) {
    return <DataField operator={formula} isRoot={isRoot} />;
  }

  if (isMathOperator(formula)) {
    return <Math operator={formula} isRoot={isRoot} />;
  }

  if (formula.type === 'NOT') {
    return <Not operator={formula} isRoot={isRoot} />;
  }

  if (formula.type === 'ROUND_FLOAT') {
    return <NotImplemented value={JSON.stringify(formula, null, 2)} />;
  }

  assertNever('unknwon Operator:', formula);
}

export function NewFormula({
  node,
  isRoot = false,
}: {
  node: OperatorNode;
  isRoot?: boolean;
}) {
  if (isConstantNode(node)) {
    return <NewConstant node={node} isRoot={isRoot} />;
  }

  if (isDataFieldNode(node)) {
    return <NewDataField node={node} isRoot={isRoot} />;
  }

  if (isMathOperatorNode(node)) {
    return <NewMath node={node} isRoot={isRoot} />;
  }

  assertNever('unknwon Operator:', node);
}
