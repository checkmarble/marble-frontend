import {
  type AstNode,
  type DatabaseAccessAstNode,
  NewAggregatorAstNode,
  NewConstantAstNode,
  type PayloadAstNode,
  type TableModel,
} from '@app-builder/models';
import {
  adaptEditableAstNode,
  AggregatorEditableAstNode,
  ConstantEditableAstNode,
  CustomListEditableAstNode,
  DatabaseAccessEditableAstNode,
  PayloadAccessorsEditableAstNode,
  TimeAddEditableAstNode,
  TimeNowEditableAstNode,
} from '@app-builder/models/editable-ast-node';
import { aggregatorOperators } from '@app-builder/models/editable-operators';
import {
  adaptAstNodeFromEditorViewModel,
  type EditorNodeViewModel,
  getValidationStatus,
} from '@app-builder/services/editor/ast-editor';
import { type CustomList } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Default } from '../Default';
import { getEnumOptionsFromNeighbour, OperandEditor } from './OperandEditor';
import { OperandLabel } from './OperandLabel';

export type OperandViewModel = EditorNodeViewModel;

export function Operand({
  input,
  operandViewModel,
  onSave,
  viewOnly,
}: {
  input: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    dataModel: TableModel[];
    customLists: CustomList[];
    triggerObjectTable: TableModel;
  };
  operandViewModel: OperandViewModel;
  onSave?: (astNode: AstNode) => void;
  viewOnly?: boolean;
}) {
  const { t } = useTranslation(['scenarios']);
  const astNode = adaptAstNodeFromEditorViewModel(operandViewModel);
  const editableAstNode = adaptEditableAstNode(t, astNode, {
    dataModel: input.dataModel,
    triggerObjectTable: input.triggerObjectTable,
    customLists: input.customLists,
    enumOptions: getEnumOptionsFromNeighbour({
      viewModel: operandViewModel,
      triggerObjectTable: input.triggerObjectTable,
      dataModel: input.dataModel,
    }),
  });

  const options = useMemo(() => {
    const databaseAccessors = input.databaseAccessors.map(
      (node) => new DatabaseAccessEditableAstNode(node, input.dataModel),
    );
    const payloadAccessors = input.payloadAccessors.map(
      (node) =>
        new PayloadAccessorsEditableAstNode(node, input.triggerObjectTable),
    );
    const customLists = input.customLists.map(
      (customList) => new CustomListEditableAstNode(customList),
    );
    const functions = [
      ...aggregatorOperators.map(
        (aggregator) =>
          new AggregatorEditableAstNode(
            t,
            NewAggregatorAstNode(aggregator),
            input.dataModel,
            input.customLists,
            input.triggerObjectTable,
          ),
      ),
      new TimeAddEditableAstNode(t),
      new TimeNowEditableAstNode(t),
    ];

    const enumOptionValues = getEnumOptionsFromNeighbour({
      viewModel: operandViewModel,
      dataModel: input.dataModel,
      triggerObjectTable: input.triggerObjectTable,
    });

    const enumOptions = enumOptionValues.map(
      (enumValue) =>
        new ConstantEditableAstNode(
          NewConstantAstNode({
            constant: enumValue,
          }),
          enumOptionValues,
        ),
    );

    return [
      ...payloadAccessors,
      ...databaseAccessors,
      ...customLists,
      ...functions,
      ...enumOptions,
    ];
  }, [
    input.customLists,
    input.dataModel,
    input.databaseAccessors,
    input.payloadAccessors,
    input.triggerObjectTable,
    operandViewModel,
    t,
  ]);

  if (!editableAstNode) {
    return (
      <Default
        editorNodeViewModel={operandViewModel}
        input={input}
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
      />
    );
  }

  return (
    <OperandEditor
      options={options}
      operandViewModel={operandViewModel}
      editableAstNode={editableAstNode}
      onSave={onSave}
    />
  );
}
