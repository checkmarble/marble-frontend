import { type OperandViewModel } from '@app-builder/components/Scenario/AstBuilder/AstBuilderNode/Operand';
import {
  type DatabaseAccessAstNode,
  isDatabaseAccess,
  isPayload,
  NewAggregatorAstNode,
  NewConstantAstNode,
  NewFuzzyMatchComparatorAstNode,
  type PayloadAstNode,
} from '@app-builder/models/ast-node';
import { type CustomList } from '@app-builder/models/custom-list';
import {
  type DataModel,
  type EnumValue,
  findDataModelField,
  findDataModelTable,
  findDataModelTableByName,
  type TableModel,
} from '@app-builder/models/data-model';
import {
  adaptEditableAstNode,
  AggregatorEditableAstNode,
  ConstantEditableAstNode,
  CustomListEditableAstNode,
  DatabaseAccessEditableAstNode,
  FuzzyMatchComparatorEditableAstNode,
  PayloadAccessorsEditableAstNode,
  TimeAddEditableAstNode,
  TimeNowEditableAstNode,
} from '@app-builder/models/editable-ast-node';
import {
  aggregatorOperators,
  isTwoLineOperandOperatorFunction,
  type OperatorFunction,
  sortTwoLineOperandOperatorFunctions,
} from '@app-builder/models/editable-operators';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { adaptAstNodeFromEditorViewModel } from '../editor/ast-editor';

const DatabaseAccessors =
  createSimpleContext<DatabaseAccessAstNode[]>('DatabaseAccessors');

const PayloadAccessors =
  createSimpleContext<PayloadAstNode[]>('PayloadAccessors');

const DataModelContext = createSimpleContext<DataModel>('DataModel');

const CustomLists = createSimpleContext<CustomList[]>('CustomLists');

const OperatorFunctions =
  createSimpleContext<OperatorFunction[]>('OperatorFunctions');

const TriggerObjectTable =
  createSimpleContext<TableModel>('TriggerObjectTable');

export const useDatabaseAccessors = DatabaseAccessors.useValue;
export const usePayloadAccessors = PayloadAccessors.useValue;
export const useDataModel = DataModelContext.useValue;
export const useCustomLists = CustomLists.useValue;
export const useOperatorFunctions = OperatorFunctions.useValue;
export const useTriggerObjectTable = TriggerObjectTable.useValue;

export function OptionsProvider({
  children,
  databaseAccessors,
  payloadAccessors,
  operators,
  dataModel,
  customLists,
  triggerObjectType,
}: {
  children: React.ReactNode;
  databaseAccessors: DatabaseAccessAstNode[];
  payloadAccessors: PayloadAstNode[];
  operators: OperatorFunction[];
  dataModel: DataModel;
  customLists: CustomList[];
  triggerObjectType: string;
}) {
  const triggerObjectTable = useMemo(
    () =>
      findDataModelTableByName({
        dataModel: dataModel,
        tableName: triggerObjectType,
      }),
    [dataModel, triggerObjectType],
  );

  return (
    <DatabaseAccessors.Provider value={databaseAccessors}>
      <PayloadAccessors.Provider value={payloadAccessors}>
        <DataModelContext.Provider value={dataModel}>
          <CustomLists.Provider value={customLists}>
            <OperatorFunctions.Provider value={operators}>
              <TriggerObjectTable.Provider value={triggerObjectTable}>
                {children}
              </TriggerObjectTable.Provider>
            </OperatorFunctions.Provider>
          </CustomLists.Provider>
        </DataModelContext.Provider>
      </PayloadAccessors.Provider>
    </DatabaseAccessors.Provider>
  );
}

export function useTimestampFieldOptions() {
  const { t } = useTranslation(['common', 'scenarios']);

  const databaseAccessors = useDatabaseAccessors();
  const payloadAccessors = usePayloadAccessors();
  const dataModel = useDataModel();
  const triggerObjectTable = useTriggerObjectTable();

  return useMemo(() => {
    const databaseAccessorEditableAstNodes = databaseAccessors.map(
      (node) => new DatabaseAccessEditableAstNode(node, dataModel),
    );
    const payloadAccessorEditableAstNodes = payloadAccessors.map(
      (node) => new PayloadAccessorsEditableAstNode(node, triggerObjectTable),
    );
    const timestampFieldOptions = [
      ...payloadAccessorEditableAstNodes,
      ...databaseAccessorEditableAstNodes,
    ].filter(({ dataType }) => dataType == 'Timestamp');

    return [new TimeNowEditableAstNode(t), ...timestampFieldOptions];
  }, [dataModel, databaseAccessors, payloadAccessors, triggerObjectTable, t]);
}

