import { type AstBuilder } from '@app-builder/services/editor/ast-editor';

import { AggregationEditModal } from './AstBuilderNode/AggregationEdit';
import { TimeAddEditModal } from './AstBuilderNode/TimeAddEdit/Modal';
import { RootAstBuilderNode } from './RootAstBuilderNode';

export function AstBuilder({
  builder,
  viewOnly,
}: {
  builder: AstBuilder;
  viewOnly?: boolean;
}) {
  return (
    <TimeAddEditModal builder={builder}>
      <AggregationEditModal builder={builder}>
        <RootAstBuilderNode
          builder={builder}
          editorNodeViewModel={builder.editorNodeViewModel}
          viewOnly={viewOnly}
        />
      </AggregationEditModal>
    </TimeAddEditModal>
  );
}
