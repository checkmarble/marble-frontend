import { vi } from 'vitest';

import { type EditorNodeViewModel } from './ast-editor';
import { findAndReplaceNode } from './FindAndReplaceNode';

describe('findAndReplaceNode', () => {
  const rootNode = helperMakeEditorViewModel('root');
  const first_child = helperMakeEditorViewModel('first_child', rootNode);
  const second_child = helperMakeEditorViewModel('second_child', rootNode);
  rootNode.children = [first_child, second_child];

  const newNode = helperMakeEditorViewModel('newNode', rootNode);

  it('replace the node with the given id', () => {
    const callback = vi.fn(() => newNode);

    const result = findAndReplaceNode('first_child', callback, rootNode);

    expect(callback).toHaveBeenCalledTimes(1);

    expect(result).toStrictEqual({
      ...rootNode,
      children: [newNode, second_child],
    });
  });

  it('remove the node with the given id when callback return null', () => {
    // const callback = jest.fn(() => newNode);
    const result = findAndReplaceNode('second_child', () => null, rootNode);

    expect(result).toStrictEqual({
      ...rootNode,
      children: [first_child],
    });
  });
});

function helperMakeEditorViewModel(
  nodeId: string,
  parent?: EditorNodeViewModel
): EditorNodeViewModel {
  return {
    nodeId,
    funcName: 'funcName',
    validation: { errors: [] },
    children: [],
    parent: parent || null,
    namedChildren: {},
  };
}
