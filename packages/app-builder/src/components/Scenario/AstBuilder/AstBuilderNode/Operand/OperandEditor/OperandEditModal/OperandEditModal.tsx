import {
  type AstNode,
  type EditableAstNode,
  isAggregation,
  isFuzzyMatchComparator,
  isTimeAdd,
} from '@app-builder/models';
import { adaptAstNodeViewModel } from '@app-builder/models/ast-node-view-model';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';
import * as React from 'react';
import { assertNever } from 'typescript-utils';
import { type ModalContentV2Props, ModalV2 } from 'ui-design-system';

import { AggregationEdit } from './AggregationEdit/AggregationEdit';
import { FuzzyMatchComparatorEdit } from './FuzzyMatchComparatorEdit/FuzzyMatchComparatorEdit';
import { TimeAddEdit } from './TimeAddEdit/TimeAddEdit';

const OperandEditModalContent = React.forwardRef<
  HTMLDivElement,
  ModalContentV2Props
>(function OperandEditModalContent({ children, ...props }, ref) {
  return (
    <ModalV2.Content
      ref={ref}
      hideOnInteractOutside={(event) => {
        event.stopPropagation();
        // Prevent people from loosing their work by clicking accidentally outside the modal
        return false;
      }}
      {...props}
    >
      {/* New context necessary, hack to prevent pasting unwanted astnode inside the modal (ex: I close the modal, copy the current node, open the modal and paste the current inside the current...) */}
      <CopyPasteASTContextProvider>{children}</CopyPasteASTContextProvider>
    </ModalV2.Content>
  );
});

export function OperandEditModal({
  initialEditableAstNode,
  onSave,
}: {
  initialEditableAstNode: EditableAstNode;
  onSave: (astNode: AstNode) => void;
}) {
  if (isTimeAdd(initialEditableAstNode)) {
    return (
      <OperandEditModalContent size="small">
        <TimeAddEdit
          initialAstNodeVM={adaptAstNodeViewModel({
            ast: initialEditableAstNode,
          })}
          onSave={onSave}
        />
      </OperandEditModalContent>
    );
  }
  if (isFuzzyMatchComparator(initialEditableAstNode)) {
    return (
      <OperandEditModalContent size="medium">
        <FuzzyMatchComparatorEdit
          initialFuzzyMatchComparatorAstNodeViewModel={adaptAstNodeViewModel({
            ast: initialEditableAstNode,
          })}
          onSave={onSave}
        />
      </OperandEditModalContent>
    );
  }
  if (isAggregation(initialEditableAstNode)) {
    return (
      <OperandEditModalContent size="large">
        <AggregationEdit
          initialAstNodeVM={adaptAstNodeViewModel({
            ast: initialEditableAstNode,
          })}
          onSave={onSave}
        />
      </OperandEditModalContent>
    );
  }
  assertNever(
    '[OperandEditModal] Unsupported astNode type',
    initialEditableAstNode,
  );
}
