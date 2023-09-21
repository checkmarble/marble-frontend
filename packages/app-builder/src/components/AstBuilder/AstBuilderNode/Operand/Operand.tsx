import {
  type AstNode,
  type DataModel,
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
    triggerObjectType: DataModel;
    dataModel: DataModel[];
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
    const labelledAst = newAggregatorLabelledAst(node);
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
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
  onSave: (astNode: AstNode) => void;
  viewOnly?: boolean;
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
    return <Default editorNodeViewModel={operandViewModel} builder={builder} />;
  }

  return (
    <OperandEditor
      builder={builder}
      editableOperandViewModel={editableOperandViewModel}
      onSave={onSave}
      viewOnly={viewOnly}
    />
  );
}
