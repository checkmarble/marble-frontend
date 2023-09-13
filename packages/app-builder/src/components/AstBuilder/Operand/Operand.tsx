import { type AstNode } from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import {
  AggregationOperand,
  isAggregationEditorNodeViewModel,
} from '../AggregationEdit';
import { OperandEditor } from './OperandEditor';

export type OperandViewModel = EditorNodeViewModel;

export function Operand({
  builder,
  operandViewModel,
  onSave,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
  onSave: (astNode: AstNode) => void;
}) {
  if (isAggregationEditorNodeViewModel(operandViewModel)) {
    return (
      <AggregationOperand
        builder={builder}
        aggregationEditorNodeViewModel={operandViewModel}
        onSave={onSave}
      />
    );
  }

  return (
    <OperandEditor
      builder={builder}
      operandViewModel={operandViewModel}
      onSave={onSave}
    />
  );
}
