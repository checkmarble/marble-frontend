import { type AstNode } from '@app-builder/models';
import { useAdaptEditableAstNode } from '@app-builder/services/ast-node/options';
import { useFormatReturnValue } from '@app-builder/services/ast-node/return-value';
import {
  type EditorNodeViewModel,
  getValidationStatus,
} from '@app-builder/services/editor/ast-editor';

import { Default } from '../Default';
import { OperandEditor } from './OperandEditor';
import { OperandLabel } from './OperandLabel';

export type OperandViewModel = EditorNodeViewModel;

export function Operand({
  operandViewModel,
  onSave,
  viewOnly,
}: {
  operandViewModel: OperandViewModel;
  onSave?: (astNode: AstNode) => void;
  viewOnly?: boolean;
}) {
  const adaptEditableAstNode = useAdaptEditableAstNode();
  const editableAstNode = adaptEditableAstNode(operandViewModel);
  const formatReturnValue = useFormatReturnValue();

  if (!editableAstNode) {
    return (
      <Default
        editorNodeViewModel={operandViewModel}
        type={viewOnly ? 'viewer' : 'editor'}
        validationStatus={getValidationStatus(operandViewModel)}
      />
    );
  }

  if (viewOnly || !onSave) {
    return (
      <OperandLabel
        editableAstNode={editableAstNode}
        validationStatus={getValidationStatus(operandViewModel)}
        type="viewer"
        returnValue={formatReturnValue(operandViewModel.returnValue)}
      />
    );
  }

  return (
    <OperandEditor
      operandViewModel={operandViewModel}
      editableAstNode={editableAstNode}
      onSave={onSave}
    />
  );
}
