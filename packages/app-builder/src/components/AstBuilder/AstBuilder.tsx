import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import {
  adaptAggregationViewModel,
  AggregationEditModal,
  type AggregationEditorNodeViewModel,
  AggregationEditPanel,
  isAggregationEditorNodeViewModel,
} from './AggregationEdit';
import { AstBuilderNode } from './AstBuilderNode';

export function AstBuilder({
  builder,
  viewOnly,
}: {
  builder: AstBuilder;
  viewOnly?: boolean;
}) {
  return (
    <AggregationEditModal builder={builder}>
      <AstBuilderNode
        builder={builder}
        editorNodeViewModel={builder.editorNodeViewModel}
        viewOnly={viewOnly}
      />
      <AggregationEditPanel
        aggregations={findAggregations(builder.editorNodeViewModel).map(
          (aggregation) => ({
            aggregation: adaptAggregationViewModel(aggregation),
            onSave: (astNode) => {
              builder.setOperand(aggregation.nodeId, astNode);
            },
          })
        )}
      />
    </AggregationEditModal>
  );
}

const findAggregations = (editorNodeViewModel: EditorNodeViewModel) => {
  const aggregations: AggregationEditorNodeViewModel[] =
    editorNodeViewModel.children.flatMap((child) => {
      if (isAggregationEditorNodeViewModel(child)) {
        return child;
      } else {
        return findAggregations(child);
      }
    });
  return aggregations;
};
