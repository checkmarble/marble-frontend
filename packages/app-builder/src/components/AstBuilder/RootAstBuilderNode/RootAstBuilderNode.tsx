import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import { AstBuilderNode } from '../AstBuilderNode';
import { adaptRootAndViewModel, RootAnd } from './RootAnd';
import { adaptRootOrWithAndViewModel, RootOrWithAnd } from './RootOrWithAnd';

interface RootAstBuilderNodeProps {
  builder: AstBuilder;
  editorNodeViewModel: EditorNodeViewModel;
  viewOnly?: boolean;
}

/**
 * Specific Root node that can address the case of a root And node or a root Or node with And children.
 *
 * This is necessary to avoid the recursive call of AstBuilderNode that could trigger a root specific layout for any child node.
 */
export function RootAstBuilderNode({
  editorNodeViewModel,
  builder,
  viewOnly,
}: RootAstBuilderNodeProps) {
  const rootOrWithAndViewModel =
    adaptRootOrWithAndViewModel(editorNodeViewModel);
  if (rootOrWithAndViewModel) {
    return (
      <RootOrWithAnd
        builder={builder}
        rootOrWithAndViewModel={rootOrWithAndViewModel}
        viewOnly={viewOnly}
      />
    );
  }

  const rootAndViewModel = adaptRootAndViewModel(editorNodeViewModel);
  if (rootAndViewModel) {
    return (
      <RootAnd
        builder={builder}
        rootAndViewModel={rootAndViewModel}
        viewOnly={viewOnly}
      />
    );
  }

  // Fallback to the generic AstBuilderNode
  return (
    <AstBuilderNode
      editorNodeViewModel={editorNodeViewModel}
      builder={builder}
      viewOnly={viewOnly}
    />
  );
}
