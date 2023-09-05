import { vi } from 'vitest';

import { type EditorNodeViewModel } from './ast-editor';
import { findAndReplaceNode } from './FindAndReplaceNode';

describe('findAndReplaceNode', () => {
  const first_child = helperMakeEditorViewModel('first_child');
  const second_child = helperMakeEditorViewModel('second_child');
  const rootNode = helperMakeEditorViewModel('root', [
    first_child,
    second_child,
  ]);

  const newNode = helperMakeEditorViewModel('newNode');

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
  children?: EditorNodeViewModel[]
): EditorNodeViewModel {
  return {
    nodeId,
    funcName: 'funcName',
    validation: { state: 'valid' },
    children: children ?? [],
    namedChildren: {},
  };
}
