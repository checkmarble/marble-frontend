import { NewAstNode, stripIdFromNode } from '@app-builder/models';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';

import { describe, expect, it } from 'vitest';

import {
  type CoerceToConstantAstNodeOptions,
  coerceToConstantAstNode,
} from './coerceToConstantAstNode';

const options: CoerceToConstantAstNodeOptions = {
  booleans: {
    true: ['true', 'vrai'],
    false: ['false', 'faux'],
  },
};

describe('coerceToConstantAstNode', () => {
  it('returns nothing given empty string', () => {
    expect(coerceToConstantAstNode('', options)).toHaveLength(0);
    expect(coerceToConstantAstNode(' ', options)).toHaveLength(0);
  });

  it('return a constant string given a random string', () => {
    const valueToCoerce = 'some string ';
    const expected = [helperConstantOperandOption({ valueToCoerce, dataType: 'String' })];
    expect(coerceToConstantAstNode(valueToCoerce, options)).toMatchObject(expected);
  });

  it('returns two contants string and number given a string convertible to a numbers', () => {
    const valueToCoerce = '10';
    const expected = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'Int' }),
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(coerceToConstantAstNode(valueToCoerce, options)).toMatchObject(expected);
  });

  it('returns constant true true and constant string given "True"', () => {
    const valueToCoerce = 'True';
    const expected = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'Bool' }),
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(coerceToConstantAstNode(valueToCoerce, options)).toMatchObject(expected);
  });

  it('returns constant false and constant string given "FALSE"', () => {
    const valueToCoerce = 'FALSE';
    const expected = [
      helperConstantOperandOption({ valueToCoerce, dataType: 'Bool' }),
      helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
    ];
    expect(coerceToConstantAstNode(valueToCoerce, options)).toMatchObject(expected);
  });

  describe('return an array given a string convertible to an array', () => {
    it('String[]', () => {
      const valueToCoerce = '[a, "fr" , 13  , null, sp ace]';
      const expected = [
        helperConstantArrayOperandOption({
          constant: ['a', 'fr', '13', 'null', 'sp ace'],
        }),
        helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
      ];
      expect(coerceToConstantAstNode(valueToCoerce, options)).toMatchObject(expected);
    });

    it('Int[]', () => {
      const valueToCoerce = '[1, 23, 13  , 1233  ]';
      const expected = [
        helperConstantArrayOperandOption({
          constant: [1, 23, 13, 1233],
        }),
        helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
      ];
      expect(coerceToConstantAstNode(valueToCoerce, options)).toMatchObject(expected);
    });

    it('Float[]', () => {
      const valueToCoerce = '[23.25, 13  , 1233  ]';
      const expected = [
        helperConstantArrayOperandOption({
          constant: [23.25, 13, 1233],
        }),
        helperConstantOperandOption({ valueToCoerce, dataType: 'String' }),
      ];
      expect(coerceToConstantAstNode(valueToCoerce, options)).toMatchObject(expected);
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
      return stripIdFromNode(
        NewAstNode({
          constant: valueToCoerce,
        }),
      );
    case 'Int':
      return stripIdFromNode(
        NewAstNode({
          constant: parseInt(valueToCoerce),
        }),
      );
    case 'Float':
      return stripIdFromNode(
        NewAstNode({
          constant: parseFloat(valueToCoerce),
        }),
      );
    case 'Bool': {
      const constant = valueToCoerce.toLowerCase() === 'true';
      return stripIdFromNode(
        NewAstNode({
          constant,
        }),
      );
    }
  }
}

function helperConstantArrayOperandOption({
  constant,
}: {
  constant: (string | number | boolean)[];
}) {
  return stripIdFromNode(
    NewConstantAstNode({
      constant,
    }),
  );
}
