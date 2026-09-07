import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { describe, expect, it } from 'vitest';

import { isListAstNode, NewListAstNode } from './list';

describe('ListAstNode', () => {
  it('wraps operands in a List node', () => {
    const child = NewConstantAstNode({ constant: 'FR' });
    const node = NewListAstNode([child]);

    expect(node).toMatchObject({
      name: 'List',
      children: [child],
      namedChildren: {},
    });
    expect(isListAstNode(node)).toBe(true);
  });
});
