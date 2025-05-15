import {
  type AndAstNode,
  isAndAstNode,
  isOrWithAndAstNode,
  type OrWithAndAstNode,
} from '@app-builder/models/astNode/builder-ast-node';
import { match } from 'ts-pattern';

import { EditionAstBuilderAndRoot } from './edition/EditionAndRoot';
import { EditionAstBuilderAnyRoot } from './edition/EditionAnyRoot';
import { EditionAstBuilderOrWithAndRoot } from './edition/EditionOrWithAndRoot';
import { AstBuilderDataSharpFactory } from './Provider';
import type { AstBuilderRootProps } from './types';
import { ViewingAstBuilderAndRoot } from './viewing/ViewingAndRoot';
import { ViewingAstBuilderOrWithAndRoot } from './viewing/ViewingOrWithAndRoot';

export function AstBuilderRoot({ node: _node, ...props }: AstBuilderRootProps) {
  return match(_node)
    .when(isAndAstNode, (node) => <AstBuilderAndRoot {...props} node={node} />)
    .when(isOrWithAndAstNode, (node) => <AstBuilderOrWithAndRoot {...props} node={node} />)
    .otherwise((node) => <AstBuilderAnyRoot {...props} node={node} />);
}

export function AstBuilderAnyRoot(props: AstBuilderRootProps) {
  const builderMode = AstBuilderDataSharpFactory.select((s) => s.mode);
  return builderMode === 'edit' ? (
    <EditionAstBuilderAnyRoot {...props} />
  ) : (
    'view mode not supported yet!'
  );
}

export function AstBuilderOrWithAndRoot(props: AstBuilderRootProps<OrWithAndAstNode>) {
  const builderMode = AstBuilderDataSharpFactory.select((s) => s.mode);
  return builderMode === 'edit' ? (
    <EditionAstBuilderOrWithAndRoot {...props} />
  ) : (
    <ViewingAstBuilderOrWithAndRoot {...props} />
  );
}

export function AstBuilderAndRoot(props: AstBuilderRootProps<AndAstNode>) {
  const builderMode = AstBuilderDataSharpFactory.select((s) => s.mode);
  return builderMode === 'edit' ? (
    <EditionAstBuilderAndRoot {...props} />
  ) : (
    <ViewingAstBuilderAndRoot {...props} />
  );
}
