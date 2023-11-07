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
import { getEnumOptionsFromNeighbour, OperandEditor } from './OperandEditor';
import { OperandViewer } from './OperandViewer';

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
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
  onSave?: (astNode: AstNode) => void;
  viewOnly?: boolean;
  ariaLabel?: string;
}) {
  const astNode = adaptAstNodeFromEditorViewModel(operandViewModel);
  const labelledAst = adaptLabelledAst(astNode, {
    dataModel: builder.input.dataModel,
    triggerObjectTable: builder.input.triggerObjectTable,
    customLists: builder.input.customLists,
    enumOptions: getEnumOptionsFromNeighbour({
      viewModel: operandViewModel,
      triggerObjectTable: builder.input.triggerObjectTable,
      dataModel: builder.input.dataModel,
    }),
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

  if (viewOnly || !onSave) {
    return (
      <OperandViewer
        ariaLabel={ariaLabel}
        labelledAst={labelledAst}
        operandViewModel={operandViewModel}
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
    />
  );
}
