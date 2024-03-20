import { NewAstNode, NewConstantAstNode } from '@app-builder/models';

import {
  coerceToConstantEditableAstNode,
  type CoerceToConstantEditableAstNodeOptions,
} from './coerceToConstantEditableAstNode';

const options: CoerceToConstantEditableAstNodeOptions = {
  booleans: {
    true: ['true', 'vrai'],
    false: ['false', 'faux'],
  },
};

describe('coerceToConstantEditableAstNode', () => {
  it('returns nothing given empty string', () => {
    expect(coerceToConstantEditableAstNode('', options)).toHaveLength(0);
    expect(coerceToConstantEditableAstNode(' ', options)).toHaveLength(0);
  });

  it('return a constant string given a random string', () => {
    const valueToCoerce = 'some string ';
    const expected = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(
      coerceToConstantEditableAstNode(valueToCoerce, options),
    ).toMatchObject(expected);
  });

  it('returns two contants string and number given a string convertible to a numbers', () => {
    const valueToCoerce = '10';
    const expected = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'Int' }),
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(
      coerceToConstantEditableAstNode(valueToCoerce, options),
    ).toMatchObject(expected);
  });

  it('returns constant true true and constant string given "True"', () => {
    const valueToCoerce = 'True';
    const expected = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'Bool' }),
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(
      coerceToConstantEditableAstNode(valueToCoerce, options),
    ).toMatchObject(expected);
  });

  it('returns constant false and constant string given "FALSE"', () => {
    const valueToCoerce = 'FALSE';
    const expected = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'Bool' }),
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(
      coerceToConstantEditableAstNode(valueToCoerce, options),
    ).toMatchObject(expected);
  });

  describe('return an array given a string convertible to an array', () => {
    it('String[]', () => {
      const valueToCoerce = '["fr" , 13  , null, sp ace]';
      const expected = [
        helperConstantArrayOperandOption({
          constant: ['fr', '13', 'null', 'sp ace'],
          dataType: 'String[]',
        }),
        helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
      ];
      expect(
        coerceToConstantEditableAstNode(valueToCoerce, options),
      ).toMatchObject(expected);
    });

    it('Int[]', () => {
      const valueToCoerce = '[23, 13  , 1233  ]';
      const expected = [
        helperConstantArrayOperandOption({
          constant: [23, 13, 1233],
          dataType: 'Int[]',
        }),
        helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
      ];
      expect(
        coerceToConstantEditableAstNode(valueToCoerce, options),
      ).toMatchObject(expected);
    });

    it('Float[]', () => {
      const valueToCoerce = '[23.25, 13  , 1233  ]';
      const expected = [
        helperConstantArrayOperandOption({
          constant: [23.25, 13, 1233],
          dataType: 'Float[]',
        }),
        helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
      ];
      expect(
        coerceToConstantEditableAstNode(valueToCoerce, options),
      ).toMatchObject(expected);
    });
  });
});

function helperConstantOperandOption({
  valueToCoerce,
  dataType,
}: {
  valueToCoerce: string;
  dataType: 'String' | 'Int' | 'Float' | 'Bool';
}) {
  switch (dataType) {
    case 'String':
      return {
        displayName: `"${valueToCoerce}"`,
        operandType: 'Constant',
        dataType: dataType,
        astNode: NewAstNode({
          constant: valueToCoerce,
        }),
      };
    case 'Int':
      return {
        displayName: valueToCoerce,
        operandType: 'Constant',
        dataType: dataType,
        astNode: NewAstNode({
          constant: parseInt(valueToCoerce),
        }),
      };
    case 'Float':
      return {
        displayName: valueToCoerce,
        operandType: 'Constant',
        dataType: dataType,
        astNode: NewAstNode({
          constant: parseFloat(valueToCoerce),
        }),
      };
    case 'Bool':
      return {
        displayName: valueToCoerce.toLowerCase(),
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
}) {
  return {
    displayName: `[${constant
      .map((elem) => (typeof elem === 'string' ? `"${elem}"` : elem))
      .join(', ')}]`,
    operandType: 'Constant',
    dataType,
    astNode: NewConstantAstNode({
      constant,
    }),
  };
}