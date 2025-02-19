import {
  isAndAstNode,
  isOrWithAndAstNode,
} from '@app-builder/models/astNode/builder-ast-node';
import { match } from 'ts-pattern';

import { AstBuilderNodeState } from '../node-store';
import { AstBuilderNode } from './Node';
import { AstBuilderRootAnd } from './RootAnd';
import { AstBuilderRootOrWithAnd } from './RootOrWithAnd';

export function Internal_AstBuilderRoot() {
  const node = AstBuilderNodeState.useStore((s) => s.node);

  return match(node)
    .when(isOrWithAndAstNode, (node) => <AstBuilderRootOrWithAnd node={node} />)
    .when(isAndAstNode, (node) => <AstBuilderRootAnd node={node} />)
    .otherwise(() => <AstBuilderNode path="root" />);
}
