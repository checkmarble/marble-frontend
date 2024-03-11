import { stringifyAstNode } from '@app-builder/models/editable-ast-node';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
  getBorderColor,
} from '@app-builder/services/editor/ast-editor';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function Default({
  builder,
  editorNodeViewModel,
  displayErrors,
}: {
  builder: AstBuilder;
  editorNodeViewModel: EditorNodeViewModel;
  displayErrors?: boolean;
}) {
  const { t } = useTranslation(['scenarios']);
  const stringifiedAstNode = useMemo(() => {
    const astNode = adaptAstNodeFromEditorViewModel(editorNodeViewModel);
    return stringifyAstNode(t, astNode, {
      dataModel: builder.input.dataModel,
      triggerObjectTable: builder.input.triggerObjectTable,
      customLists: builder.input.customLists,
      enumOptions: [],
    });
  }, [
    builder.input.customLists,
    builder.input.dataModel,
    builder.input.triggerObjectTable,
    editorNodeViewModel,
    t,
  ]);

  return (
    <div
      data-border-color={
        displayErrors ? getBorderColor(editorNodeViewModel) : 'grey-10'
      }
      className={clsx(
        'bg-grey-02 border-grey-02 flex size-fit min-h-[40px] min-w-[40px] items-center justify-between rounded border px-2 outline-none',
        // Border color variants
        'data-[border-color=grey-10]:border-grey-10',
        'data-[border-color=red-100]:border-red-100',
        'data-[border-color=red-25]:border-red-25',
      )}
    >
      {stringifiedAstNode}
    </div>
  );
}
