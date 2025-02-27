import { type AstNode, type DataModel, type EnumValue, type TableModel } from '@app-builder/models';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { NewCustomListAstNode } from '@app-builder/models/astNode/custom-list';
import { isDatabaseAccess, isPayload } from '@app-builder/models/astNode/data-accessor';
import { getAstNodeDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import { getAstNodeOperandType } from '@app-builder/services/ast-node/getAstNodeOperandType';
import { getEnumValuesFromNeighbour } from '@app-builder/services/editor/getEnumOptionsFromNeighbour';
import { type PathSegment } from '@app-builder/utils/tree';
import { type TFunction } from 'i18next';
import * as R from 'remeda';
import { match } from 'ts-pattern';

import { type AstBuilderDataStoreObject } from '../Provider';
import { type AstNodeStringifierContext } from '../types';
import {
  AST_BUILDER_STATIC_OPTIONS,
  MODELING_OPTIONS,
  type OperandMenuOption,
} from './base-options';

type GroupByOperandTypeContext = {
  enumValues: EnumValue[] | undefined;
  triggerObjectType: string;
} & AstNodeStringifierContext;

export type EnrichedMenuOption = Omit<OperandMenuOption, 'operandType' | 'displayName'> & {
  operandType: NonNullable<OperandMenuOption['operandType']>;
  displayName: NonNullable<OperandMenuOption['displayName']>;
};

function getFieldName(astNode: AstNode) {
  return match(astNode)
    .when(isDatabaseAccess, (n) => n.namedChildren.fieldName.constant)
    .when(isPayload, (n) => n.children[0].constant)
    .otherwise(() => 'unknown');
}

export function getOperandMenuOptions(
  enums: EnumValue[] | undefined,
  data: AstBuilderDataStoreObject,
  node: AstNode,
  language: string,
  t: TFunction<['common', 'scenarios'], undefined>,
) {
  const mapOption = createMapOption({
    enumValues: enums,
    triggerObjectType: data.triggerObjectType,
    customLists: data.customLists,
    language,
    t,
  });

  return [
    ...AST_BUILDER_STATIC_OPTIONS,
    ...data.databaseAccessors.map((a) => ({ astNode: a })),
    ...data.payloadAccessors.map((a) => ({ astNode: a })),
    ...data.customLists.map((l) => ({
      astNode: NewCustomListAstNode(l.id),
    })),
    ...(enums ?? []).map((enumValue) => ({
      astNode: NewConstantAstNode({ constant: enumValue }),
    })),
    ...MODELING_OPTIONS({ currentNode: node, t }),
  ].map(mapOption);
}

export function groupByOperandType(
  operandMenuOptions: EnrichedMenuOption[],
  context: GroupByOperandTypeContext,
) {
  return R.pipe(
    operandMenuOptions,
    R.groupBy((option) => option.operandType),
    ({ Enum, CustomList, Function, Field, Modeling }) => {
      const fieldOptions = Field
        ? R.pipe(
            Field,
            R.groupBy((option) => {
              const astNode = option.astNode;
              if (isDatabaseAccess(astNode)) {
                const { path, tableName } = astNode.namedChildren;
                return [tableName.constant, ...path.constant].join('.');
              }
              if (isPayload(astNode)) {
                return context.triggerObjectType;
              }
            }),
            R.mapValues((value) => R.sortBy(value, (opt) => getFieldName(opt.astNode))),
            R.entries(),
            R.sortBy(([path]) => path),
          )
        : [];

      return {
        fieldOptions,
        enumOptions: Enum ?? [],
        customListOptions: CustomList ?? [],
        functionOptions: Function ?? [],
        modelingOptions: Modeling ?? [],
      };
    },
  );
}

function createMapOption({ enumValues, customLists, language, t }: GroupByOperandTypeContext) {
  return function ({
    astNode,
    operandType,
    displayName,
    ...rest
  }: OperandMenuOption): EnrichedMenuOption {
    return {
      astNode,
      operandType:
        operandType ??
        getAstNodeOperandType(astNode, {
          enumValues,
        }),
      displayName:
        displayName ??
        getAstNodeDisplayName(astNode, {
          customLists,
          language,
          t,
        }),
      ...rest,
    };
  };
}

export function getOptionDisplayName(
  option: EnrichedMenuOption,
  context: AstNodeStringifierContext,
) {
  return option.displayName ?? getAstNodeDisplayName(option.astNode, context);
}

type DataContext = {
  dataModel: DataModel;
  triggerObjectTable: TableModel;
};
export function getEnumValues(
  pathSegment: PathSegment,
  { parentNode, context }: { parentNode: AstNode; context: DataContext },
) {
  if (pathSegment.type != 'children') return [];

  return getEnumValuesFromNeighbour(parentNode, pathSegment.index, context);
}
