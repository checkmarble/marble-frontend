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
export type BinaryMainAstOperatorFunction =
  (typeof binaryMainAstOperatorFunctions)[number];

export function isBinaryMainAstOperatorFunction(
  value: string,
): value is BinaryMainAstOperatorFunction {
  return (binaryMainAstOperatorFunctions as ReadonlyArray<string>).includes(
    value,
  );
}

// order is important for sorting
const orderedMainAstOperatorFunctions = [
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
  'IsEmpty',
  'IsNotEmpty',
  undefinedAstNodeName,
] as const;
// define a subset of MainAstOperatorFunction with only unary operators
const unaryMainAstOperatorFunctions = ['IsEmpty', 'IsNotEmpty'] as const;
export type UnaryMainAstOperatorFunction =
  (typeof unaryMainAstOperatorFunctions)[number];

export function isUnaryMainAstOperatorFunction(
  value: string,
): value is UnaryMainAstOperatorFunction {
  return (unaryMainAstOperatorFunctions as ReadonlyArray<string>).includes(
    value,
  );
}

export function isMainAstOperatorFunction(
  value: string,
): value is MainAstOperatorFunction {
  return (
    isBinaryMainAstOperatorFunction(value) ||
    isUnaryMainAstOperatorFunction(value)
  );
}
export type MainAstOperatorFunction =
  | BinaryMainAstOperatorFunction
  | UnaryMainAstOperatorFunction;

export function sortMainAstOperatorFunctions(
  lhs: MainAstOperatorFunction,
  rhs: MainAstOperatorFunction,
) {
  const lhsIndex = orderedMainAstOperatorFunctions.indexOf(lhs);
  const rhsIndex = orderedMainAstOperatorFunctions.indexOf(rhs);
  return lhsIndex - rhsIndex;
}
