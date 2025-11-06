import { type AggregationFilterOperator, isAggregationFilterOperator } from './astNode/aggregation';
import type { undefinedAstNodeName } from './astNode/ast-node';
import { isMainAstOperatorFunction, type MainAstOperatorFunction } from './astNode/builder-ast-node-node-operator';
import type { ValidTimestampExtractParts } from './astNode/time';
import {
  type AggregatorOperator,
  isAggregatorOperator,
  isTimeAddOperator,
  isTimestampPart,
  type TimeAddOperator,
} from './modale-operators';

// This defines all the options that can be used in the operator dropdown. They include both actual AST node identifiers (in the main builder body),
// and options that are used as constant values in child nodes for complex nodes in the modales (e.g. filter, aggregator names for the aggregation node & modale).
export type OperatorOption =
  | typeof undefinedAstNodeName
  | MainAstOperatorFunction
  | AggregationFilterOperator
  | TimeAddOperator
  | ValidTimestampExtractParts
  | AggregatorOperator;

export function isOperatorOption(value: string): value is OperatorOption {
  return (
    value == 'Undefined' ||
    isMainAstOperatorFunction(value) ||
    isAggregationFilterOperator(value) ||
    isTimeAddOperator(value) ||
    isAggregatorOperator(value) ||
    isTimestampPart(value)
  );
}
