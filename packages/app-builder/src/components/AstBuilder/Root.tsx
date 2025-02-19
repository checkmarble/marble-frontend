import { type AstNode } from '@app-builder/models';
import { type ComponentStateType } from '@app-builder/utils/component-store';
import { parsePath, setAtPath } from '@app-builder/utils/tree';

import { Internal_AstBuilderRoot } from './edition/InternalRoot';
import { AstBuilderNodeState } from './node-store';

type AstBuilderRootProps = {
  initialNode: AstNode;
  nodeStoreRef: (
    nodeStore: ComponentStateType<typeof AstBuilderNodeState>,
  ) => void;
};
export function AstBuilderRoot(props: AstBuilderRootProps) {
  const nodeStore = AstBuilderNodeState.createStore({
    initialNode: props.initialNode,
  });

  return (
    <AstBuilderNodeState.Provider value={nodeStore}>
      <Internal_AstBuilderRoot />
    </AstBuilderNodeState.Provider>
  );
}
