import {
  type AstNode,
  type DataModel,
  type EnumValue,
  type IdLessAstNode,
  type TableModel,
} from '@app-builder/models';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { NewCustomListAstNode } from '@app-builder/models/astNode/custom-list';
import { isDatabaseAccess, isPayload } from '@app-builder/models/astNode/data-accessor';
import { type NodeEvaluation } from '@app-builder/models/node-evaluation';
import { type BuilderOptionsResource } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/builder-options';
import { getAstNodeDataType } from '@app-builder/services/ast-node/getAstNodeDataType';
import { getAstNodeDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import { getAstNodeOperandType } from '@app-builder/services/ast-node/getAstNodeOperandType';
import { getEnumValuesFromNeighbour } from '@app-builder/services/editor/getEnumOptionsFromNeighbour';
import { type PathSegment } from '@app-builder/utils/tree';
import { type TFunction } from 'i18next';
import * as R from 'remeda';
import { match } from 'ts-pattern';

import { type AstNodeStringifierContext } from '../types';
import {
  AST_BUILDER_STATIC_OPTIONS,
  MODELING_OPTIONS,
  type OperandMenuOption,
} from './base-options';

type EnrichingOperandContext = {
  enumValues: EnumValue[] | undefined;
  triggerObjectTable: TableModel;
  dataModel: DataModel;
} & AstNodeStringifierContext;

export type EnrichedMenuOption = Omit<
  OperandMenuOption,
  'operandType' | 'displayName' | 'dataType'
> & {
  operandType: NonNullable<OperandMenuOption['operandType']>;
  displayName: NonNullable<OperandMenuOption['displayName']>;
  dataType: NonNullable<OperandMenuOption['dataType']>;
};

function getFieldName(astNode: IdLessAstNode) {
  return match(astNode)
    .when(isDatabaseAccess, (n) => n.namedChildren.fieldName.constant)
    .when(isPayload, (n) => n.children[0].constant)
    .otherwise(() => 'unknown');
}

export function getOperandMenuOptions(params: {
  node: AstNode;
  enums: EnumValue[] | undefined;
  data: BuilderOptionsResource;
  triggerObjectTable: TableModel;
  language: string;
  t: TFunction<['common', 'scenarios'], undefined>;
}) {
  const mapOption = createMapOption({
    enumValues: params.enums,
    triggerObjectTable: params.triggerObjectTable,
    dataModel: params.data.dataModel,
    customLists: params.data.customLists,
    language: params.language,
    t: params.t,
  });

  return [
    ...AST_BUILDER_STATIC_OPTIONS,
    ...params.data.databaseAccessors.map((a) => ({ astNode: a })),
    ...params.data.payloadAccessors.map((a) => ({ astNode: a })),
    ...params.data.customLists.map((l) => ({
      astNode: NewCustomListAstNode(l.id),
    })),
    ...(params.enums ?? []).map((enumValue) => ({
      astNode: NewConstantAstNode({ constant: enumValue }),
    })),
    ...MODELING_OPTIONS({ currentNode: params.node, t: params.t }),
  ].map(mapOption);
}

export function groupByOperandType(
  operandMenuOptions: EnrichedMenuOption[],
  context: Pick<EnrichingOperandContext, 'enumValues' | 'triggerObjectTable'>,
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
                return context.triggerObjectTable.name;
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

function createMapOption({
  enumValues,
  customLists,
  language,
  t,
  ...modelData
}: EnrichingOperandContext) {
  return function ({
    astNode,
    operandType,
    displayName,
    dataType,
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
      dataType: dataType ?? getAstNodeDataType(astNode, modelData),
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

export function applyEvaluation(currentEvaluation: NodeEvaluation, newEvaluation: NodeEvaluation) {
  if (!R.isDeepEqual(currentEvaluation.errors, newEvaluation.errors)) {
    currentEvaluation.errors = newEvaluation.errors;
  }
  if (currentEvaluation.children.length !== newEvaluation.children.length) {
    currentEvaluation.children = newEvaluation.children;
  } else {
    for (let i = 0; i < currentEvaluation.children.length; ++i) {
      applyEvaluation(currentEvaluation.children[i]!, newEvaluation.children[i]!);
    }
  }
  for (const namedChildKey in currentEvaluation.namedChildren) {
    const currentChild = currentEvaluation.namedChildren[namedChildKey];
    const newChild = newEvaluation.namedChildren[namedChildKey];

    if (currentChild === newChild) {
      return;
    }

    if ((!currentChild || !newChild) && currentChild !== newChild) {
      currentEvaluation.namedChildren[namedChildKey] = newEvaluation.namedChildren[namedChildKey]!;
      continue;
    }

    applyEvaluation(currentChild!, newChild!);
  }
}
