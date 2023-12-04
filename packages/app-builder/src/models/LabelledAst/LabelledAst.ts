import { type CustomList } from 'marble-api';

import {
  type AstNode,
  isAggregation,
  isConstant,
  isCustomListAccess,
  isDatabaseAccess,
  isPayload,
  isTimeAdd,
  isTimeNow,
  isUndefinedAstNode,
} from '../ast-node';
import { type DataType, type EnumValue, type TableModel } from '../data-model';
import {
  type EditorIdentifiersByType,
  getIdentifiersFromAstNode,
} from '../identifier';
import { newAggregatorLabelledAst } from './Aggregator';
import { newConstantLabelledAst, newEnumConstantLabelledAst } from './Constant';
import { newCustomListLabelledAst } from './CustomList';
import { newDatabaseAccessorsLabelledAst } from './DatabaseAccessors';
import { getAstNodeDisplayName } from './getAstNodeDisplayName';
import { newPayloadAccessorsLabelledAst } from './PayloadAccessor';
import { newTimeAddLabelledAst } from './TimeAdd';
import { newTimeNowLabelledAst } from './TimeNow';
import { newUndefinedLabelledAst } from './Undefined';

//TODO(combobox): find a better naming
export interface LabelledAst {
  name: string;
  description?: string;
  operandType:
    | 'Constant'
    | 'CustomList'
    | 'Enum'
    | 'Field'
    | 'Function'
    | 'Undefined'
    | 'unknown';
  dataType: DataType;
  astNode: AstNode;
  values?: EnumValue[];
}

export function adaptLabelledAst(
  node: AstNode,
  {
    triggerObjectTable,
    dataModel,
    customLists,
    enumOptions,
  }: {
    triggerObjectTable: TableModel;
    dataModel: TableModel[];
    customLists: CustomList[];
    enumOptions: EnumValue[];
  },
): LabelledAst | null {
  if (isConstant(node)) {
    if (
      typeof node.constant === 'string' &&
      enumOptions.includes(node.constant)
    ) {
      return newEnumConstantLabelledAst(node);
    }
    return newConstantLabelledAst(node);
  }

  if (isCustomListAccess(node)) {
    const customList = customLists.find(
      (customList) =>
        customList.id === node.namedChildren.customListId.constant,
    );
    if (customList) return newCustomListLabelledAst(customList);
  }

  if (isDatabaseAccess(node)) {
    return newDatabaseAccessorsLabelledAst({
      node,
      dataModel,
    });
  }

  if (isPayload(node)) {
    return newPayloadAccessorsLabelledAst({
      triggerObjectTable,
      node,
    });
  }

  if (isAggregation(node)) {
    return newAggregatorLabelledAst(node);
  }

  if (isTimeAdd(node)) {
    return newTimeAddLabelledAst(node);
  }

  if (isTimeNow(node)) {
    return newTimeNowLabelledAst(node);
  }

  if (isUndefinedAstNode(node)) {
    return newUndefinedLabelledAst();
  }

  return null;
}

/**
 * @deprecated Only used in Scenario/Formula/*
 */
export function adaptLabelledAstFromAllIdentifiers(
  astNode: AstNode,
  identifiers: EditorIdentifiersByType,
): LabelledAst {
  const identifier = getIdentifiersFromAstNode(astNode, identifiers);
  if (identifier) {
    return adaptLabelledAstFromIdentifier(identifier);
  }
  return {
    name: getAstNodeDisplayName(astNode),
    dataType: 'unknown',
    operandType: 'unknown',
    astNode,
  };
}

/**
 * @deprecated Only used adaptLabelledAstFromAllIdentifiers
 */
function adaptLabelledAstFromIdentifier(identifier: AstNode): LabelledAst {
  return {
    name: getAstNodeDisplayName(identifier),
    dataType: 'unknown',
    operandType: 'unknown',
    astNode: identifier,
  };
}
