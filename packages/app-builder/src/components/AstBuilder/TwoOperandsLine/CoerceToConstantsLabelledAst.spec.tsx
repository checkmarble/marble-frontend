import { type LabelledAst, NewAstNode } from '@app-builder/models';

import { coerceToConstantsLabelledAst } from './CoerceToConstantsLabelledAst';

describe('coerceToConstantsLabelledAst', () => {
  it('returns nothing given empty string', () => {
    expect(coerceToConstantsLabelledAst('')).toHaveLength(0);
    expect(coerceToConstantsLabelledAst(' ')).toHaveLength(0);
  });

  it('return a constant string given a random string', () => {
    const expected: LabelledAst[] = [helperLabelledString('some string ')];
    expect(coerceToConstantsLabelledAst('some string ')).toStrictEqual(
      expected
    );
  });

  it('returns two contants string and number given a string convertible to a numbers', () => {
    const expected: LabelledAst[] = [
      {
        label: '10',
        tooltip: '(number)',
        astNode: NewAstNode({
          constant: 10,
        }),
      },
      helperLabelledString('10'),
    ];
    expect(coerceToConstantsLabelledAst('10')).toStrictEqual(expected);
  });

  it('returns constant true true and constant string given "True"', () => {
    const expected: LabelledAst[] = [
      {
        label: 'true',
        tooltip: '(boolean)',
        astNode: NewAstNode({
          constant: true,
        }),
      },
      helperLabelledString('True'),
    ];
    expect(coerceToConstantsLabelledAst('True')).toStrictEqual(expected);
  });

  it('returns constant false and constant string given "FALSE"', () => {
    const expected: LabelledAst[] = [
      {
        label: 'false',
        tooltip: '(boolean)',
        astNode: NewAstNode({
          constant: false,
        }),
      },
      helperLabelledString('FALSE'),
    ];
    expect(coerceToConstantsLabelledAst('FALSE')).toStrictEqual(expected);
  });

  it('return an array given a string convertible to an array', () => {
    const expected: LabelledAst[] = [
      {
        label: '["fr", 13, null]',
        tooltip: '(array)',
        astNode: NewAstNode({
          constant: ['fr', 13, null],
        }),
      },
      helperLabelledString('["fr", 13, null]'),
    ];
    expect(coerceToConstantsLabelledAst('["fr", 13, null]')).toStrictEqual(
      expected
    );
  });
});

function helperLabelledString(label: string): LabelledAst {
  return {
    label: `"${label}"`,
    tooltip: '(string)',
    astNode: NewAstNode({
      constant: label,
    }),
  };
}
