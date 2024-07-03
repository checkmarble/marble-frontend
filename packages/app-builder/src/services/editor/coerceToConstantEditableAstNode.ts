import { NewConstantAstNode } from '@app-builder/models';
import { ConstantEditableAstNode } from '@app-builder/models/editable-ast-node';
import { type TFunction } from 'i18next';
import * as R from 'remeda';

export interface CoerceToConstantEditableAstNodeOptions {
  booleans: { true: string[]; false: string[] };
}

export function coerceToConstantEditableAstNode(
  t: TFunction<['common']>,
  search: string,
  options: CoerceToConstantEditableAstNodeOptions,
): ConstantEditableAstNode[] {
  const { isCoerceableToBoolean, coerceToBoolean } = getBooleanCoercionLogic(
    options.booleans,
  );
  const results: ConstantEditableAstNode[] = [];

  const searchLowerCase = search.trim().toLocaleLowerCase();
  if (searchLowerCase.length === 0) {
    return [];
  }

  // Note: Number('') === 0
  const parsedNumber = Number(searchLowerCase);
  if (Number.isFinite(parsedNumber)) {
    const astNode = NewConstantAstNode({
      constant: parsedNumber,
    });
    results.push(new ConstantEditableAstNode(t, astNode, []));
  }

  if (isCoerceableToBoolean(searchLowerCase)) {
    const astNode = NewConstantAstNode({
      constant: coerceToBoolean(searchLowerCase),
    });
    results.push(new ConstantEditableAstNode(t, astNode, []));
  }

  results.push(...coerceToConstantArray(t, search));

  const astNode = NewConstantAstNode({
    constant: search,
  });
  results.push(new ConstantEditableAstNode(t, astNode, []));

  return results;
}

const isNumberArray = /^\[(\s*(\d+(\.\d+)?)\s*,?)*(\s*|\])$/;
const isStringArray = /^\[(\s*"?(\w+)"?\s*,?)*(\s*|\])$/;

const captureNumbers = /(?:\s*(?<numbers>\d+(\.\d+)?)\s*,?)/g;
const captureStrings = /(?:\s*"?(?<strings>(\w|\s)*\w)"?\s*,?)/g;

function coerceToConstantArray(
  t: TFunction<['common']>,
  search: string,
): ConstantEditableAstNode[] {
  const trimSearch = search.trim();

  if (isNumberArray.test(trimSearch)) {
    const astNode = R.pipe(
      Array.from(trimSearch.matchAll(captureNumbers)),
      R.map((match) => match.groups?.['numbers']),
      R.filter(R.isNonNullish),
      R.map(Number),
      (constant) =>
        NewConstantAstNode({
          constant,
        }),
    );
    return [new ConstantEditableAstNode(t, astNode, [])];
  }

  if (isStringArray.test(trimSearch)) {
    const astNode = R.pipe(
      Array.from(trimSearch.matchAll(captureStrings)),
      R.map((match) => match.groups?.['strings']),
      R.filter(R.isNonNullish),
      (constant) =>
        NewConstantAstNode({
          constant,
        }),
    );
    return [new ConstantEditableAstNode(t, astNode, [])];
  }

  return [];
}

function getBooleanCoercionLogic(
  options: CoerceToConstantEditableAstNodeOptions['booleans'],
) {
  const sanitizedOptions = {
    true: options.true.map((value) => value.trim().toLocaleLowerCase()),
    false: options.false.map((value) => value.trim().toLocaleLowerCase()),
  };
  return {
    isCoerceableToBoolean: (search: string) => {
      const sanitizedSearch = search.trim().toLocaleLowerCase();
      return (
        sanitizedOptions.true.includes(sanitizedSearch) ||
        sanitizedOptions.false.includes(sanitizedSearch)
      );
    },
    coerceToBoolean: (search: string) => {
      const sanitizedSearch = search.trim().toLocaleLowerCase();
      return sanitizedOptions.true.includes(sanitizedSearch);
    },
  };
}
