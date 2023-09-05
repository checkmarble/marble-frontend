import * as R from 'remeda';

import type { EditorNodeViewModel } from './ast-editor';

// Find the node `nodeIdToReplace` by walking the tree bottom-up
// When found, apply `fn` to the node and replace the node with the result
// If fn return null, the node is removed.
export function findAndReplaceNode(
  nodeIdToReplace: string,
  fn: (node: EditorNodeViewModel) => EditorNodeViewModel | null,
  node: EditorNodeViewModel
): EditorNodeViewModel | null {
  if (node.nodeId === nodeIdToReplace) {
    return fn(node);
  }

  const children = R.pipe(
    node.children,
    R.map((child) => findAndReplaceNode(nodeIdToReplace, fn, child)),
    R.compact
  );

  const namedChildren = R.pipe(
    R.toPairs(node.namedChildren),
    R.map(([key, child]) => {
      const newChild = findAndReplaceNode(nodeIdToReplace, fn, child);
      return newChild === null ? null : ([key, newChild] as const);
    }),
    R.compact,
    (pairs) => R.fromPairs(pairs)
  );

  return {
    ...node,
    children,
    namedChildren,
  };
}
