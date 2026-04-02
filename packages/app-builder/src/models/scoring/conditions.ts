import { type DataModel } from '..';
import { type AggregationAstNode, isAggregation } from '../astNode/aggregation';
import { isConstant } from '../astNode/constant';
import { type SwitchAstNode } from '../astNode/control-flow';
import { isPayload } from '../astNode/data-accessor';

const allowedRuleSourceTypes = ['Bool', 'Int', 'Float', 'String'] as const;

export type AllowedScoringRuleSourceType = (typeof allowedRuleSourceTypes)[number];

export function isAllowedScoringRuleType(type: string | null): type is AllowedScoringRuleSourceType {
  return allowedRuleSourceTypes.includes(type as AllowedScoringRuleSourceType);
}

export function getAggregationReturnType(
  aggregationNode: AggregationAstNode,
  dataModel: DataModel,
): AllowedScoringRuleSourceType | 'Undefined' | null {
  const aggregator = aggregationNode.namedChildren.aggregator.constant;

  if (aggregator === 'COUNT' || aggregator === 'COUNT_DISTINCT') return 'Int';

  const tableName = aggregationNode.namedChildren.tableName.constant;
  const fieldName = aggregationNode.namedChildren.fieldName.constant;
  if (!tableName || !fieldName) return 'Undefined';

  const field = dataModel.find((t) => t.name === tableName)?.fields.find((f) => f.name === fieldName);
  if (!field) return 'Undefined';

  if (aggregator === 'SUM' || aggregator === 'AVG' || aggregator === 'PCTILE') {
    return field.dataType === 'Int' ? 'Int' : 'Float';
  }
  if (aggregator === 'MIN' || aggregator === 'MAX') {
    return isAllowedScoringRuleType(field.dataType) ? field.dataType : null;
  }
  return null;
}

export function getOperationType(
  entityType: string,
  dataModel: DataModel,
  node: SwitchAstNode,
): AllowedScoringRuleSourceType | 'Undefined' | null {
  const entityTable = dataModel.find((table) => table.name === entityType);
  if (!entityTable || !node.namedChildren.type || !isConstant(node.namedChildren.type)) {
    return null;
  }

  switch (node.namedChildren.type.constant) {
    case 'user_attribute': {
      const astField = node.namedChildren.field;
      if (!astField || !isPayload(astField)) {
        return 'Undefined';
      }
      const field = entityTable.fields.find((f) => f.name === astField.children[0].constant);
      if (!field || !isAllowedScoringRuleType(field.dataType)) {
        return null;
      }
      return field.dataType;
    }
    case 'aggregate': {
      const astField = node.namedChildren.field;
      if (!astField || !isAggregation(astField)) return 'Undefined';
      return getAggregationReturnType(astField, dataModel ?? []);
    }
    default:
      return null;
  }
}

export type ScoreImpact = {
  modifier: number;
  floor?: number;
};

export type NumberSwitch = {
  type: 'number';
  branches: {
    value: number;
    impact: ScoreImpact;
  }[];
  default: ScoreImpact;
};

export type StringSingleValueOp =
  | '='
  | '≠'
  | 'StringContains'
  | 'StringNotContain'
  | 'StringStartsWith'
  | 'StringEndsWith';

export type StringListOp = 'IsInList' | 'IsNotInList';

export type StringListValue = { type: 'customList'; listId: string } | { type: 'stringList'; values: string[] };

export type StringOperation = { op: StringSingleValueOp; value: string } | { op: StringListOp; value: StringListValue };

export type StringSwitch = {
  type: 'string';
  branches: {
    value: StringOperation;
    impact: ScoreImpact;
  }[];
  default: ScoreImpact;
};

export type BoolSwitch = {
  type: 'bool';
  ifTrue: ScoreImpact;
  ifFalse: ScoreImpact;
};

export type TagsSwitch = {
  type: 'tags';
  branches: {
    value: string[];
    impact: ScoreImpact;
  }[];
  default: ScoreImpact;
};
