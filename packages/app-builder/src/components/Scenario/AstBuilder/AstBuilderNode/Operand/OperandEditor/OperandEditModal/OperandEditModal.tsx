import {
  isAggregation,
  isFuzzyMatchComparator,
  isTimeAdd,
} from '@app-builder/models';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';
import * as React from 'react';
import { assertNever } from 'typescript-utils';
import { type ModalContentV2Props, ModalV2 } from 'ui-design-system';

import {
  useEditModalOpen,
  useInitialAstNodeErrors,
  useInitialEditableAstNode,
  useOperandEditorActions,
} from '../OperandEditorProvider';
import { AggregationEdit } from './AggregationEdit/AggregationEdit';
import { FuzzyMatchComparatorEdit } from './FuzzyMatchComparatorEdit/FuzzyMatchComparatorEdit';
import { TimeAddEdit } from './TimeAddEdit/TimeAddEdit';

const OperandEditModalContent = React.forwardRef<
  HTMLDivElement,
  ModalContentV2Props
>(function OperandEditModalContent({ children, ...props }, ref) {
  const { onEditClose } = useOperandEditorActions();
  const editModalOpen = useEditModalOpen();
  return (
    <ModalV2.Content
      ref={ref}
      hideOnInteractOutside={(event) => {
        event.stopPropagation();
        // Prevent people from loosing their work by clicking accidentally outside the modal
        return false;
      }}
      open={editModalOpen}
      onClose={onEditClose}
      {...props}
    >
      {/* New context necessary, hack to prevent pasting unwanted astnode inside the modal (ex: I close the modal, copy the current node, open the modal and paste the current inside the current...) */}
      <CopyPasteASTContextProvider>{children}</CopyPasteASTContextProvider>
    </ModalV2.Content>
  );
});

export function OperandEditModal() {
  const { onEditSave } = useOperandEditorActions();
  const initialEditableAstNode = useInitialEditableAstNode();
  const initialAstNodeErrors = useInitialAstNodeErrors();
  if (initialEditableAstNode === null) {
    return null;
  }

  if (isTimeAdd(initialEditableAstNode)) {
    return (
      <OperandEditModalContent size="small">
        <TimeAddEdit
          timeAddAstNode={initialEditableAstNode}
          astNodeErrors={initialAstNodeErrors}
          onSave={onEditSave}
        />
      </OperandEditModalContent>
    );
  }
  if (isFuzzyMatchComparator(initialEditableAstNode)) {
    return (
      <OperandEditModalContent size="medium">
        <FuzzyMatchComparatorEdit
          initialFuzzyMatchComparatorAstNode={initialEditableAstNode}
          initialAstNodeErrors={initialAstNodeErrors}
          onSave={onEditSave}
        />
      </OperandEditModalContent>
    );
  }
  if (isAggregation(initialEditableAstNode)) {
    return (
      <OperandEditModalContent size="large">
        <AggregationEdit
          initialAggregationAstNode={initialEditableAstNode}
          initialAstNodeErrors={initialAstNodeErrors}
          onSave={onEditSave}
        />
      </OperandEditModalContent>
    );
  }
  assertNever(
    '[OperandEditModal] Unsupported astNode type',
    initialEditableAstNode,
  );
}
