import { vi } from 'vitest';

import { findAndReplaceNode, type Tree } from './tree';

describe('findAndReplaceNode', () => {
  const rootNode = helperMakeTree('root');
  const first_child = helperMakeTree('first_child', rootNode);
  const second_child = helperMakeTree('second_child', rootNode);
  rootNode.children = [first_child, second_child];

  it('replace the node with the given id', () => {
    const newNode = helperMakeTree('newNode');
    const callback = vi.fn(() => newNode);

    const result = findAndReplaceNode('first_child', callback, rootNode);

    expect(callback).toHaveBeenCalledTimes(1);

    expect(result).toStrictEqual({
      ...rootNode,
      children: [newNode, second_child],
    });
  });

  it('remove the node with the given id when callback return null', () => {
    const callback = vi.fn(() => null);
    const result = findAndReplaceNode('second_child', callback, rootNode);

    expect(callback).toHaveBeenCalledTimes(1);

    expect(result).toStrictEqual({
      ...rootNode,
      children: [first_child],
    });
  });
});

function helperMakeTree(nodeId: string, parent?: Tree<unknown>): Tree<unknown> {
  return {
    nodeId,
    children: [],
    parent: parent || null,
    namedChildren: {},
  };
}
