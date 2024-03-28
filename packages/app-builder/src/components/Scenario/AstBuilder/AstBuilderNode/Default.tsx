import { stringifyAstNode } from '@app-builder/models/editable-ast-node';
import {
  useCustomLists,
  useDataModel,
  useTriggerObjectTable,
} from '@app-builder/services/ast-node/options';
import {
  adaptAstNodeFromEditorViewModel,
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
  editorNodeViewModel: EditorNodeViewModel;
}

export function Default({
  editorNodeViewModel,
  validationStatus,
  type,
}: DefaultProps) {
  const { t } = useTranslation(['common', 'scenarios']);

  const customLists = useCustomLists();
  const dataModel = useDataModel();
  const triggerObjectTable = useTriggerObjectTable();

  const stringifiedAstNode = useMemo(() => {
    const astNode = adaptAstNodeFromEditorViewModel(editorNodeViewModel);
    return stringifyAstNode(t, astNode, {
      dataModel: dataModel,
      triggerObjectTable: triggerObjectTable,
      customLists: customLists,
      enumOptions: [],
    });
  }, [customLists, dataModel, triggerObjectTable, editorNodeViewModel, t]);

  return (
    <div className={defaultClassnames({ type, validationStatus })}>
      {stringifiedAstNode}
    </div>
  );
}
