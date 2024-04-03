import { type AstNode } from '@app-builder/models';
import { useOperandOptions } from '@app-builder/services/ast-node/options';
import { type EditorNodeViewModel } from '@app-builder/services/editor/ast-editor';

import { Operand } from './Operand';
import {
  adaptTwoOperandsLineViewModel,
  TwoOperandsLine,
} from './TwoOperandsLine';

interface AstBuilderNodeProps {
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  editorNodeViewModel: EditorNodeViewModel;
  viewOnly?: boolean;
  onSave?: (astNode: AstNode) => void;
  root?: boolean;
}

export function AstBuilderNode({
  editorNodeViewModel,
  setOperand,
  setOperator,
  viewOnly,
  onSave,
  root = false,
}: AstBuilderNodeProps) {
  const twoOperandsViewModel =
    adaptTwoOperandsLineViewModel(editorNodeViewModel);
  const options = useOperandOptions({ operandViewModel: editorNodeViewModel });

  if (twoOperandsViewModel) {
    return (
      <div className="flex w-full flex-col gap-2">
        <TwoOperandsLine
          setOperand={setOperand}
          setOperator={setOperator}
          twoOperandsViewModel={twoOperandsViewModel}
          viewOnly={viewOnly}
          root={root}
        />
      </div>
    );
  }

  return (
    <Operand
      operandViewModel={editorNodeViewModel}
      viewOnly={viewOnly}
      onSave={onSave}
      options={options}
    />
  );
}
