import type { AstBuilderRootProps } from '@ast-builder/types';
import { useMemo } from 'react';

import { ViewingEvaluationErrors } from './ViewingEvaluationErrors';
import { ViewingAstBuilderNode } from './ViewingNode';

export function EditionAstBuilderAnyRoot(props: AstBuilderRootProps) {
  const validation = useMemo(
    () => props.validation ?? { errors: [], evaluation: [] },
    [props.validation],
  );

  return (
    <div className="flex flex-col gap-4">
      <ViewingAstBuilderNode path="root" node={props.node} validation={validation} />
      <ViewingEvaluationErrors id={props.node.id} evaluation={validation.evaluation} />
    </div>
  );
}
