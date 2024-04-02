import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { type AstNode, isFuzzyMatchComparator } from '@app-builder/models';
import {
  type FuzzyMatchAlgorithm,
  fuzzyMatchAlgorithms,
} from '@app-builder/models/editable-operators';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import {
  useAdaptEditableAstNode,
  useOperandOptions,
} from '@app-builder/services/ast-node/options';
import {
  adaptAstNodeFromEditorViewModel,
  adaptEditorNodeViewModel,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2 } from 'ui-design-system';

import { Operand } from '../Operand';
import { Operator } from '../Operator';

export interface FuzzyMatchComparatorEditorNodeViewModel {
  nodeId: string;
  funcName: '>';
  constant?: undefined;
  errors: EvaluationError[];
  children: [
    FuzzyMatchEditorNodeViewModel,
    {
      nodeId: string;
      funcName: null;
      constant?: number;
      errors: EvaluationError[];
      children: [];
      namedChildren: Record<string, never>;
      parent: FuzzyMatchComparatorEditorNodeViewModel;
    },
  ];
  namedChildren: Record<string, never>;
  parent: EditorNodeViewModel;
}
export interface FuzzyMatchEditorNodeViewModel {
  nodeId: string;
  funcName: 'FuzzyMatch' | 'FuzzyMatchAnyOf';
  constant?: undefined;
  errors: EvaluationError[];
  children: [EditorNodeViewModel, EditorNodeViewModel];
  namedChildren: {
    algorithm: {
      nodeId: string;
      funcName: null;
      constant?: FuzzyMatchAlgorithm;
      errors: EvaluationError[];
      children: [];
      namedChildren: Record<string, never>;
      parent: null;
    };
  };
  parent: FuzzyMatchComparatorEditorNodeViewModel;
}

export const isFuzzyMatchComparatorEditorNodeViewModel = (
  vm: EditorNodeViewModel,
): vm is FuzzyMatchComparatorEditorNodeViewModel => {
  const astNode = adaptAstNodeFromEditorViewModel(vm);
  return isFuzzyMatchComparator(astNode);
};

export interface FuzzyMatchComparatorEditModalProps {
  initialValue: FuzzyMatchComparatorEditorNodeViewModel;
  onSave: (astNode: AstNode) => void;
}

const FuzzyMatchComparatorEditModalContext = createSimpleContext<
  (timeAddProps: FuzzyMatchComparatorEditModalProps) => void
>('FuzzyMatchComparatorEditModalContext');

export const useFuzzyMatchComparatorEdit =
  FuzzyMatchComparatorEditModalContext.useValue;

export function FuzzyMatchComparatorEditModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, onOpenChange] = useState<boolean>(false);
  const [
    fuzzyMatchComparatorEditModalProps,
    setFuzzyMatchComparatorEditModalProps,
  ] = useState<FuzzyMatchComparatorEditModalProps>();

  const fuzzyMatchComparatorEdit = useCallback(
    (props: FuzzyMatchComparatorEditModalProps) => {
      setFuzzyMatchComparatorEditModalProps(props);
      onOpenChange(true);
    },
    [],
  );

  return (
    <ModalV2.Root open={open} setOpen={onOpenChange}>
      <FuzzyMatchComparatorEditModalContext.Provider
        value={fuzzyMatchComparatorEdit}
      >
        {children}
        <ModalV2.Content size="medium" unmountOnHide>
          {/* New context necessary, hack to prevent pasting unwanted astnode inside the modal (ex: I close the modal, copy the current node, open the modal and paste the current inside the current...) */}
          <CopyPasteASTContextProvider>
            {fuzzyMatchComparatorEditModalProps ? (
              <FuzzyMatchComparatorEditModalContent
                initialValue={
                  fuzzyMatchComparatorEditModalProps.initialValue.children[0]
                }
                onSave={(vm: FuzzyMatchEditorNodeViewModel) => {
                  const astNode = adaptAstNodeFromEditorViewModel({
                    ...fuzzyMatchComparatorEditModalProps.initialValue,
                    children: [
                      vm,
                      fuzzyMatchComparatorEditModalProps.initialValue
                        .children[1],
                    ],
                  });
                  fuzzyMatchComparatorEditModalProps.onSave(astNode);
                  onOpenChange(false);
                }}
              />
            ) : null}
          </CopyPasteASTContextProvider>
        </ModalV2.Content>
      </FuzzyMatchComparatorEditModalContext.Provider>
    </ModalV2.Root>
  );
}

