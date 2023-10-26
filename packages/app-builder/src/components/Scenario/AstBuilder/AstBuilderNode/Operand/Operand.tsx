import {
  adaptLabelledAst,
  type AstNode,
  type EvaluationError,
  functionNodeNames,
  isAggregation,
  isConstant,
  isCustomListAccess,
  isDatabaseAccess,
  isPayload,
  isTimeAdd,
  isUndefinedAstNode,
  separateChildrenErrors,
} from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import { Default } from '../Default';
import { getEnumOptionsFromNeighbour, OperandEditor } from './OperandEditor';

export type OperandViewModel = EditorNodeViewModel;

export const computeOperandErrors = (
  viewModel: EditorNodeViewModel
): EvaluationError[] => {
  if (viewModel.funcName && functionNodeNames.includes(viewModel.funcName)) {
    const { nodeErrors } = separateChildrenErrors(viewModel.errors);
    return nodeErrors;
  } else {
    return [
      ...viewModel.errors,
      ...viewModel.children.flatMap(computeOperandErrors),
      ...Object.values(viewModel.namedChildren).flatMap(computeOperandErrors),
    ];
  }
};

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
  onSave: (astNode: AstNode) => void;
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

  return (
    <OperandEditor
      ariaLabel={ariaLabel}
      builder={builder}
      operandViewModel={operandViewModel}
      labelledAst={labelledAst}
      onSave={onSave}
      viewOnly={viewOnly}
    />
  );
}
