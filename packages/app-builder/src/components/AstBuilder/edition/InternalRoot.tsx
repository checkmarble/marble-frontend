import { isAndAstNode, isOrWithAndAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { match } from 'ts-pattern';

import { AstBuilderNodeSharpFactory } from '../node-store';
import { AstBuilderNode } from './Node';
import { AstBuilderRootAnd } from './RootAnd';
import { AstBuilderRootOrWithAnd } from './RootOrWithAnd';

export function Internal_AstBuilderRoot() {
  const node = AstBuilderNodeSharpFactory.useSharp().value.node;

  return match(node)
    .when(isOrWithAndAstNode, (node) => <AstBuilderRootOrWithAnd node={node} />)
    .when(isAndAstNode, (node) => <AstBuilderRootAnd node={node} />)
    .otherwise(() => <AstBuilderNode path="root" />);
}
