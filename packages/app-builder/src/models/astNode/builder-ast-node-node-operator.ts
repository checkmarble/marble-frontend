import { undefinedAstNodeName } from './ast-node';

// define a subset of MainAstOperatorFunction with only binary operators
const binaryMainAstOperatorFunctions = [
  '=',
  '≠',
  '<',
  '<=',
  '>',
  '>=',
  '+',
  '-',
  '*',
  '/',
  'IsInList',
  'IsNotInList',
  'StringContains',
  'StringNotContain',
  'StringStartsWith',
  'StringEndsWith',
  'ContainsAnyOf',
  'ContainsNoneOf',
] as const;
export type BinaryMainAstOperatorFunction = (typeof binaryMainAstOperatorFunctions)[number];

export function isBinaryMainAstOperatorFunction(
  value: string,
): value is BinaryMainAstOperatorFunction {
  return (binaryMainAstOperatorFunctions as ReadonlyArray<string>).includes(value);
}

// define a subset of MainAstOperatorFunction with only unary operators
const unaryMainAstOperatorFunctions = ['IsEmpty', 'IsNotEmpty'] as const;
export type UnaryMainAstOperatorFunction = (typeof unaryMainAstOperatorFunctions)[number];

export function isUnaryMainAstOperatorFunction(
  value: string,
): value is UnaryMainAstOperatorFunction {
  return (unaryMainAstOperatorFunctions as ReadonlyArray<string>).includes(value);
}

// The order is important for sorting, it is the order in which the operators are displayed in the dropdown
export const allMainAstOperatorFunctions = [
  ...binaryMainAstOperatorFunctions,
  ...unaryMainAstOperatorFunctions,
] as const;

export function isMainAstOperatorFunction(value: string): value is MainAstOperatorFunction {
  return (
    value === undefinedAstNodeName ||
    isBinaryMainAstOperatorFunction(value) ||
    isUnaryMainAstOperatorFunction(value)
  );
}
export type MainAstOperatorFunction =
  | typeof undefinedAstNodeName
  | BinaryMainAstOperatorFunction
  | UnaryMainAstOperatorFunction;
