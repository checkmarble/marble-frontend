import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
  getBorderColor,
} from '@app-builder/services/editor/ast-editor';
import clsx from 'clsx';

import { stringifyAstNode } from '../utils';

export function Default({
  builder,
  editorNodeViewModel,
  displayErrors,
  ariaLabel,
}: {
  builder: AstBuilder;
  editorNodeViewModel: EditorNodeViewModel;
  displayErrors?: boolean;
  ariaLabel?: string;
}) {
  const stringifiedAstNode = stringifyAstNode(
    adaptAstNodeFromEditorViewModel(editorNodeViewModel),
    builder
  );
  return (
    <div
      aria-label={ariaLabel}
      data-border-color={
        displayErrors ? getBorderColor(editorNodeViewModel) : 'grey-10'
      }
      className={clsx(
        'bg-grey-02 border-grey-02 flex h-fit min-h-[40px] w-fit min-w-[40px] items-center justify-between rounded border px-2 outline-none',
        // Border color variants
        'data-[border-color=grey-10]:border-grey-10',
        'data-[border-color=red-100]:border-red-100',
        'data-[border-color=red-25]:border-red-25'
      )}
    >
      {stringifiedAstNode}
    </div>
  );
}
