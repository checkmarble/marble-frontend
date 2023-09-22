import {
  type LabelledAst,
  NewAstNode,
  NewConstantAstNode,
} from '@app-builder/models';

import {
  coerceToConstantsLabelledAst,
  type CoerceToConstantsLabelledAstOptions,
} from './coerceToConstantsLabelledAst';

const options: CoerceToConstantsLabelledAstOptions = {
  booleans: {
    true: ['true', 'vrai'],
    false: ['false', 'faux'],
  },
};

describe('coerceToConstantsLabelledAst', () => {
  it('returns nothing given empty string', () => {
    expect(coerceToConstantsLabelledAst('', options)).toHaveLength(0);
    expect(coerceToConstantsLabelledAst(' ', options)).toHaveLength(0);
  });

  it('return a constant string given a random string', () => {
    const valueToCoerce = 'some string ';
    const expected: LabelledAst[] = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(coerceToConstantsLabelledAst(valueToCoerce, options)).toStrictEqual(
      expected
    );
  });

  it('returns two contants string and number given a string convertible to a numbers', () => {
    const valueToCoerce = '10';
    const expected: LabelledAst[] = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'Int' }),
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(coerceToConstantsLabelledAst(valueToCoerce, options)).toStrictEqual(
      expected
    );
  });

  it('returns constant true true and constant string given "True"', () => {
    const valueToCoerce = 'True';
    const expected: LabelledAst[] = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'Bool' }),
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(coerceToConstantsLabelledAst(valueToCoerce, options)).toStrictEqual(
      expected
    );
  });

  it('returns constant false and constant string given "FALSE"', () => {
    const valueToCoerce = 'FALSE';
    const expected: LabelledAst[] = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'Bool' }),
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(coerceToConstantsLabelledAst(valueToCoerce, options)).toStrictEqual(
      expected
    );
  });

  describe('return an array given a string convertible to an array', () => {
    it('String[]', () => {
      const valueToCoerce = '["fr" , 13  , null, sp ace]';
      const expected: LabelledAst[] = [
        helperConstantArrayOperandOption({
          constant: ['fr', '13', 'null', 'sp ace'],
          dataType: 'String[]',
        }),
        helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
      ];
      expect(
        coerceToConstantsLabelledAst(valueToCoerce, options)
      ).toStrictEqual(expected);
    });

    it('Int[]', () => {
      const valueToCoerce = '[23, 13  , 1233  ]';
      const expected: LabelledAst[] = [
        helperConstantArrayOperandOption({
          constant: [23, 13, 1233],
          dataType: 'Int[]',
        }),
        helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
      ];
      expect(
        coerceToConstantsLabelledAst(valueToCoerce, options)
      ).toStrictEqual(expected);
    });

    it('Float[]', () => {
      const valueToCoerce = '[23.25, 13  , 1233  ]';
      const expected: LabelledAst[] = [
        helperConstantArrayOperandOption({
          constant: [23.25, 13, 1233],
          dataType: 'Float[]',
        }),
        helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
      ];
      expect(
        coerceToConstantsLabelledAst(valueToCoerce, options)
      ).toStrictEqual(expected);
    });
  });
});

function helperConstantOperandOption({
  valueToCoerce,
  dataType,
}: {
  valueToCoerce: string;
  dataType: 'String' | 'Int' | 'Float' | 'Bool';
}): LabelledAst {
  switch (dataType) {
    case 'String':
      return {
        name: `"${valueToCoerce}"`,
        operandType: 'Constant',
        dataType: dataType,
        astNode: NewAstNode({
          constant: valueToCoerce,
        }),
      };
    case 'Int':
      return {
        name: valueToCoerce,
        operandType: 'Constant',
        dataType: dataType,
        astNode: NewAstNode({
          constant: parseInt(valueToCoerce),
        }),
      };
    case 'Float':
      return {
        name: valueToCoerce,
        operandType: 'Constant',
        dataType: dataType,
        astNode: NewAstNode({
          constant: parseFloat(valueToCoerce),
        }),
      };
    case 'Bool':
      return {
        name: valueToCoerce.toLowerCase(),
        operandType: 'Constant',
        dataType: dataType,
        astNode: NewAstNode({
          constant: valueToCoerce.toLowerCase() === 'true',
        }),
      };
  }
}

function helperConstantArrayOperandOption({
  constant,
  dataType,
}: {
  constant: (string | number | boolean)[];
  dataType: 'String[]' | 'Int[]' | 'Float[]';
}): LabelledAst {
  return {
    name: `[${constant
      .map((elem) => (typeof elem === 'string' ? `"${elem}"` : elem))
      .join(', ')}]`,
    operandType: 'Constant',
    dataType,
    astNode: NewConstantAstNode({
      constant,
    }),
  };
}
