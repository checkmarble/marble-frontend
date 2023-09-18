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
  viewOnly,
  ariaLabel,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
  onSave: (astNode: AstNode) => void;
  viewOnly?: boolean;
  ariaLabel?: string;
}) {
  const operand = isAggregationEditorNodeViewModel(operandViewModel) ? (
    <AggregationOperand
      builder={builder}
      aggregationEditorNodeViewModel={operandViewModel}
      onSave={onSave}
      viewOnly={viewOnly}
    />
  ) : (
    <OperandEditor
      builder={builder}
      operandViewModel={operandViewModel}
      onSave={onSave}
      viewOnly={viewOnly}
    />
  );

  return <div aria-label={ariaLabel}>{operand}</div>;
}
