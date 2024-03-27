import {
  type AstNode,
  type DatabaseAccessAstNode,
  type PayloadAstNode,
  type TableModel,
} from '@app-builder/models';
import { type OperatorFunctions } from '@app-builder/models/editable-operators';
import { type EditorNodeViewModel } from '@app-builder/services/editor/ast-editor';
import { type CustomList } from 'marble-api';

import { Operand } from './Operand';
import {
  adaptTwoOperandsLineViewModel,
  TwoOperandsLine,
} from './TwoOperandsLine';

interface AstBuilderNodeProps {
  input: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    dataModel: TableModel[];
    customLists: CustomList[];
    triggerObjectTable: TableModel;
    operators: OperatorFunctions[];
  };
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  editorNodeViewModel: EditorNodeViewModel;
  viewOnly?: boolean;
  onSave?: (astNode: AstNode) => void;
  root?: boolean;
}

export function AstBuilderNode({
  editorNodeViewModel,
  input,
  setOperand,
  setOperator,
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
          input={input}
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
      input={input}
      operandViewModel={editorNodeViewModel}
      viewOnly={viewOnly}
      onSave={onSave}
    />
  );
}
