import { type AstNode } from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import { Operand } from './Operand';
import {
  adaptTwoOperandsLineViewModel,
  TwoOperandsLine,
} from './TwoOperandsLine/TwoOperandsLine';

interface AstBuilderNodeProps {
  builder: AstBuilder;
  editorNodeViewModel: EditorNodeViewModel;
  viewOnly?: boolean;
  onSave?: (astNode: AstNode) => void;
  root?: boolean;
}

export function AstBuilderNode({
  editorNodeViewModel,
  builder,
  viewOnly,
  onSave,
  root = false,
}: AstBuilderNodeProps) {
  const twoOperandsViewModel =
    adaptTwoOperandsLineViewModel(editorNodeViewModel);

  if (twoOperandsViewModel) {
    return (
      <div className="flex w-full flex-col gap-2">
        <TwoOperandsLine
          builder={builder}
          twoOperandsViewModel={twoOperandsViewModel}
          viewOnly={viewOnly}
          root={root}
        />
      </div>
    );
  }

  return (
    <Operand
      builder={builder}
      operandViewModel={editorNodeViewModel}
      viewOnly={viewOnly}
      onSave={onSave}
    />
  );
}
