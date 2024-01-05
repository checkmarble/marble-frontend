import { type AstBuilder } from '@app-builder/services/editor/ast-editor';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';

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
    <CopyPasteASTContextProvider>
      <TimeAddEditModal builder={builder}>
        <AggregationEditModal builder={builder}>
          <RootAstBuilderNode
            builder={builder}
            editorNodeViewModel={builder.editorNodeViewModel}
            viewOnly={viewOnly}
          />
        </AggregationEditModal>
      </TimeAddEditModal>
    </CopyPasteASTContextProvider>
  );
}
