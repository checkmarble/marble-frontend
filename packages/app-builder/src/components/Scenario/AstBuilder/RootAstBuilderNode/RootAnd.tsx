import { LogicalOperatorLabel } from '@app-builder/components/Scenario/AstBuilder/RootAstBuilderNode/LogicalOperator';
import {
  hasIndexError,
  NewUndefinedAstNode,
  separateChildrenErrors,
  type Validation,
} from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { useGetOrAndNodeEvaluationErrorMessage } from '@app-builder/services/validation';
import clsx from 'clsx';
import { Fragment } from 'react';

import { ScenarioValidationError } from '../../ScenarioValidatioError';
import { AstBuilderNode } from '../AstBuilderNode/AstBuilderNode';
import { RemoveButton } from '../RemoveButton';
import { AddLogicalOperatorButton } from './AddLogicalOperatorButton';

export interface RootAndViewModel {
  nodeId: string;
  validation: Validation;
  children: EditorNodeViewModel[];
}

export function adaptRootAndViewModel(
  viewModel: EditorNodeViewModel
): RootAndViewModel | null {
  if (viewModel.funcName !== 'And') {
    return null;
  }
  return {
    nodeId: viewModel.nodeId,
    validation: viewModel.validation,
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
  const [andChildrenErrors, andNonChildrenErrors] = separateChildrenErrors(
    rootAndViewModel.validation
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
      <div className="text-s grid grid-cols-[8px_16px_max-content_1fr]">
        <div className="text-s bg-grey-02 col-span-4 flex h-fit min-h-[40px] w-fit min-w-[40px] flex-wrap items-center justify-center gap-1 rounded p-2 font-semibold text-purple-100">
          {builder.triggerObjectTable.name}
        </div>
        {rootAndViewModel.children.map((child, childIndex) => {
          const isFirstCondition = childIndex === 0;
          const isLastCondition =
            childIndex === rootAndViewModel.children.length - 1;

          return (
            <Fragment key={`condition_${child.nodeId}`}>
              {/* Row 1 */}
              <div
                className={clsx(
                  'border-grey-10 col-span-4 w-2 border-r ',
                  isFirstCondition ? 'h-4' : 'h-2'
                )}
              />

              {/* Row 2 */}
              <div
                className={clsx(
                  'border-grey-10 border-r',
                  isLastCondition && 'h-5'
                )}
              />
              <div className="border-grey-10 h-5 border-b" />
              <LogicalOperatorLabel
                operator={isFirstCondition ? 'where' : 'and'}
                className={clsx(
                  'bg-grey-02 mr-2 border p-2',
                  hasIndexError(rootAndViewModel.validation, childIndex)
                    ? ' border-red-100 text-red-100'
                    : 'border-grey-02 text-grey-25'
                )}
              />

              <div className="flex items-center gap-2">
                <div className="flex flex-1 flex-col">
                  <AstBuilderNode
                    builder={builder}
                    editorNodeViewModel={child}
                    viewOnly={viewOnly}
                  />
                </div>
                {!viewOnly && (
                  <RemoveButton
                    className="peer"
                    onClick={() => {
                      builder.remove(child.nodeId);
                    }}
                  />
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        {!viewOnly && (
          <AddLogicalOperatorButton onClick={appendAndChild} operator="and" />
        )}

        {andNonChildrenErrors.map((error, index) => (
          <ScenarioValidationError key={index}>
            {getEvaluationErrorMessage(error)}
          </ScenarioValidationError>
        ))}
      </div>
    </>
  );
}
