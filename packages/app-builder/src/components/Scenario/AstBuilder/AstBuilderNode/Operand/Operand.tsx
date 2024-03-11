import { type AstNode } from '@app-builder/models';
import { adaptEditableAstNode } from '@app-builder/models/editable-ast-node';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { useTranslation } from 'react-i18next';

import { Default } from '../Default';
import { getEnumOptionsFromNeighbour, OperandEditor } from './OperandEditor';
import { OperandLabel } from './OperandLabel';

export type OperandViewModel = EditorNodeViewModel;

export function Operand({
  builder,
  operandViewModel,
  onSave,
  viewOnly,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
  onSave?: (astNode: AstNode) => void;
  viewOnly?: boolean;
}) {
  const { t } = useTranslation(['scenarios']);
  const astNode = adaptAstNodeFromEditorViewModel(operandViewModel);
  const editableAstNode = adaptEditableAstNode(t, astNode, {
    dataModel: builder.input.dataModel,
    triggerObjectTable: builder.input.triggerObjectTable,
    customLists: builder.input.customLists,
    enumOptions: getEnumOptionsFromNeighbour({
      viewModel: operandViewModel,
      triggerObjectTable: builder.input.triggerObjectTable,
      dataModel: builder.input.dataModel,
    }),
  });

  if (!editableAstNode) {
    return <Default editorNodeViewModel={operandViewModel} builder={builder} />;
  }

  if (viewOnly || !onSave) {
    return <OperandLabel editableAstNode={editableAstNode} type="view" />;
  }

  return (
    <OperandEditor
      builder={builder}
      operandViewModel={operandViewModel}
      editableAstNode={editableAstNode}
      onSave={onSave}
    />
  );
}
