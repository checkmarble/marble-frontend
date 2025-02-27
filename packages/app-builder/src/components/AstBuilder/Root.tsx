import { type AstNode } from '@app-builder/models';
import { useCallbackRef } from '@marble/shared';
import { useEffect } from 'react';
import { type InferSharpApi } from 'sharpstate';

import { Internal_AstBuilderRoot } from './edition/InternalRoot';
import { AstBuilderNodeSharpFactory } from './node-store';

type AstBuilderRootProps = {
  initialNode: AstNode;
  nodeStoreRef?: (nodeStore: InferSharpApi<typeof AstBuilderNodeSharpFactory>) => void;
};

export function AstBuilderRoot(props: AstBuilderRootProps) {
  const nodeStoreRefFn = useCallbackRef(props.nodeStoreRef);
  const nodeStore = AstBuilderNodeSharpFactory.createSharp({
    initialNode: props.initialNode,
  });

  useEffect(() => {
    nodeStoreRefFn(nodeStore);
  }, [nodeStoreRefFn, nodeStore]);

  return (
    <AstBuilderNodeSharpFactory.Provider value={nodeStore}>
      <Internal_AstBuilderRoot />
    </AstBuilderNodeSharpFactory.Provider>
  );
}