export function useOperandOptions({
  operandViewModel,
}: {
  operandViewModel: OperandViewModel;
}) {
  const { t } = useTranslation(['common', 'scenarios']);

  const databaseAccessors = useDatabaseAccessors();
  const payloadAccessors = usePayloadAccessors();
  const customLists = useCustomLists();
  const dataModel = useDataModel();
  const triggerObjectTable = useTriggerObjectTable();

  return useMemo(() => {
    const databaseAccessorEditableAstNodes = databaseAccessors.map(
      (node) => new DatabaseAccessEditableAstNode(node, dataModel),
    );
    const payloadAccessorEditableAstNodes = payloadAccessors.map(
      (node) => new PayloadAccessorsEditableAstNode(node, triggerObjectTable),
    );
    const customListEditableAstNodes = customLists.map(
      (customList) => new CustomListEditableAstNode(customList),
    );
    const functions = [
      ...aggregatorOperators.map(
        (aggregator) =>
          new AggregatorEditableAstNode(
            t,
            NewAggregatorAstNode(aggregator),
            dataModel,
            customLists,
            triggerObjectTable,
          ),
      ),
      new FuzzyMatchComparatorEditableAstNode(
        t,
        NewFuzzyMatchComparatorAstNode({
          funcName: 'FuzzyMatch',
        }),
        { triggerObjectTable, dataModel, customLists, enumOptions: [] },
      ),
      new TimeAddEditableAstNode(t),
      new TimeNowEditableAstNode(t),
    ];

    const enumOptionValues = getEnumOptionsFromNeighbour({
      viewModel: operandViewModel,
      dataModel: dataModel,
      triggerObjectTable: triggerObjectTable,
    });

    const enumOptions = enumOptionValues.map(
      (enumValue) =>
        new ConstantEditableAstNode(
          t,
          NewConstantAstNode({
            constant: enumValue,
          }),
          enumOptionValues,
        ),
    );

    return [
      ...payloadAccessorEditableAstNodes,
      ...databaseAccessorEditableAstNodes,
      ...customListEditableAstNodes,
      ...functions,
      ...enumOptions,
    ];
  }, [
    customLists,
    dataModel,
    databaseAccessors,
    payloadAccessors,
    triggerObjectTable,
    operandViewModel,
    t,
  ]);
}

function getEnumOptionsFromNeighbour({
  viewModel,
  triggerObjectTable,
  dataModel,
}: {
  viewModel: OperandViewModel;
  triggerObjectTable: TableModel;
  dataModel: DataModel;
}): EnumValue[] {
  if (!viewModel.parent) {
    return [];
  }
  if (viewModel.parent.funcName !== '=') {
    return [];
  }
  const neighbourNodeViewModel = viewModel.parent.children.find(
    (child) => child.nodeId !== viewModel.nodeId,
  );
  if (!neighbourNodeViewModel) {
    return [];
  }
  const neighbourNode = adaptAstNodeFromEditorViewModel(neighbourNodeViewModel);
  if (isPayload(neighbourNode)) {
    const field = findDataModelField({
      table: triggerObjectTable,
      fieldName: neighbourNode.children[0].constant,
    });
    return field.isEnum ? (field.values ?? []) : [];
  }

  if (isDatabaseAccess(neighbourNode)) {
    const table = findDataModelTable({
      dataModel,
      tableName: neighbourNode.namedChildren.tableName.constant,
      path: neighbourNode.namedChildren.path.constant,
    });
    const field = findDataModelField({
      table: table,
      fieldName: neighbourNode.namedChildren.fieldName.constant,
    });
    return field.isEnum ? (field.values ?? []) : [];
  }
  return [];
}

export function useAdaptEditableAstNode() {
  const { t } = useTranslation(['common', 'scenarios']);

  const customLists = useCustomLists();
  const dataModel = useDataModel();
  const triggerObjectTable = useTriggerObjectTable();

  return (operandViewModel: OperandViewModel) => {
    const astNode = adaptAstNodeFromEditorViewModel(operandViewModel);
    return adaptEditableAstNode(t, astNode, {
      dataModel: dataModel,
      triggerObjectTable: triggerObjectTable,
      customLists: customLists,
      enumOptions: getEnumOptionsFromNeighbour({
        viewModel: operandViewModel,
        triggerObjectTable: triggerObjectTable,
        dataModel: dataModel,
      }),
    });
  };
}

export function useTwoLineOperandOperatorFunctions() {
  const operators = useOperatorFunctions();
  return useMemo(
    () =>
      operators
        .filter(isTwoLineOperandOperatorFunction)
        .sort(sortTwoLineOperandOperatorFunctions),
    [operators],
  );
}
