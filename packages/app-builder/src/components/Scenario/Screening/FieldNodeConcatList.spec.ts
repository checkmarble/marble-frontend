import { NewUndefinedAstNode } from '@app-builder/models';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { NewStringConcatAstNode } from '@app-builder/models/astNode/strings';
import { describe, expect, it } from 'vitest';

import { listFromConcats } from './FieldNodeConcatList';

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
});
