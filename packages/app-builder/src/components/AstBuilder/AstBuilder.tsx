import type {
  AstBuilder,
  EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import { AggregationEditPanel } from './AggregationEdit';
import { AstBuilderNode } from './AstBuilderNode';

export function AstBuilder({ builder }: { builder: AstBuilder }) {
  const findAggregations = (editorNodeViewModel: EditorNodeViewModel) => {
    const aggregations: EditorNodeViewModel[] =
      editorNodeViewModel.children.flatMap((child) => {
        if (child.funcName == 'Aggregator') {
          return child;
        } else {
          return findAggregations(child);
        }
      });
    return aggregations;
  };

  return (
    <>
      <AstBuilderNode
        builder={builder}
        editorNodeViewModel={builder.editorNodeViewModel}
      />
      <AggregationEditPanel
        aggregations={findAggregations(builder.editorNodeViewModel)}
        builder={builder}
      />
    </>
  );
}
