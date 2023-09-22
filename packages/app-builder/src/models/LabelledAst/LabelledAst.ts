import { type CustomList } from '@marble-api';

import {
  type AstNode,
  isAggregation,
  isConstant,
  isCustomListAccess,
  isDatabaseAccess,
  isPayload,
  isUndefinedAstNode,
} from '../ast-node';
import { type DataModel, type DataType } from '../data-model';
import {
  type EditorIdentifiersByType,
  getIdentifiersFromAstNode,
} from '../identifier';
import { newAggregatorLabelledAst } from './Aggregator';
import { newConstantLabelledAst } from './Constant';
import { newCustomListLabelledAst } from './CustomList';
import { newDatabaseAccessorsLabelledAst } from './DatabaseAccessors';
import { getAstNodeDisplayName } from './getAstNodeDisplayName';
import { newPayloadAccessorsLabelledAst } from './PayloadAccessor';
import { newUndefinedLabelledAst } from './Undefined';

//TODO(combobox): find a better naming
export interface LabelledAst {
  name: string;
  description?: string;
  operandType?: string;
  dataType: DataType;
  astNode: AstNode;
}

export function adaptLabelledAst(
  node: AstNode,
  {
    triggerObjectType,
    dataModel,
    customLists,
  }: {
    triggerObjectType: DataModel;
    dataModel: DataModel[];
    customLists: CustomList[];
  }
): LabelledAst | null {
  if (isConstant(node)) {
    return newConstantLabelledAst(node);
  }

  if (isCustomListAccess(node)) {
    const customList = customLists.find(
      (customList) => customList.id === node.namedChildren.customListId.constant
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
      triggerObjectType,
      node,
    });
  }

  if (isAggregation(node)) {
    return newAggregatorLabelledAst(node);
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
  identifiers: EditorIdentifiersByType
): LabelledAst {
  const identifier = getIdentifiersFromAstNode(astNode, identifiers);
  if (identifier) {
    return adaptLabelledAstFromIdentifier(identifier);
  }
  return {
    name: getAstNodeDisplayName(astNode),
    dataType: 'unknown',
    operandType: '',
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
    operandType: '',
    astNode: identifier,
  };
}
