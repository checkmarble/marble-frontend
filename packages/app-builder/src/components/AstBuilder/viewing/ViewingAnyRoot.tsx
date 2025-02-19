import { type AstBuilderRootProps } from '@ast-builder/types';
import { useMemo } from 'react';

import { ViewingEvaluationErrors } from './ViewingEvaluationErrors';
import { ViewingAstBuilderNode } from './ViewingNode';

export function EditionAstBuilderAnyRoot(props: AstBuilderRootProps) {
  const evaluation = useMemo(() => props.evaluation ?? [], [props.evaluation]);

  return (
    <div className="flex flex-col gap-4">
      <ViewingAstBuilderNode path="root" node={props.node} evaluation={evaluation} />
      <ViewingEvaluationErrors id={props.node.id} evaluation={evaluation} />
    </div>
  );
}
