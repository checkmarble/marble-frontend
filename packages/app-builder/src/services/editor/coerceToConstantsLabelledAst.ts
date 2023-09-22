import {
  type LabelledAst,
  NewConstantAstNode,
  newConstantLabelledAst,
} from '@app-builder/models';
import * as R from 'remeda';

export interface CoerceToConstantsLabelledAstOptions {
  booleans: { true: string[]; false: string[] };
}

export function coerceToConstantsLabelledAst(
  search: string,
  options: CoerceToConstantsLabelledAstOptions
): LabelledAst[] {
  const { isCoerceableToBoolean, coerceToBoolean } = getBooleanCoercionLogic(
    options.booleans
  );
  const results: LabelledAst[] = [];

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
    results.push(newConstantLabelledAst(astNode));
  }

  if (isCoerceableToBoolean(searchLowerCase)) {
    const astNode = NewConstantAstNode({
      constant: coerceToBoolean(searchLowerCase),
    });
    results.push(newConstantLabelledAst(astNode));
  }

  results.push(...coerceToConstantArray(search));

  const astNode = NewConstantAstNode({
    constant: search,
  });
  results.push(newConstantLabelledAst(astNode));

  return results;
}

const isNumberArray = /^\[(\s*(\d+(.\d+)?)\s*,?)*(\s*|\])$/;
const isStringArray = /^\[(\s*"?(\w+)"?\s*,?)*(\s*|\])$/;

const captureNumbers = /(?:\s*(?<numbers>\d+(.\d+)?)\s*,?)/g;
const captureStrings = /(?:\s*"?(?<strings>\w(\w|\s)*\w)"?\s*,?)/g;

function coerceToConstantArray(search: string): LabelledAst[] {
  const trimSearch = search.trim();

  if (isNumberArray.test(trimSearch)) {
    const astNode = R.pipe(
      Array.from(trimSearch.matchAll(captureNumbers)),
      R.map((match) => match.groups?.['numbers']),
      R.filter(R.isDefined),
      R.map(Number),
      (constant) =>
        NewConstantAstNode({
          constant,
        })
    );
    return [newConstantLabelledAst(astNode)];
  }

  if (isStringArray.test(trimSearch)) {
    const astNode = R.pipe(
      Array.from(trimSearch.matchAll(captureStrings)),
      R.map((match) => match.groups?.['strings']),
      R.filter(R.isDefined),
      (constant) =>
        NewConstantAstNode({
          constant,
        })
    );
    return [newConstantLabelledAst(astNode)];
  }

  return [];
}

function getBooleanCoercionLogic(
  options: CoerceToConstantsLabelledAstOptions['booleans']
) {
  return {
    isCoerceableToBoolean: (search: string) => {
      const sanitizedSearch = search.trim().toLocaleLowerCase();
      return (
        options.true.includes(sanitizedSearch) ||
        options.false.includes(sanitizedSearch)
      );
    },
    coerceToBoolean: (search: string) => {
      const sanitizedSearch = search.trim().toLocaleLowerCase();
      return options.true.includes(sanitizedSearch);
    },
  };
}
