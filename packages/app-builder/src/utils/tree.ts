import * as R from 'remeda';

export type Tree<T> = T & {
  nodeId: string;
  children: Tree<T>[];
  namedChildren: Record<string, Tree<T>>;
  parent: Tree<T> | null;
};

export function findAndReplaceNode<T>(
  nodeIdToReplace: string,
  fn: (node: Tree<T>) => Tree<T> | null,
  node: Tree<T>,
  parent: Tree<T> | null = null,
): Tree<T> | null {
  if (node.nodeId === nodeIdToReplace) {
    const newNode = fn(node);
    if (newNode === null) {
      return null;
    }
    newNode.parent = node.parent;
    return newNode;
  }

  const newNode: Tree<T> = {
    ...node,
    parent,
  };

  const children = R.pipe(
    node.children,
    R.map((child: Tree<T>) =>
      findAndReplaceNode(nodeIdToReplace, fn, child, newNode),
    ),
    R.filter(R.isNonNullish),
  );

  const namedChildren = R.pipe(
    R.entries(node.namedChildren),
    R.map(([key, child]) => {
      const newChild = findAndReplaceNode(nodeIdToReplace, fn, child, newNode);
      return newChild === null ? null : ([key, newChild] as const);
    }),
    R.filter(R.isNonNullish),
    R.fromEntries(),
  );

  newNode.children = children;
  newNode.namedChildren = namedChildren;

  return newNode;
}
