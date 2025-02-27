import { type AstNode } from '@app-builder/models';
import { type ComponentStateType, useCallbackRef } from '@marble/shared';
import { useEffect } from 'react';

import { Internal_AstBuilderRoot } from './edition/InternalRoot';
import { AstBuilderNodeState } from './node-store';

type AstBuilderRootProps = {
  initialNode: AstNode;
  nodeStoreRef?: (nodeStore: ComponentStateType<typeof AstBuilderNodeState>) => void;
};
export function AstBuilderRoot(props: AstBuilderRootProps) {
  const nodeStoreRefFn = useCallbackRef(props.nodeStoreRef);
  const nodeStore = AstBuilderNodeState.createStore({
    initialNode: props.initialNode,
  });

  useEffect(() => {
    nodeStoreRefFn(nodeStore);
  }, [nodeStoreRefFn, nodeStore]);

  return (
    <AstBuilderNodeState.Provider value={nodeStore}>
      <Internal_AstBuilderRoot />
    </AstBuilderNodeState.Provider>
  );
}
