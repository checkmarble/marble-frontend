import {
  adaptLabelledAst,
  type AstNode,
  isAggregation,
  isConstant,
  isCustomListAccess,
  isDatabaseAccess,
  isPayload,
  isUndefinedAstNode,
} from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import { Default } from '../Default';
import { OperandEditor } from './OperandEditor';

export type OperandViewModel = EditorNodeViewModel;

export function isEditableOperand(node: AstNode): boolean {
  return (
    isConstant(node) ||
    isCustomListAccess(node) ||
    isDatabaseAccess(node) ||
    isPayload(node) ||
    isAggregation(node) ||
    isUndefinedAstNode(node)
  );
}

export function Operand({
  builder,
  operandViewModel,
  onSave,
  viewOnly,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
  onSave: (astNode: AstNode) => void;
  viewOnly?: boolean;
}) {
  const astNode = adaptAstNodeFromEditorViewModel(operandViewModel);
  const labelledAst = adaptLabelledAst(astNode, {
    dataModel: builder.dataModels,
    triggerObjectType: builder.triggerObjectType,
    customLists: builder.customLists,
  });
  const isEditable = !!labelledAst && isEditableOperand(astNode);

  if (!isEditable) {
    return <Default editorNodeViewModel={operandViewModel} builder={builder} />;
  }

  return (
    <OperandEditor
      builder={builder}
      operandViewModel={operandViewModel}
      labelledAst={labelledAst}
      onSave={onSave}
      viewOnly={viewOnly}
    />
  );
}
