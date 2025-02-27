import { type AstNode } from '@app-builder/models';
import { getAtPath, getParentPath, parsePath } from '@app-builder/utils/tree';
import { createSharpFactory, type InferSharpApi } from 'sharpstate';
import { match, P } from 'ts-pattern';

export type AstBuilderNodeStore = {
  node: AstNode;
  getParentNode: (path: string) => AstNode | null;
  setNode: (node: AstNode) => void;
  setNodeAtPath: (path: string, node: AstNode) => void;
};

export const AstBuilderNodeSharpFactory = createSharpFactory({
  name: 'AstBuilderNode',
  initializer({ initialNode }: { initialNode: AstNode }) {
    return { node: initialNode };
  },
}).withActions({
  setNodeAtPath(api, path: string, newNode: AstNode) {
    const parentPath = getParentPath(parsePath(path));
    if (!parentPath) {
      api.value.node = newNode;
    } else {
      const parentNode = getAtPath(api.value.node, parentPath.path);
      if (!parentNode) {
        return;
      }

      match(parentPath.childPathSegment)
        .with({ type: 'children', index: P.select() }, (index) => {
          parentNode.children[index] = newNode;
        })
        .with({ type: 'namedChildren', key: P.select() }, (key) => {
          parentNode.namedChildren[key] = newNode;
        })
        .exhaustive();
    }
  },
});

type A = InferSharpApi<typeof AstBuilderNodeSharpFactory>;
