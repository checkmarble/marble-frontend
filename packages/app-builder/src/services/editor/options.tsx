import { type AstNode } from '@app-builder/models';
import { NewAggregatorAstNode } from '@app-builder/models/astNode/aggregation';
import {
  isMainAstOperatorFunction,
  sortMainAstOperatorFunctions,
} from '@app-builder/models/astNode/builder-ast-node-node-operator';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import {
  type CustomListAccessAstNode,
  NewCustomListAstNode,
} from '@app-builder/models/astNode/custom-list';
import {
  type DataAccessorAstNode,
  type DatabaseAccessAstNode,
  type PayloadAstNode,
} from '@app-builder/models/astNode/data-accessor';
import { NewIsMultipleOfAstNode } from '@app-builder/models/astNode/multiple-of';
import { NewFuzzyMatchComparatorAstNode } from '@app-builder/models/astNode/strings';
import {
  NewTimeAddAstNode,
  NewTimeNowAstNode,
  NewTimestampExtractAstNode,
} from '@app-builder/models/astNode/time';
import { type CustomList } from '@app-builder/models/custom-list';
import {
  type DataModel,
  type DataModelField,
  type DataType,
  type EnumValue,
  findDataModelTableByName,
  type TableModel,
} from '@app-builder/models/data-model';
import { aggregatorOperators } from '@app-builder/models/modale-operators';
import { type OperandType } from '@app-builder/models/operand-type';
import { type OperatorFunction } from '@app-builder/models/operator-functions';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useFormatLanguage } from '@app-builder/utils/format';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { getAstNodeDataType } from '../ast-node/getAstNodeDataType';
import { getAstNodeDisplayName } from '../ast-node/getAstNodeDisplayName';
import { getAstNodeOperandType } from '../ast-node/getAstNodeOperandType';
import { getCustomListAccessCustomList } from '../ast-node/getCustomListAccessCustomList';
import { getDataAccessorAstNodeField } from '../ast-node/getDataAccessorAstNodeField';
import { coerceToConstantAstNode } from './coerceToConstantAstNode';
import { getEnumValuesFromNeighbour } from './getEnumOptionsFromNeighbour';

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

const GetAstNodeDataTypeContext = createSimpleContext<
  (astNode: AstNode) => DataType
>('GetAstNodeDataTypeContext');

const GetAstNodeDisplayNameContext = createSimpleContext<
  (astNode: AstNode) => string
>('GetAstNodeDisplayNameContext');

const GetAstNodeOperandTypeContext = createSimpleContext<
  (
    astNode: AstNode,
    context?: {
      enumValues?: EnumValue[];
    },
  ) => OperandType
>('GetAstNodeOperandTypeContext');

export const useDatabaseAccessors = DatabaseAccessors.useValue;
export const usePayloadAccessors = PayloadAccessors.useValue;
export const useDataModel = DataModelContext.useValue;
export const useCustomLists = CustomLists.useValue;
export const useOperatorFunctions = OperatorFunctions.useValue;
export const useTriggerObjectTable = TriggerObjectTable.useValue;
export const useGetAstNodeDataType = GetAstNodeDataTypeContext.useValue;
export const useGetAstNodeDisplayName = GetAstNodeDisplayNameContext.useValue;
export const useGetAstNodeOperandType = GetAstNodeOperandTypeContext.useValue;

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
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();
  const triggerObjectTable = React.useMemo(
    () =>
      findDataModelTableByName({
        dataModel: dataModel,
        tableName: triggerObjectType,
      }),
    [dataModel, triggerObjectType],
  );

  const getAstNodeDataTypeValue = React.useCallback(
    (astNode: AstNode) =>
      getAstNodeDataType(astNode, { triggerObjectTable, dataModel }),
    [dataModel, triggerObjectTable],
  );

  const getAstNodeOperandTypeValue = React.useCallback(
    (
      astNode: AstNode,
      context: {
        enumValues?: EnumValue[];
      } = {},
    ) =>
      getAstNodeOperandType(astNode, {
        triggerObjectTable,
        dataModel,
        ...context,
      }),
    [dataModel, triggerObjectTable],
  );

  const getAstNodeDisplayNameValue = React.useCallback(
    (astNode: AstNode) =>
      getAstNodeDisplayName(astNode, { t, language, customLists }),
    [t, language, customLists],
  );

  return (
    <DatabaseAccessors.Provider value={databaseAccessors}>
      <PayloadAccessors.Provider value={payloadAccessors}>
        <DataModelContext.Provider value={dataModel}>
          <CustomLists.Provider value={customLists}>
            <OperatorFunctions.Provider value={operators}>
              <TriggerObjectTable.Provider value={triggerObjectTable}>
                <GetAstNodeDataTypeContext.Provider
                  value={getAstNodeDataTypeValue}
                >
                  <GetAstNodeDisplayNameContext.Provider
                    value={getAstNodeDisplayNameValue}
                  >
                    <GetAstNodeOperandTypeContext.Provider
                      value={getAstNodeOperandTypeValue}
                    >
                      {children}
                    </GetAstNodeOperandTypeContext.Provider>
                  </GetAstNodeDisplayNameContext.Provider>
                </GetAstNodeDataTypeContext.Provider>
              </TriggerObjectTable.Provider>
            </OperatorFunctions.Provider>
          </CustomLists.Provider>
        </DataModelContext.Provider>
      </PayloadAccessors.Provider>
    </DatabaseAccessors.Provider>
  );
}

