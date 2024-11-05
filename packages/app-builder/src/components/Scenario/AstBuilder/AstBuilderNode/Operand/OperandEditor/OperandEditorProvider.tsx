import {
  type AstNode,
  type ConstantAstNode,
  type ConstantType,
  type DataType,
  type EditableAstNode,
  isDatabaseAccess,
  isEditableAstNode,
  isPayload,
  isUndefinedAstNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import { type OperandType } from '@app-builder/models/operand-type';
import { useOptionalCopyPasteAST } from '@app-builder/services/editor/copy-paste-ast';
import { useTriggerObjectTable } from '@app-builder/services/editor/options';
import { type AstNodeErrors } from '@app-builder/services/validation/ast-node-validation';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { type IconName } from 'ui-icons';
import { createStore, type StoreApi, useStore } from 'zustand';

type OperandEditorState = {
  editModalOpen: boolean;
  /**
   * The initial editable ast node that was clicked to open the edit modal
   */
  initialEditableAstNode: EditableAstNode | null;
  operandEditorOpen: boolean;
  /**
   * The initial ast node that was clicked to open the operand editor
   */
  initialAstNode: AstNode;
  initialAstNodeErrors: AstNodeErrors;
  options: {
    astNode: AstNode;
    dataType: DataType;
    operandType: OperandType;
    displayName: string;
  }[];
  searchValue: string;
  coerceToConstant?: (searchValue: string) => {
    astNode: ConstantAstNode<ConstantType>;
    displayName: string;
    dataType: DataType;
  }[];
};

interface OperandEditorActions {
  onSave: (astNode: AstNode) => void;
  onEdit: (astNode: EditableAstNode) => void;
  onEditSave: (astNode: AstNode) => void;
  onEditClose: () => void;
  onOptionClick: (astNode: AstNode) => void;
  onSearch: (searchValue: string) => void;
  setOperandEditorOpen: (
    open: boolean,
    astNode: AstNode,
    options: {
      astNode: AstNode;
      dataType: DataType;
      operandType: OperandType;
      displayName: string;
    }[],
    coerceToConstant?: (searchValue: string) => {
      astNode: ConstantAstNode<ConstantType>;
      displayName: string;
      dataType: DataType;
    }[],
    astNodeErrors?: AstNodeErrors,
  ) => void;
}

type OperandEditorStore = OperandEditorState & {
  actions: OperandEditorActions;
};

const OperandEditorContext = createSimpleContext<StoreApi<OperandEditorStore>>(
  'OperandEditorContext',
);

interface OperandEditorProviderProps {
  children: React.ReactNode;
  onSave: (astNode: AstNode) => void;
}

export function OperandEditorProvider({
  children,
  onSave,
}: OperandEditorProviderProps) {
  const onSaveCallbackRef = useCallbackRef(onSave);

  const [store] = React.useState(() =>
    createStore<OperandEditorStore>((set) => ({
      ...createInitialState(),
      actions: {
        onSave: onSaveCallbackRef,
        onEdit(astNode) {
          set({
            editModalOpen: true,
            initialEditableAstNode: astNode,
          });
        },
        onEditSave(astNode) {
          onSaveCallbackRef(astNode);
          set({
            editModalOpen: false,
          });
        },
        onEditClose() {
          set({
            editModalOpen: false,
          });
        },
        onOptionClick(astNode) {
          if (isEditableAstNode(astNode)) {
            set({
              editModalOpen: true,
              initialEditableAstNode: astNode,
            });
          } else {
            onSaveCallbackRef(astNode);
          }
        },
        onSearch(searchValue) {
          set({
            searchValue,
          });
        },
        setOperandEditorOpen(
          open,
          astNode,
          options,
          coerceToConstant,
          evaluationErrors,
        ) {
          if (open) {
            set({
              operandEditorOpen: true,
              initialAstNode: astNode,
              initialAstNodeErrors: evaluationErrors ?? {
                errors: [],
                children: [],
                namedChildren: {},
              },
              options,
              coerceToConstant,
            });
          } else {
            set({
              operandEditorOpen: false,
            });
          }
        },
      },
    })),
  );

  return (
    <OperandEditorContext.Provider value={store}>
      {children}
    </OperandEditorContext.Provider>
  );
}

function createInitialState(): OperandEditorState {
  return {
    editModalOpen: false,
    initialEditableAstNode: null,
    operandEditorOpen: false,
    initialAstNode: NewUndefinedAstNode(),
    initialAstNodeErrors: {
      errors: [],
      children: [],
      namedChildren: {},
    },
    searchValue: '',
    options: [],
  };
}

function useOperandEditorStore<Out>(
  selector: (state: OperandEditorStore) => Out,
) {
  const store = OperandEditorContext.useValue();
  return useStore(store, selector);
}

export function useOperandEditorActions() {
  return useOperandEditorStore((state) => state.actions);
}

export function useEditModalOpen() {
  return useOperandEditorStore((state) => state.editModalOpen);
}

export function useInitialEditableAstNode() {
  return useOperandEditorStore((state) => state.initialEditableAstNode);
}

export function useInitialAstNodeErrors() {
  return useOperandEditorStore((state) => state.initialAstNodeErrors);
}

export function useInitialAstNode() {
  return useOperandEditorStore((state) => state.initialAstNode);
}

export function useOperandEditorOpen() {
  return useOperandEditorStore((state) => state.operandEditorOpen);
}

export function useSearchValue() {
  return useOperandEditorStore((state) => state.searchValue);
}

export function useOptions() {
  return useOperandEditorStore((state) => state.options);
}

export function useCoerceToConstant() {
  return useOperandEditorStore((state) => state.coerceToConstant);
}

export function useBottomOptions() {
  const { t } = useTranslation(['common', 'scenarios']);
  // Local copy of the astNode to avoid the content to flicker during closing animation
  const [copyPasteAST] = React.useState(useOptionalCopyPasteAST());
  const { onSave, onEdit } = useOperandEditorActions();
  const initialAstNode = useInitialAstNode();

  return React.useMemo(() => {
    const bottomOptions: {
      icon: IconName;
      label: string;
      onSelect: () => void;
    }[] = [];

    if (!isUndefinedAstNode(initialAstNode)) {
      bottomOptions.push({
        icon: 'restart-alt',
        label: t('scenarios:edit_operand.clear_operand'),
        onSelect: () => {
          onSave(NewUndefinedAstNode());
        },
      });
    }

    if (isEditableAstNode(initialAstNode)) {
      bottomOptions.push({
        icon: 'edit-square',
        label: t('common:edit'),
        onSelect: () => {
          onEdit(initialAstNode);
        },
      });
    }

    if (!isUndefinedAstNode(initialAstNode) && copyPasteAST) {
      bottomOptions.push({
        icon: 'copy',
        label: t('common:copy'),
        onSelect: () => {
          copyPasteAST.setAst(initialAstNode);
        },
      });
    }

    if (copyPasteAST) {
      const { ast } = copyPasteAST;
      if (ast) {
        bottomOptions.push({
          icon: 'paste',
          label: t('common:paste'),
          onSelect: () => {
            onSave(ast);
          },
        });
      }
    }

    return bottomOptions;
  }, [copyPasteAST, initialAstNode, onEdit, onSave, t]);
}

export function useDiscoveryResults() {
  const options = useOptions();
  const triggerObjectTable = useTriggerObjectTable();
  return React.useMemo(() => {
    return R.pipe(
      options,
      R.groupBy((option) => option.operandType),
      ({ Enum, CustomList, Function, Field }) => {
        const fieldOptions = Field
          ? R.pipe(
              Field,
              R.groupBy((option) => {
                if (isDatabaseAccess(option.astNode)) {
                  const { path, tableName } = option.astNode.namedChildren;
                  return [tableName.constant, ...path.constant].join('.');
                }
                if (isPayload(option.astNode)) {
                  return triggerObjectTable.name;
                }
              }),
              R.mapValues((value) => R.sortBy(value, R.prop('displayName'))),
              R.entries(),
              R.sortBy(([path]) => path),
            )
          : [];

        return {
          enumOptions: Enum ?? [],
          fieldOptions,
          customListOptions: CustomList ?? [],
          functionOptions: Function ?? [],
        };
      },
    );
  }, [options, triggerObjectTable.name]);
}
