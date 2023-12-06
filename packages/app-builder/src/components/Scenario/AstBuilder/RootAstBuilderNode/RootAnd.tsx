import { LogicalOperatorLabel } from '@app-builder/components/Scenario/AstBuilder/RootAstBuilderNode/LogicalOperator';
import {
  type EvaluationError,
  NewUndefinedAstNode,
  separateChildrenErrors,
} from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
  findArgumentIndexErrorsFromParent,
  hasArgumentIndexErrorsFromParent,
} from '@app-builder/services/editor/ast-editor';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
  useGetOrAndNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import clsx from 'clsx';
import { Fragment } from 'react';

import { ScenarioValidationError } from '../../ScenarioValidationError';
import { AstBuilderNode } from '../AstBuilderNode/AstBuilderNode';
import { computeLineErrors } from '../AstBuilderNode/TwoOperandsLine/TwoOperandsLine';
import { RemoveButton } from '../RemoveButton';
import { AddLogicalOperatorButton } from './AddLogicalOperatorButton';

export interface RootAndViewModel {
  nodeId: string;
  errors: EvaluationError[];
  children: EditorNodeViewModel[];
}

export function adaptRootAndViewModel(
  viewModel: EditorNodeViewModel,
): RootAndViewModel | null {
  if (viewModel.funcName !== 'And') {
    return null;
  }
  return {
    nodeId: viewModel.nodeId,
    errors: viewModel.errors,
    children: viewModel.children,
  };
}

function NewAndChild() {
  return NewUndefinedAstNode({
    children: [NewUndefinedAstNode(), NewUndefinedAstNode()],
  });
}

/**
 * Design is opinionated: it assumes a RootAnd is used for trigger condition.
 */
export function RootAnd({
  builder,
  rootAndViewModel,
  viewOnly,
}: {
  builder: AstBuilder;
  rootAndViewModel: RootAndViewModel;
  viewOnly?: boolean;
}) {
  const getEvaluationErrorMessage = useGetOrAndNodeEvaluationErrorMessage();
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();
  const { nodeErrors: andNodeErrors } = separateChildrenErrors(
    rootAndViewModel.errors,
  );

  const andErrorMessages = adaptEvaluationErrorViewModels(andNodeErrors).map(
    getEvaluationErrorMessage,
  );

  function appendAndChild() {
    builder.appendChild(rootAndViewModel.nodeId, NewAndChild());
  }

  /**
   * 1. Idea of the layout
   *
   *    Transaction
   *        |-> Where <Formula condition={condition.children[0]} />
   *        |-> And   <Formula condition={condition.children[1]} />
   *        |-> And   <Formula condition={condition.children[2]} />
   *        + And
   *
   * 2. Detail of the map
   *
   *  Row1: |
   *  Row2: |-> And   <Formula condition={condition.children[1]} />
   *
   */
  return (
    <>
      <div className="text-s grid grid-cols-[8px_16px_max-content_1fr_max-content]">
        <div className="text-s bg-grey-02 col-span-4 flex h-fit min-h-[40px] w-fit min-w-[40px] flex-wrap items-center justify-center gap-1 rounded p-2 font-semibold text-purple-100">
          {builder.input.triggerObjectTable.name}
        </div>
        {rootAndViewModel.children.map((child, childIndex) => {
          const isFirstCondition = childIndex === 0;
          const isLastCondition =
            childIndex === rootAndViewModel.children.length - 1;

          const errorMessages = adaptEvaluationErrorViewModels([
            ...computeLineErrors(child),
            ...findArgumentIndexErrorsFromParent(child),
          ]).map((error) => getNodeEvaluationErrorMessage(error));

          return (
            <Fragment key={`condition_${child.nodeId}`}>
              {/* Row 1 */}
              <div
                className={clsx(
                  'border-grey-10 col-span-5 w-2 border-r ',
                  isFirstCondition ? 'h-4' : 'h-2',
                )}
              />

              {/* Row 2 */}
              <div
                className={clsx(
                  'border-grey-10  border-r',
                  isLastCondition && 'h-5',
                )}
              />
              <div className="border-grey-10  h-5 border-b" />
              <LogicalOperatorLabel
                operator={isFirstCondition ? 'where' : 'and'}
                className={clsx(
                  'bg-grey-02 border p-2',
                  hasArgumentIndexErrorsFromParent(child)
                    ? ' border-red-100 text-red-100'
                    : 'border-grey-02 text-grey-25',
                )}
              />

              <div className="grid grid-cols-[1fr_30px] gap-2 pl-2">
                <AstBuilderNode
                  builder={builder}
                  editorNodeViewModel={child}
                  viewOnly={viewOnly}
                  root
                />
                {!viewOnly ? (
                  <div className="flex h-10 flex-col items-center justify-center">
                    <RemoveButton
                      onClick={() => {
                        builder.remove(child.nodeId);
                      }}
                    />
                  </div>
                ) : null}
                <div className="flex flex-row flex-wrap gap-2">
                  {errorMessages.map((error) => (
                    <ScenarioValidationError key={error}>
                      {error}
                    </ScenarioValidationError>
                  ))}
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>

      <div className="flex flex-row flex-wrap gap-2">
        {!viewOnly ? (
          <AddLogicalOperatorButton onClick={appendAndChild} operator="and" />
        ) : null}
        {andErrorMessages.map((error) => (
          <ScenarioValidationError key={error}>{error}</ScenarioValidationError>
        ))}
      </div>
    </>
  );
}
