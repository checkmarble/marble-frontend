import { type AstNode } from '@app-builder/models';
import { getAtPath, getParentPath, parsePath } from '@app-builder/utils/tree';
import { createComponentState, withActions } from '@marble/shared';
import { match, P } from 'ts-pattern';

export type AstBuilderNodeStore = {
  node: AstNode;
  getParentNode: (path: string) => AstNode | null;
  setNode: (node: AstNode) => void;
  setNodeAtPath: (path: string, node: AstNode) => void;
};

export const AstBuilderNodeState = createComponentState(
  withActions({
    config: {
      name: 'AstBuilderNodeState',
      factory: ({ initialNode }: { initialNode: AstNode }) => {
        return { node: initialNode };
      },
    },
    actions: (api) => {
      return {
        setNodeAtPath(path: string, newNode: AstNode) {
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
      };
    },
  }),
);
