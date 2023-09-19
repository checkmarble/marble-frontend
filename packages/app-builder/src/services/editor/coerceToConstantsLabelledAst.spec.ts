import { type LabelledAst, NewAstNode } from '@app-builder/models';

import { coerceToConstantsLabelledAst } from './coerceToConstantsLabelledAst';

describe('coerceToConstantsLabelledAst', () => {
  it('returns nothing given empty string', () => {
    expect(coerceToConstantsLabelledAst('')).toHaveLength(0);
    expect(coerceToConstantsLabelledAst(' ')).toHaveLength(0);
  });

  it('return a constant string given a random string', () => {
    const valueToCoerce = 'some string ';
    const expected: LabelledAst[] = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(coerceToConstantsLabelledAst(valueToCoerce)).toStrictEqual(expected);
  });

  it('returns two contants string and number given a string convertible to a numbers', () => {
    const valueToCoerce = '10';
    const expected: LabelledAst[] = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'Int' }),
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(coerceToConstantsLabelledAst(valueToCoerce)).toStrictEqual(expected);
  });

  it('returns constant true true and constant string given "True"', () => {
    const valueToCoerce = 'True';
    const expected: LabelledAst[] = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'Bool' }),
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(coerceToConstantsLabelledAst(valueToCoerce)).toStrictEqual(expected);
  });

  it('returns constant false and constant string given "FALSE"', () => {
    const valueToCoerce = 'FALSE';
    const expected: LabelledAst[] = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'Bool' }),
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(coerceToConstantsLabelledAst(valueToCoerce)).toStrictEqual(expected);
  });

  it('return an array given a string convertible to an array', () => {
    const valueToCoerce = '["fr", 13, null]';
    const expected: LabelledAst[] = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'Array' }),
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(coerceToConstantsLabelledAst(valueToCoerce)).toStrictEqual(expected);
  });
});

function helperConstantOperandOption({
  valueToCoerce,
  dataType,
}: {
  valueToCoerce: string;
  dataType: 'String' | 'Int' | 'Float' | 'Bool' | 'Array';
}): LabelledAst {
  switch (dataType) {
    case 'String':
      return {
        name: `"${valueToCoerce}"`,
        description: '',
        operandType: 'Constant',
        dataType: dataType,
        astNode: NewAstNode({
          constant: valueToCoerce,
        }),
      };
    case 'Int':
      return {
        name: valueToCoerce,
        description: '',
        operandType: 'Constant',
        dataType: dataType,
        astNode: NewAstNode({
          constant: parseInt(valueToCoerce),
        }),
      };
    case 'Float':
      return {
        name: valueToCoerce,
        description: '',
        operandType: 'Constant',
        dataType: dataType,
        astNode: NewAstNode({
          constant: parseFloat(valueToCoerce),
        }),
      };
    case 'Bool':
      return {
        name: valueToCoerce.toLowerCase(),
        description: '',
        operandType: 'Constant',
        dataType: dataType,
        astNode: NewAstNode({
          constant: valueToCoerce.toLowerCase() === 'true',
        }),
      };
    case 'Array':
      return {
        name: valueToCoerce,
        description: '',
        operandType: 'Constant',
        dataType: 'unknown',
        astNode: NewAstNode({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          constant: JSON.parse(valueToCoerce),
        }),
      };
  }
}
