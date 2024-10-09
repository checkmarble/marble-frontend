import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import {
  type AstNode,
  NewFuzzyMatchComparatorAstNode,
} from '@app-builder/models';
import {
  adaptAstNodeFromViewModel,
  type FuzzyMatchComparatorAstNodeViewModel,
} from '@app-builder/models/ast-node-view-model';
import {
  type FuzzyMatchAlgorithm,
  isEditableFuzzyMatchAlgorithm,
} from '@app-builder/models/fuzzy-match';
import { fuzzyMatchingDocHref } from '@app-builder/services/documentation-href';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { type ParseKeys } from 'i18next';
import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, ModalV2 } from 'ui-design-system';

import { Operand } from '../Operand';
import { EditAlgorithm } from './EditAlgorithm';
import { EditLevel } from './EditLevel';
import { EditThreshold } from './EditThreshold';
import {
  useFuzzyMatchComparatorEditState,
  useLeftOptions,
  useRightOptions,
} from './FuzzyMatchComparatorEdit.hook';

export interface FuzzyMatchComparatorEditModalProps {
  initialValue: FuzzyMatchComparatorAstNodeViewModel;
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
                initialFuzzyMatchComparatorAstNodeViewModel={
                  fuzzyMatchComparatorEditModalProps.initialValue
                }
                onSave={(astNode: AstNode) => {
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
  initialFuzzyMatchComparatorAstNodeViewModel,
  onSave,
}: {
  initialFuzzyMatchComparatorAstNodeViewModel: FuzzyMatchComparatorAstNodeViewModel;
  onSave: (astNode: AstNode) => void;
}) {
  const { t } = useTranslation(['scenarios', 'common']);
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();

  const {
    algorithm,
    setAlgorithm,
    threshold,
    left,
    setLevel,
    setThreshold,
    setLeft,
    right,
    setRight,
    funcName,
    errors,
  } = useFuzzyMatchComparatorEditState(
    initialFuzzyMatchComparatorAstNodeViewModel,
  );

  const leftOptions = useLeftOptions(
    initialFuzzyMatchComparatorAstNodeViewModel,
  );
  const rightOptions = useRightOptions(
    initialFuzzyMatchComparatorAstNodeViewModel,
  );

  const handleSave = () => {
    const fuzzyMatchComparatorAstNode = NewFuzzyMatchComparatorAstNode({
      funcName,
      left: adaptAstNodeFromViewModel(left),
      right: adaptAstNodeFromViewModel(right),
      algorithm: algorithm.value,
      threshold: threshold.value,
    });
    onSave(fuzzyMatchComparatorAstNode);
  };

  return (
    <>
      <ModalV2.Title>{t('scenarios:edit_fuzzy_match.title')}</ModalV2.Title>
      <div className="flex flex-col gap-9 p-6">
        <Callout variant="outlined">
          <ModalV2.Description>
            <Trans
              t={t}
              i18nKey="scenarios:edit_fuzzy_match.description"
              components={{
                DocLink: <ExternalLink href={fuzzyMatchingDocHref} />,
              }}
            />
          </ModalV2.Description>
        </Callout>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4">
            <EditAlgorithm
              algorithm={algorithm.value}
              setAlgorithm={setAlgorithm}
              errors={algorithm.errors}
            />
            {threshold.mode === 'level' ? (
              <EditLevel
                level={threshold.level}
                setLevel={setLevel}
                errors={threshold.errors}
              />
            ) : (
              <EditThreshold
                threshold={threshold.value}
                setThreshold={setThreshold}
                errors={threshold.errors}
              />
            )}
          </div>
          <Examples algorithm={algorithm.value} threshold={threshold.value} />
        </div>
        <div className="flex flex-col gap-2">
          <p id="level" className="text-m text-grey-100 font-normal">
            {t('scenarios:edit_fuzzy_match.operands.label')}
          </p>
          <div className="flex gap-2">
            <Operand astNodeVM={left} onSave={setLeft} options={leftOptions} />
            <div className="border-grey-10 bg-grey-02 flex h-10 w-fit min-w-[40px] items-center justify-center rounded border p-2 text-center">
              <span className="text-s text-grey-100 font-medium">
                {t(funcNameTKeys[funcName])}
              </span>
            </div>
            <Operand
              astNodeVM={right}
              onSave={setRight}
              options={rightOptions}
            />
          </div>
          <EvaluationErrors
            errors={adaptEvaluationErrorViewModels(errors).map(
              getNodeEvaluationErrorMessage,
            )}
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

const funcNameTKeys = {
  FuzzyMatch: 'scenarios:edit_fuzzy_match.fuzzy_match',
  FuzzyMatchAnyOf: 'scenarios:edit_fuzzy_match.fuzzy_match_any_of',
} satisfies Record<
  ReturnType<typeof useFuzzyMatchComparatorEditState>['funcName'],
  ParseKeys<['scenarios']>
>;

function Examples({
  algorithm,
  threshold,
}: {
  algorithm: FuzzyMatchAlgorithm;
  threshold: number;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  if (!isEditableFuzzyMatchAlgorithm(algorithm)) return null;

  return (
    <table className="border-grey-10 table-auto border-collapse border">
      <caption className="sr-only">
        {t('scenarios:edit_fuzzy_match.examples.caption')}
      </caption>
      <thead>
        <tr>
          <th className="text-grey-100 bg-grey-02 border-grey-10 border px-2 text-left text-xs font-normal capitalize">
            {t('scenarios:edit_fuzzy_match.examples.left')}
          </th>
          <th className="text-grey-100 bg-grey-02 border-grey-10 border px-2 text-left text-xs font-normal capitalize">
            {t('scenarios:edit_fuzzy_match.examples.right')}
          </th>
          <th className="text-grey-100 bg-grey-02 border-grey-10 border px-2 text-left text-xs font-normal capitalize">
            {t('scenarios:edit_fuzzy_match.examples.result')}
          </th>
        </tr>
      </thead>
      <tbody>
        {[
          {
            left: 'Mr Mrs John Jane OR Doe Smith',
            right: 'John Doe',
            score: {
              ratio: 43,
              token_set_ratio: 100,
            },
          },
          {
            left: 'the dog was walking on the sidewalk',
            right: "the d og as walkin' on the side alk",
            score: {
              ratio: 91,
              token_set_ratio: 72,
            },
          },
        ].map(({ left, right, score }) => (
          <tr key={`${left}-${right}`}>
            <td className="text-grey-100 border-grey-10 border px-2 text-xs font-normal">
              {left}
            </td>
            <td className="text-grey-100 border-grey-10 border px-2 text-xs font-normal">
              {right}
            </td>
            <td className="text-grey-100 border-grey-10 border px-2 text-xs font-normal">
              {t(`common:${score[algorithm] > threshold}`)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
