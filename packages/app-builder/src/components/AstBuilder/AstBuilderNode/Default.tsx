import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import clsx from 'clsx';

import { getBorderColor, stringifyAstNode } from '../utils';

export function Default({
  builder,
  editorNodeViewModel,
  displayErrors,
}: {
  builder: AstBuilder;
  editorNodeViewModel: EditorNodeViewModel;
  displayErrors?: boolean;
}) {
  const stringifiedAstNode = stringifyAstNode(
    adaptAstNodeFromEditorViewModel(editorNodeViewModel),
    builder
  );
  return (
    <div
      data-border-color={
        displayErrors && getBorderColor(editorNodeViewModel.validation)
      }
      className={clsx(
        'bg-grey-02 border-grey-02 flex h-fit min-h-[40px] w-fit min-w-[40px] items-center justify-between rounded border px-2 outline-none',
        // Border color variants
        'data-[border-color=grey]:border-grey-10',
        'data-[border-color=red]:border-red-100',
        'data-[border-color=green]:border-green-100'
      )}
    >
      {stringifiedAstNode}
    </div>
  );
}