export function useGetEnumValuesFromNeighbour() {
  const dataModel = useDataModel();
  const triggerObjectTable = useTriggerObjectTable();

  return React.useCallback(
    (parentAstNode: AstNode, childIndex: number) => {
      return getEnumValuesFromNeighbour(parentAstNode, childIndex, {
        dataModel,
        triggerObjectTable,
      });
    },
    [dataModel, triggerObjectTable],
  );
}

export function useGetAstNodeOption() {
  const getAstNodeDataType = useGetAstNodeDataType();
  const getAstNodeOperandType = useGetAstNodeOperandType();
  const getAstNodeDisplayName = useGetAstNodeDisplayName();

  return React.useCallback(
    (
      astNode: AstNode,
      context: {
        enumValues?: EnumValue[];
      } = {},
    ) => {
      return {
        astNode,
        dataType: getAstNodeDataType(astNode),
        operandType: getAstNodeOperandType(astNode, context),
        displayName: getAstNodeDisplayName(astNode),
      };
    },
    [getAstNodeDataType, getAstNodeOperandType, getAstNodeDisplayName],
  );
}

export function useTimestampFieldOptions() {
  const databaseAccessors = useDatabaseAccessors();
  const payloadAccessors = usePayloadAccessors();
  const getAstNodeOption = useGetAstNodeOption();

  return React.useMemo(() => {
    return [
      NewTimeNowAstNode(),
      NewTimeAddAstNode(),
      ...databaseAccessors,
      ...payloadAccessors,
    ]
      .map((astNode) => getAstNodeOption(astNode))
      .filter(({ dataType }) => dataType == 'Timestamp');
  }, [databaseAccessors, payloadAccessors, getAstNodeOption]);
}

export function useOperandOptions(enumValues?: EnumValue[]) {
  const databaseAccessors = useDatabaseAccessors();
  const payloadAccessors = usePayloadAccessors();
  const customLists = useCustomLists();
  const getAstNodeOption = useGetAstNodeOption();

  return React.useMemo(() => {
    return [
      ...databaseAccessors,
      ...payloadAccessors,
      ...customLists.map(({ id }) => NewCustomListAstNode(id)),
      ...aggregatorOperators.map((aggregator) =>
        NewAggregatorAstNode(aggregator),
      ),
      NewFuzzyMatchComparatorAstNode({ funcName: 'FuzzyMatch' }),
      NewTimeAddAstNode(),
      NewTimestampExtractAstNode(),
      NewTimeNowAstNode(),
      NewIsMultipleOfAstNode(),
      ...(enumValues ?? []).map((enumValue) =>
        NewConstantAstNode({ constant: enumValue }),
      ),
    ].map((astNode) => getAstNodeOption(astNode, { enumValues }));
  }, [
    customLists,
    databaseAccessors,
    enumValues,
    getAstNodeOption,
    payloadAccessors,
  ]);
}

export function useMainAstOperatorFunctions() {
  const operators = useOperatorFunctions();
  return React.useMemo(
    () =>
      operators
        .filter(isMainAstOperatorFunction)
        .sort(sortMainAstOperatorFunctions),
    [operators],
  );
}

export function useCustomListAccessCustomList(
  astNode: CustomListAccessAstNode,
) {
  const customLists = useCustomLists();
  return React.useMemo(
    () => getCustomListAccessCustomList(astNode, { customLists }),
    [astNode, customLists],
  );
}

export function useDataAccessorAstNodeField(
  astNodeVM: DataAccessorAstNode,
): DataModelField {
  const dataModel = useDataModel();
  const triggerObjectTable = useTriggerObjectTable();
  return React.useMemo(
    () =>
      getDataAccessorAstNodeField(astNodeVM, { dataModel, triggerObjectTable }),
    [astNodeVM, dataModel, triggerObjectTable],
  );
}

export function useDefaultCoerceToConstant() {
  const { t } = useTranslation(['common', 'scenarios']);
  const getAstNodeDisplayName = useGetAstNodeDisplayName();
  const getAstNodeDataType = useGetAstNodeDataType();
  return React.useCallback(
    (searchValue: string) => {
      const constantAstNodes = coerceToConstantAstNode(searchValue, {
        // Accept english and localized values for booleans
        // They will be coerced to the localized value
        booleans: {
          true: ['true', t('common:true')],
          false: ['false', t('common:false')],
        },
      });
      return constantAstNodes.map((astNode) => ({
        astNode,
        displayName: getAstNodeDisplayName(astNode),
        dataType: getAstNodeDataType(astNode),
      }));
    },
    [getAstNodeDataType, getAstNodeDisplayName, t],
  );
}
