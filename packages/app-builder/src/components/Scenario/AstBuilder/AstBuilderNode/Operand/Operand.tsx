import {
  adaptLabelledAst,
  type AstNode,
  isAggregation,
  isConstant,
  isCustomListAccess,
  isDatabaseAccess,
  isPayload,
  isTimeAdd,
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
    isTimeAdd(node) ||
    isUndefinedAstNode(node)
  );
}

export function Operand({
  builder,
  operandViewModel,
  onSave,
  viewOnly,
  ariaLabel,
  shouldDisplayEnumOptions,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
  onSave: (astNode: AstNode) => void;
  viewOnly?: boolean;
  ariaLabel?: string;
  shouldDisplayEnumOptions?: boolean;
}) {
  const astNode = adaptAstNodeFromEditorViewModel(operandViewModel);
  const labelledAst = adaptLabelledAst(astNode, {
    dataModel: builder.dataModel,
    triggerObjectTable: builder.triggerObjectTable,
    customLists: builder.customLists,
  });
  const isEditable = !!labelledAst && isEditableOperand(astNode);

  if (!isEditable) {
    return (
      <Default
        ariaLabel={ariaLabel}
        editorNodeViewModel={operandViewModel}
        builder={builder}
      />
    );
  }

  return (
    <OperandEditor
      ariaLabel={ariaLabel}
      builder={builder}
      operandViewModel={operandViewModel}
      labelledAst={labelledAst}
      onSave={onSave}
      viewOnly={viewOnly}
      shouldDisplayEnumOptions={shouldDisplayEnumOptions}
    />
  );
}
