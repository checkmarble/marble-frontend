import {
  type AstNode,
  type EditableAstNode,
  isTimeAdd,
} from '@app-builder/models';
import { adaptAstNodeViewModel } from '@app-builder/models/ast-node-view-model';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';
import * as React from 'react';
import { assertNever } from 'typescript-utils';
import { type ModalContentV2Props, ModalV2 } from 'ui-design-system';

import { TimeAddEdit } from './TimeAddEdit/TimeAddEdit';

const OperandEditModalContent = React.forwardRef<
  HTMLDivElement,
  ModalContentV2Props
>(function OperandEditModalContent({ children, ...props }, ref) {
  return (
    <ModalV2.Content ref={ref} {...props}>
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
      <OperandEditModalContent>
        <TimeAddEdit
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