function FuzzyMatchComparatorEditModalContent({
  initialValue,
  onSave,
}: {
  initialValue: FuzzyMatchEditorNodeViewModel;
  onSave: (vm: FuzzyMatchEditorNodeViewModel) => void;
}) {
  const { t } = useTranslation(['scenarios', 'common']);
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();
  const [value, setValue] = useState<FuzzyMatchEditorNodeViewModel>(
    () => initialValue,
  );

  const handleSave = () => {
    onSave(value);
  };

  const options = useOperandOptions({ operandViewModel: value.children[0] });
  const leftOptions = useMemo(
    () => options.filter((option) => option.dataType === 'String'),
    [options],
  );
  const rightOptions = useMemo(
    () =>
      options.filter(
        (option) =>
          option.operandType === 'CustomList' ||
          option.dataType === 'String[]' ||
          option.dataType === 'String',
      ),
    [options],
  );

  const adaptEditableAstNode = useAdaptEditableAstNode();

  return (
    <>
      <ModalV2.Title>{t('scenarios:edit_fuzzy_match.title')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Operand
              operandViewModel={value.children[0]}
              onSave={(ast) =>
                setValue({
                  ...value,
                  errors: value.errors.filter(
                    (error) => error.argumentIndex !== 0,
                  ),
                  children: [
                    adaptEditorNodeViewModel({ ast, parent: value }),
                    value.children[1],
                  ],
                })
              }
              options={leftOptions}
            />
            <div className="border-grey-10 bg-grey-02 flex h-10 w-fit min-w-[40px] items-center justify-center rounded border p-2 text-center">
              <span className="text-s text-grey-100 font-medium">~</span>
            </div>
            <Operand
              operandViewModel={value.children[1]}
              onSave={(ast) => {
                const nextChild = adaptEditorNodeViewModel({
                  ast,
                  parent: value,
                });

                setValue({
                  ...value,
                  funcName:
                    // With lack of context, we assume that any non string operand is a list of strings (ex: we don't have dataType on CustomList)
                    adaptEditableAstNode(nextChild)?.dataType === 'String'
                      ? 'FuzzyMatch'
                      : 'FuzzyMatchAnyOf',
                  errors: value.errors.filter(
                    (error) => error.argumentIndex !== 1,
                  ),
                  children: [value.children[0], nextChild],
                });
              }}
              options={rightOptions}
            />
          </div>
          <EvaluationErrors
            errors={adaptEvaluationErrorViewModels([
              ...value.errors,
              ...value.children.flatMap((child) => child.errors),
            ]).map(getNodeEvaluationErrorMessage)}
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <label id="algorithm" className="text-s text-grey-100 font-normal">
            {t('scenarios:edit_fuzzy_match.algorithm.label')}
          </label>
          <div className="w-fit">
            <Operator
              aria-labelledby="algorithm"
              operators={fuzzyMatchAlgorithms}
              value={value.namedChildren.algorithm.constant}
              setValue={(fuzzyMatchAlgorithm) =>
                setValue({
                  ...value,
                  namedChildren: {
                    ...value.namedChildren,
                    algorithm: {
                      ...value.namedChildren.algorithm,
                      constant: fuzzyMatchAlgorithm,
                      errors: [],
                    },
                  },
                })
              }
              errors={value.namedChildren.algorithm.errors}
            />
          </div>
          <EvaluationErrors
            errors={adaptEvaluationErrorViewModels(
              value.namedChildren.algorithm.errors,
            ).map(getNodeEvaluationErrorMessage)}
          />
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close
            render={
              <Button className="flex-1" variant="secondary" name="cancel" />
            }
          >
            {t('common:cancel')}
          </ModalV2.Close>
          <Button
            className="flex-1"
            variant="primary"
            name="save"
            onClick={() => handleSave()}
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </>
  );
}
