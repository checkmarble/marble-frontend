import { nanoid } from 'nanoid';
import * as React from 'react';
import invariant from 'tiny-invariant';

export type Tree<T> = T & {
  children: Tree<T>[];
  namedChildren: Record<string, Tree<T>>;
};

type ChildPathSegment = {
  type: 'children';
  index: number;
};
type NamedChildPathSegment = {
  type: 'namedChildren';
  key: string;
};
export type PathSegment = ChildPathSegment | NamedChildPathSegment;
export type Path = PathSegment[];

/**
 * A function that parses a string path into a Path object.
 *
 * Ex: 'root.children.0.namedChildren.foo.children.1'
 */
export function parsePath(stringPath: string): Path {
  const rawPath = stringPath.split('.');
  const root = rawPath.shift(); // Remove the first element, which is always empty
  if (root !== 'root') throw new Error('root path is missing');
  const path: Path = [];
  while (rawPath.length > 0) {
    const type = rawPath.shift();
    invariant(type, 'invalid path: missing type');
    const value = rawPath.shift();
    invariant(value, 'invalid path: missing value');

    switch (type) {
      case 'children': {
        const index = parseInt(value, 10);
        if (Number.isNaN(index)) {
          throw new Error('invalid path: index must be a number');
        }
        path.push({ type: 'children', index });
        break;
      }
      case 'namedChildren': {
        path.push({ type: 'namedChildren', key: value });
        break;
      }
      default:
        throw new Error(`invalid path: unknown type ${type}`);
    }
  }
  return path;
}

export function getParentPath(path: Path) {
  if (path.length === 0) {
    return undefined;
  }
  return {
    path: path.slice(0, -1),
    childPathSegment: path[path.length - 1],
  };
}
export type ParentPath = ReturnType<typeof getParentPath>;

function getAtPathSegment<T>(
  tree: Tree<T>,
  pathSegment: PathSegment,
): Tree<T> | undefined {
  switch (pathSegment.type) {
    case 'children': {
      const { index } = pathSegment;
      return tree.children[index];
    }
    case 'namedChildren': {
      const { key } = pathSegment;
      return tree.namedChildren[key];
    }
  }
}

export function getAtPath<T>(tree: Tree<T>, path: Path): Tree<T> | undefined {
  const [pathSegment, ...restPath] = path;
  if (pathSegment === undefined) {
    return tree;
  }
  const child = getAtPathSegment(tree, pathSegment);
  if (child === undefined) {
    return undefined;
  }
  return getAtPath(child, restPath);
}

function setAtPathSegment<T>(
  tree: Tree<T>,
  pathSegment: PathSegment,
  value: Tree<T>,
): Tree<T> {
  switch (pathSegment.type) {
    case 'children': {
      const { index } = pathSegment;
      return {
        ...tree,
        children: [
          ...tree.children.slice(0, index),
          value,
          ...tree.children.slice(index + 1),
        ],
      };
    }
    case 'namedChildren': {
      const { key } = pathSegment;
      return {
        ...tree,
        namedChildren: {
          ...tree.namedChildren,
          [key]: value,
        },
      };
    }
  }
}

export function setAtPath<T>(
  tree: Tree<T>,
  path: Path,
  value: Tree<T>,
): Tree<T> {
  const [pathSegment, ...restPath] = path;
  if (pathSegment === undefined) {
    return value;
  }
  const child = getAtPathSegment(tree, pathSegment);
  if (child === undefined) {
    throw new Error('setAtPath: path do not correspond to an existing node');
  }
  const newChild = setAtPath(child, restPath, value);
  return setAtPathSegment(tree, pathSegment, newChild);
}

function removeAtPathSegment<T>(
  tree: Tree<T>,
  pathSegment: PathSegment,
): Tree<T> {
  switch (pathSegment.type) {
    case 'children': {
      const { index } = pathSegment;
      return {
        ...tree,
        children: [
          ...tree.children.slice(0, index),
          ...tree.children.slice(index + 1),
        ],
      };
    }
    case 'namedChildren': {
      const { key } = pathSegment;
      const { [key]: _, ...restNamedChildren } = tree.namedChildren;
      return {
        ...tree,
        namedChildren: restNamedChildren,
      };
    }
  }
}

export function removeAtPath<T>(
  tree: Tree<T>,
  path: Path,
  emptyTree?: Tree<T>,
): Tree<T> {
  const [pathSegment, ...restPath] = path;
  if (pathSegment === undefined) {
    // This is the root node, return an empty tree
    if (emptyTree) return emptyTree;
    throw new Error('removeAtPath: cannot remove the root node');
  }
  if (restPath.length === 0) {
    // This is the last segment of the path
    return removeAtPathSegment(tree, pathSegment);
  }
  const child = getAtPathSegment(tree, pathSegment);
  if (child === undefined) {
    // The path do not correspond to an existing node, nothing to remove
    return tree;
  }
  const newChild = removeAtPath(child, restPath);
  return setAtPathSegment(tree, pathSegment, newChild);
}

export function useChildrenArray<C, T extends { children: C[] }>(
  stringPath: string,
  tree: T,
): { child: T['children'][number]; key: string; treePath: string }[] {
  return React.useMemo(
    () =>
      tree.children.map((child, index) => ({
        key: nanoid(),
        child,
        treePath: `${stringPath}.children.${index}`,
      })),
    [stringPath, tree.children],
  );
}
