import { type AstNode } from '@app-builder/models';
import {
  type AstNodeViewModel,
  isRootAndAstNodeViewModel,
  isRootOrWithAndAstNodeViewModel,
} from '@app-builder/models/ast-node-view-model';

import { AstBuilderNode } from '../AstBuilderNode';
import { RootAnd } from './RootAnd';
import { RootOrWithAnd } from './RootOrWithAnd';

interface RootAstBuilderNodeProps {
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  appendChild: (nodeId: string, childAst: AstNode) => void;
  remove: (nodeId: string) => void;
  astNodeVM: AstNodeViewModel;
  viewOnly?: boolean;
}

/**
 * Specific Root node that can address the case of a root And node or a root Or node with And children.
 *
 * This is necessary to avoid the recursive call of AstBuilderNode that could trigger a root specific layout for any child node.
 */
export function RootAstBuilderNode({
  setOperand,
  setOperator,
  appendChild,
  remove,
  astNodeVM,
  viewOnly,
}: RootAstBuilderNodeProps) {
  if (isRootOrWithAndAstNodeViewModel(astNodeVM)) {
    return (
      <RootOrWithAnd
        setOperand={setOperand}
        setOperator={setOperator}
        appendChild={appendChild}
        remove={remove}
        astNodeVM={astNodeVM}
        viewOnly={viewOnly}
      />
    );
  }

  if (isRootAndAstNodeViewModel(astNodeVM)) {
    return (
      <RootAnd
        setOperand={setOperand}
        setOperator={setOperator}
        appendChild={appendChild}
        remove={remove}
        astNodeVM={astNodeVM}
        viewOnly={viewOnly}
      />
    );
  }

  // Fallback to the generic AstBuilderNode
  return (
    <AstBuilderNode
      astNodeVM={astNodeVM}
      setOperand={setOperand}
      setOperator={setOperator}
      viewOnly={viewOnly}
      root
    />
  );
}
