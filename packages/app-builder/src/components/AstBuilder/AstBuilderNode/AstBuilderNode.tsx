import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import { Default } from '../../Scenario/Formula/Operators/Default';
import {
  adaptTwoOperandsLineViewModel,
  TwoOperandsLine,
} from './TwoOperandsLine/TwoOperandsLine';

interface AstBuilderNodeProps {
  builder: AstBuilder;
  editorNodeViewModel: EditorNodeViewModel;
  viewOnly?: boolean;
}

export function AstBuilderNode({
  editorNodeViewModel,
  builder,
  viewOnly,
}: AstBuilderNodeProps) {
  const twoOperandsViewModel =
    adaptTwoOperandsLineViewModel(editorNodeViewModel);
  if (twoOperandsViewModel) {
    return (
      <TwoOperandsLine
        builder={builder}
        twoOperandsViewModel={twoOperandsViewModel}
        viewOnly={viewOnly}
      />
    );
  }

  return (
    <Default node={adaptAstNodeFromEditorViewModel(editorNodeViewModel)} />
  );
}
