import { type AstNode } from '@app-builder/models';
import {
  getAtPath,
  getParentPath,
  parsePath,
  setAtPath,
  setAtPathSegment,
} from '@app-builder/utils/tree';
import { createComponentState, type StateCreator } from '@marble/shared';

export type AstBuilderNodeStore = {
  node: AstNode;
  getParentNode: (path: string) => AstNode | null;
  setNode: (node: AstNode) => void;
  setNodeAtPath: (path: string, node: AstNode) => void;
};

export const AstBuilderNodeState = createComponentState({
  name: 'AstBuilderNodeState',
  factory: ({
    initialNode,
  }: {
    initialNode: AstNode;
  }): StateCreator<AstBuilderNodeStore> => {
    return (set, get) => ({
      node: initialNode,

      getParentNode: (path: string) => {
        const parentPath = getParentPath(parsePath(path));
        if (!parentPath) {
          throw new Error(`Could find parent node for: ${path}`);
        }
        return getAtPath(get().node, parentPath.path) ?? null;
      },

      setNode: (node: AstNode) => {
        set({ node });
      },
      setNodeAtPath: (stringPath: string, node: AstNode) => {
        set((state) => ({
          node: setAtPath(state.node, parsePath(stringPath), node),
        }));
      },
    });
  },
});
