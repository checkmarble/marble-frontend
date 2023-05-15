import { type Operator } from '@marble-front/api/marble';
import {
  isConstantOperator,
  isDataFieldOperator,
  isMathOperator,
} from '@marble-front/operators';
import { assertNever } from '@marble-front/typescript-utils';

import { Constant, DataField, Math, Not } from './Operators';

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

  assertNever('unknwon Operator:', formula);
}
