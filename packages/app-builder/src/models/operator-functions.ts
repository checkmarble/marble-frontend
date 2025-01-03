import {
  isMainAstOperatorFunction,
  type MainAstOperatorFunction,
} from './astNode/builder-ast-node-node-operator';
import type { ValidTimestampExtractParts } from './astNode/time';
import {
  type AggregationFilterOperator,
  type AggregatorOperator,
  isAggregationFilterOperator,
  isAggregatorOperator,
  isTimeAddOperator,
  isTimestampPart,
  type TimeAddOperator,
} from './modale-operators';

export type OperatorFunction =
  | MainAstOperatorFunction
  | AggregationFilterOperator
  | TimeAddOperator
  | ValidTimestampExtractParts
  | AggregatorOperator;

export function isOperatorFunction(value: string): value is OperatorFunction {
  return (
    isMainAstOperatorFunction(value) ||
    isAggregationFilterOperator(value) ||
    isTimeAddOperator(value) ||
    isAggregatorOperator(value) ||
    isTimestampPart(value)
  );
}
