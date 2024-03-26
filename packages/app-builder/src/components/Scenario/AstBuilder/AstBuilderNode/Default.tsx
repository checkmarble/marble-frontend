import { stringifyAstNode } from '@app-builder/models/editable-ast-node';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { cva, type VariantProps } from 'class-variance-authority';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const defaultClassnames = cva(
  'bg-grey-02 flex size-fit min-h-[40px] min-w-[40px] items-center justify-between rounded px-2 outline-none',
  {
    variants: {
      type: {
        editor: '',
        viewer: '',
      },
      validationStatus: {
        valid: '',
        error: 'border border-red-100',
        'light-error': 'border border-red-25',
      },
    },
    compoundVariants: [
      {
        type: 'editor',
        validationStatus: 'valid',
        className: 'border border-grey-02',
      },
      {
        type: 'viewer',
        validationStatus: 'valid',
        className: 'border border-grey-02',
      },
    ],
    defaultVariants: {
      type: 'viewer',
      validationStatus: 'valid',
    },
  },
);

interface DefaultProps extends VariantProps<typeof defaultClassnames> {
  builder: AstBuilder;
  editorNodeViewModel: EditorNodeViewModel;
}

export function Default({
  builder,
  editorNodeViewModel,
  validationStatus,
  type,
}: DefaultProps) {
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
    <div className={defaultClassnames({ type, validationStatus })}>
      {stringifiedAstNode}
    </div>
  );
}
