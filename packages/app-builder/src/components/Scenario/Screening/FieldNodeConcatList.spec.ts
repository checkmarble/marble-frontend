import { NewUndefinedAstNode } from '@app-builder/models';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { NewStringConcatAstNode } from '@app-builder/models/astNode/strings';
import { describe, expect, it } from 'vitest';

import { listFromConcats, sameConcatContents } from './FieldNodeConcatList';

describe('listFromConcats', () => {
  it('preserves concat groups and removes placeholder operands', () => {
    const first = NewConstantAstNode({ constant: 'first' });
    const second = NewConstantAstNode({ constant: 'second' });
    const concat = NewStringConcatAstNode([first, NewUndefinedAstNode(), second], { withSeparator: true });

    const list = listFromConcats([concat, NewStringConcatAstNode([NewUndefinedAstNode()])]);

    expect(list?.children).toHaveLength(1);
    expect(list?.children[0]?.id).toBe(concat.id);
    expect(list?.children[0]?.children).toEqual([first, second]);
  });

  it('returns null when every concat is empty', () => {
    expect(listFromConcats([NewStringConcatAstNode([NewUndefinedAstNode()])])).toBeNull();
  });

  it('returns null when every row has been removed', () => {
    expect(listFromConcats([])).toBeNull();
  });

  it('detects operand changes when IDs are preserved', () => {
    const operand = NewConstantAstNode({ constant: 'first' });
    const concat = NewStringConcatAstNode([operand], { withSeparator: true });
    const updatedConcat = {
      ...concat,
      children: [{ ...operand, constant: 'updated' }],
    };

    expect(sameConcatContents([concat], [updatedConcat])).toBe(false);
  });

  it('considers unchanged AST content equal', () => {
    const operand = NewConstantAstNode({ constant: 'first' });
    const concat = NewStringConcatAstNode([operand], { withSeparator: true });

    expect(sameConcatContents([concat], [{ ...concat, children: [{ ...operand }] }])).toBe(true);
  });

  it('returns false instead of throwing when a nested operand is missing', () => {
    const operand = NewConstantAstNode({ constant: 'first' });
    const concat = NewStringConcatAstNode([operand], { withSeparator: true });
    const incompleteConcat = { ...concat, children: [undefined] } as unknown as typeof concat;

    expect(sameConcatContents([concat], [incompleteConcat])).toBe(false);
  });
});
