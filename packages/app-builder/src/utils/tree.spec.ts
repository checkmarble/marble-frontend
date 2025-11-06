import invariant from 'tiny-invariant';
import { describe, expect, it } from 'vitest';
import { getAtPath, getParentPath, parsePath, removeAtPath, setAtPath } from './tree';

describe('parsePath', () => {
  it.each([
    ['should start with root', 'children.0.namedChildren.foo.children.1'],
    ['every children should have index', 'root.children'],
    ['every namedChildren should have key', 'root.namedChildren'],
  ])('%s', (_, path) => {
    expect(() => parsePath(path)).toThrowError();
  });

  it.each([
    [
      'root.children.0.namedChildren.foo.children.1',
      [
        {
          type: 'children',
          index: 0,
        },
        {
          type: 'namedChildren',
          key: 'foo',
        },
        {
          type: 'children',
          index: 1,
        },
      ],
    ],
    [
      'root.namedChildren.foo.namedChildren.bar.children.15',
      [
        {
          type: 'namedChildren',
          key: 'foo',
        },
        {
          type: 'namedChildren',
          key: 'bar',
        },
        {
          type: 'children',
          index: 15,
        },
      ],
    ],
  ])('%s', (path, expected) => {
    expect(parsePath(path)).toMatchObject(expected);
  });
});

describe('getParentPath', () => {
  it('should return undefined when path is empty', () => {
    expect(getParentPath([])).toBeUndefined();
  });

  it.each([
    ['root.children.0.namedChildren.foo.children.1', 'root.children.0.namedChildren.foo'],
    ['root.namedChildren.foo.namedChildren.bar.children.15', 'root.namedChildren.foo.namedChildren.bar'],
  ])('%s', (path, expected) => {
    const parsedPath = parsePath(path);
    const expectedPath = parsePath(expected);
    const parentPath = getParentPath(parsedPath);
    invariant(parentPath, 'parentPath should not be null');
    expect(parentPath.path).toStrictEqual(expectedPath);
    expect(parentPath.childPathSegment).toStrictEqual(parsedPath[parsedPath.length - 1]);
  });
});

describe('getAtPath', () => {
  it('should return root when path is empty', () => {
    const tree = {
      value: 1,
      children: [],
      namedChildren: {},
    };
    expect(getAtPath(tree, [])).toBe(tree);
  });

  it('should return undefined when path is invalid', () => {
    const tree = {
      value: 1,
      children: [],
      namedChildren: {},
    };
    const path = parsePath('root.children.0.namedChildren.foo');
    expect(getAtPath(tree, path)).toBeUndefined();
  });

  it('should return the node at the path', () => {
    const tree = {
      value: 1,
      children: [
        {
          value: 2,
          children: [],
          namedChildren: {
            foo: {
              value: 3,
              children: [
                {
                  value: 4,
                  children: [],
                  namedChildren: {},
                },
              ],
              namedChildren: {},
            },
          },
        },
      ],
      namedChildren: {},
    };
    const path = parsePath('root.children.0.namedChildren.foo.children.0');
    expect(getAtPath(tree, path)).toMatchObject({
      value: 4,
      children: [],
      namedChildren: {},
    });
  });
});

describe('setAtPath', () => {
  it('should set root value', () => {
    const tree = {
      value: 1,
      children: [],
      namedChildren: {},
    };
    const path = parsePath('root');
    const value = {
      value: 2,
      children: [],
      namedChildren: {},
    };
    expect(setAtPath(tree, path, value)).toMatchObject(value);
  });

  it('should set children value', () => {
    const tree = {
      value: 1,
      children: [
        {
          value: 2,
          children: [],
          namedChildren: {},
        },
      ],
      namedChildren: {},
    };
    const path = parsePath('root.children.0');
    const value = {
      value: 3,
      children: [],
      namedChildren: {},
    };
    expect(setAtPath(tree, path, value)).toMatchObject({
      value: 1,
      children: [
        {
          value: 3,
          children: [],
          namedChildren: {},
        },
      ],
      namedChildren: {},
    });
  });

  it('should set namedChildren value', () => {
    const tree = {
      value: 1,
      children: [],
      namedChildren: {
        foo: {
          value: 2,
          children: [],
          namedChildren: {},
        },
      },
    };
    const path = parsePath('root.namedChildren.foo');
    const value = {
      value: 3,
      children: [],
      namedChildren: {},
    };
    expect(setAtPath(tree, path, value)).toMatchObject({
      value: 1,
      children: [],
      namedChildren: {
        foo: {
          value: 3,
          children: [],
          namedChildren: {},
        },
      },
    });
  });

  it('should throw when path is invalid', () => {
    const tree = {
      value: 1,
      children: [],
      namedChildren: {},
    };
    const path = parsePath('root.children.0.namedChildren.foo');
    const value = {
      value: 2,
      children: [],
      namedChildren: {},
    };
    expect(() => setAtPath(tree, path, value)).toThrowError();
  });
});

describe('removeAtPath', () => {
  describe('remove root node', () => {
    const tree = {
      value: 1,
      children: [],
      namedChildren: {},
    };
    const path = parsePath('root');

    it('should throw when trying to remove the root node', () => {
      expect(() => removeAtPath(tree, path)).toThrowError();
    });
    it('should return empty tree when emptyTree is provided', () => {
      const emptyTree = {
        value: 2,
        children: [],
        namedChildren: {},
      };
      expect(removeAtPath(tree, path, emptyTree)).toBe(emptyTree);
    });
  });

  it('should remove children node', () => {
    const tree = {
      value: 1,
      children: [
        {
          value: 2,
          children: [],
          namedChildren: {},
        },
      ],
      namedChildren: {},
    };
    const path = parsePath('root.children.0');
    expect(removeAtPath(tree, path)).toMatchObject({
      value: 1,
      children: [],
      namedChildren: {},
    });
  });

  it('should remove namedChildren node', () => {
    const tree = {
      value: 1,
      children: [],
      namedChildren: {
        foo: {
          value: 2,
          children: [],
          namedChildren: {},
        },
      },
    };
    const path = parsePath('root.namedChildren.foo');
    expect(removeAtPath(tree, path)).toMatchObject({
      value: 1,
      children: [],
      namedChildren: {},
    });
  });

  it('should do nothing when path is invalid', () => {
    const tree = {
      value: 1,
      children: [],
      namedChildren: {},
    };
    const path = parsePath('root.children.0.namedChildren.foo');
    expect(removeAtPath(tree, path)).toMatchObject(tree);
  });
});
