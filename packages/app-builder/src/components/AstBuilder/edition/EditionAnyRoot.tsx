import { type AstBuilderRootProps } from '@ast-builder/types';

import { EditionAstBuilderNode } from './EditionNode';
import { EditionEvaluationErrors } from './EvaluationErrors';
import { useRoot } from './hooks/useRoot';
import { AstBuilderNodeSharpFactory } from './node-store';

export function EditionAstBuilderAnyRoot(props: AstBuilderRootProps) {
  const nodeStore = useRoot(props);
  return (
    <AstBuilderNodeSharpFactory.Provider value={nodeStore}>
      <EditionAstBuilderNode
        root
        path="root"
        coerceDataType={props.coerceDataType}
        optionsDataType={props.optionsDataType}
      />
      <EditionEvaluationErrors id={nodeStore.value.node.id} />
    </AstBuilderNodeSharpFactory.Provider>
  );
}
