import {
  type AstNode,
  NewAggregatorAstNode,
  NewConstantAstNode,
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
  type AstBuilder,
  type EditorNodeViewModel,
  getValidationStatus,
} from '@app-builder/services/editor/ast-editor';
import { useMemo } from 'react';
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

  const options = useMemo(() => {
    const databaseAccessors = builder.input.databaseAccessors.map(
      (node) =>
        new DatabaseAccessEditableAstNode(node, builder.input.dataModel),
    );
    const payloadAccessors = builder.input.payloadAccessors.map(
      (node) =>
        new PayloadAccessorsEditableAstNode(
          node,
          builder.input.triggerObjectTable,
        ),
    );
    const customLists = builder.input.customLists.map(
      (customList) => new CustomListEditableAstNode(customList),
    );
    const functions = [
      ...aggregatorOperators.map(
        (aggregator) =>
          new AggregatorEditableAstNode(
            t,
            NewAggregatorAstNode(aggregator),
            builder.input.dataModel,
            builder.input.customLists,
            builder.input.triggerObjectTable,
          ),
      ),
      new TimeAddEditableAstNode(t),
      new TimeNowEditableAstNode(t),
    ];

    const enumOptionValues = getEnumOptionsFromNeighbour({
      viewModel: operandViewModel,
      dataModel: builder.input.dataModel,
      triggerObjectTable: builder.input.triggerObjectTable,
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
    builder.input.customLists,
    builder.input.dataModel,
    builder.input.databaseAccessors,
    builder.input.payloadAccessors,
    builder.input.triggerObjectTable,
    operandViewModel,
    t,
  ]);

  if (!editableAstNode) {
    return (
      <Default
        editorNodeViewModel={operandViewModel}
        builder={builder}
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
