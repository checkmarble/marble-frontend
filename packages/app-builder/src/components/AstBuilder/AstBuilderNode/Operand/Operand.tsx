import {
  type AstNode,
  isAggregation,
  isConstant,
  isCustomListAccess,
  isDatabaseAccess,
  isPayload,
  isUndefinedAstNode,
  type LabelledAst,
  newAggregatorLabelledAst,
  newConstantLabelledAst,
  newCustomListLabelledAst,
  newDatabaseAccessorsLabelledAst,
  newPayloadAccessorsLabelledAst,
  newUndefinedLabelledAst,
  type TableModel,
} from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { type CustomList } from '@marble-api';

import { Default } from '../Default';
import { OperandEditor } from './OperandEditor';

export type OperandViewModel = EditorNodeViewModel;

export interface EditableOperandViewModel {
  editorNodeViewModel: EditorNodeViewModel;
  labelledAst: LabelledAst;
}

export function adaptEditableOperandViewModel(
  editorNodeViewModel: EditorNodeViewModel,
  {
    triggerObjectType,
    dataModel,
    customLists,
  }: {
    triggerObjectType: TableModel;
    dataModel: TableModel[];
    customLists: CustomList[];
  }
): EditableOperandViewModel | undefined {
  const node = adaptAstNodeFromEditorViewModel(editorNodeViewModel);

  if (isConstant(node)) {
    const labelledAst = newConstantLabelledAst(node);
    return {
      labelledAst,
      editorNodeViewModel,
    };
  }

  if (isCustomListAccess(node)) {
    const customList = customLists.find(
      (customList) => customList.id === node.namedChildren.customListId.constant
    );
    if (!customList) return undefined;
    const labelledAst = newCustomListLabelledAst(customList);
    return {
      labelledAst,
      editorNodeViewModel,
    };
  }

  if (isDatabaseAccess(node)) {
    const labelledAst = newDatabaseAccessorsLabelledAst({
      node,
      dataModel,
    });
    return {
      labelledAst,
      editorNodeViewModel,
    };
  }

  if (isPayload(node)) {
    const labelledAst = newPayloadAccessorsLabelledAst({
      triggerObjectType,
      node,
    });
    return {
      labelledAst,
      editorNodeViewModel,
    };
  }

  if (isAggregation(node)) {
    const labelledAst = newAggregatorLabelledAst(
      node.namedChildren.aggregator.constant
    );
    return {
      labelledAst,
      editorNodeViewModel,
    };
  }

  if (isUndefinedAstNode(node)) {
    const labelledAst = newUndefinedLabelledAst();
    return {
      labelledAst,
      editorNodeViewModel,
    };
  }

  return undefined;
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
  const editableOperandViewModel = adaptEditableOperandViewModel(
    operandViewModel,
    {
      dataModel: builder.dataModels,
      triggerObjectType: builder.triggerObjectType,
      customLists: builder.customLists,
    }
  );
  if (!editableOperandViewModel) {
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
      editableOperandViewModel={editableOperandViewModel}
      onSave={onSave}
      viewOnly={viewOnly}
    />
  );
}
