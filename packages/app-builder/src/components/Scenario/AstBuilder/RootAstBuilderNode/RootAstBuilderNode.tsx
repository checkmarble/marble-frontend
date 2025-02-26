import { isAndAstNode, isOrWithAndAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { useRootAstNode } from '@app-builder/services/editor/ast-editor';

import { AstBuilderNode } from '../AstBuilderNode';
import { RootAnd } from './RootAnd';
import { RootOrWithAnd } from './RootOrWithAnd';

interface RootAstBuilderNodeProps {
  viewOnly?: boolean;
}

/**
 * Specific Root node that can address the case of a root And node or a root Or node with And children.
 *
 * This is necessary to avoid the recursive call of AstBuilderNode that could trigger a root specific layout for any child node.
 */
export function RootAstBuilderNode({ viewOnly }: RootAstBuilderNodeProps) {
  const astNode = useRootAstNode();
  if (isOrWithAndAstNode(astNode)) {
    return <RootOrWithAnd path="root" astNode={astNode} viewOnly={viewOnly} />;
  }

  if (isAndAstNode(astNode)) {
    return <RootAnd path="root" astNode={astNode} viewOnly={viewOnly} />;
  }

  // Fallback to the generic AstBuilderNode
  return <AstBuilderNode treePath="root" astNode={astNode} viewOnly={viewOnly} root />;
}
