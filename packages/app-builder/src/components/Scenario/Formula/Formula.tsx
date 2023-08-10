import {
  type AstNode,
  isConstantNode,
  isIdentifier,
  isMathAst,
  isPayload,
} from '@app-builder/models';
import { useEditorIdentifiers } from '@app-builder/services/editor';

import { Constant, Math } from './Operators';
import { Default } from './Operators/Default';
import { Identifier } from './Operators/Identifier';
import { Payload } from './Operators/Payload';

interface FormulaProps {
  formula: AstNode;
  isRoot?: boolean;
}

export function Formula({ formula, isRoot = false }: FormulaProps) {
  const editorIdentifier = useEditorIdentifiers();
  if (isConstantNode(formula)) {
    return <Constant node={formula} isRoot={isRoot} />;
  }
  // if (isDataFieldOperator(formula)) {
  //   return <DataField operator={formula} isRoot={isRoot} />;
  // }

  if (isMathAst(formula)) {
    return <Math node={formula} isRoot={isRoot} />;
  }

  if (isPayload(formula)) {
    return <Payload node={formula} isRoot={isRoot} />;
  }

  if (isIdentifier(formula, editorIdentifier)) {
    return <Identifier node={formula} isRoot={isRoot} />;
  }

  return <Default node={formula} isRoot={isRoot} />;
}
