import { type AstNode } from '@app-builder/models';
import { type EditableAstNode } from '@app-builder/models/editable-ast-node';
import { useAdaptEditableAstNode } from '@app-builder/services/ast-node/options';
import { useFormatReturnValue } from '@app-builder/services/ast-node/return-value';
import {
  adaptAstNodeFromEditorViewModel,
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
  options,
}: {
  operandViewModel: OperandViewModel;
  onSave?: (astNode: AstNode) => void;
  viewOnly?: boolean;
  options: EditableAstNode[];
}) {
  const adaptEditableAstNode = useAdaptEditableAstNode();
  const editableAstNode = adaptEditableAstNode(operandViewModel);
  const formatReturnValue = useFormatReturnValue();

  if (!editableAstNode) {
    const astNode = adaptAstNodeFromEditorViewModel(operandViewModel);
    return (
      <Default
        astNode={astNode}
        validationStatus={getValidationStatus(operandViewModel)}
      />
    );
  }

  if (viewOnly || !onSave) {
    return (
      <OperandLabel
        editableAstNode={editableAstNode}
        validationStatus={getValidationStatus(operandViewModel)}
        interactionMode="viewer"
        returnValue={formatReturnValue(operandViewModel.returnValue)}
      />
    );
  }

  return (
    <OperandEditor
      operandViewModel={operandViewModel}
      editableAstNode={editableAstNode}
      onSave={onSave}
      options={options}
    />
  );
}
