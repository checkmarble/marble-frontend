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
import clsx from 'clsx';
import { Fragment } from 'react';

import { EvaluationErrors } from '../../ScenarioValidationError';
import { AstBuilderNode } from '../AstBuilderNode/AstBuilderNode';
import { computeLineErrors } from '../AstBuilderNode/TwoOperandsLine';
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
  const { nodeErrors: andNodeErrors } = separateChildrenErrors(
    rootAndViewModel.errors,
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
        <div className="text-s bg-grey-02 col-span-5 flex size-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-1 rounded p-2 font-semibold text-purple-100">
          {builder.input.triggerObjectTable.name}
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
                  'border-grey-10 col-span-5 w-2 border-r ',
                  isFirstCondition ? 'h-4' : 'h-2',
                )}
              />

              {/* Row 2 */}
              <div
                className={clsx(
                  'border-grey-10 col-start-1 border-r',
                  isLastCondition && 'h-5',
                )}
              />
              <div className="border-grey-10 col-start-2 h-5 border-b" />
              <LogicalOperatorLabel
                operator={isFirstCondition ? 'where' : 'and'}
                className={clsx(
                  'bg-grey-02 col-start-3 border p-2',
                  hasArgumentIndexErrorsFromParent(child)
                    ? ' border-red-100 text-red-100'
                    : 'border-grey-02 text-grey-25',
                )}
              />

              <div className="col-start-4 flex flex-col gap-2 px-2">
                <AstBuilderNode
                  builder={builder}
                  editorNodeViewModel={child}
                  viewOnly={viewOnly}
                  root
                />
                <EvaluationErrors
                  evaluationErrors={[
                    ...computeLineErrors(child),
                    ...findArgumentIndexErrorsFromParent(child),
                  ]}
                />
              </div>
              {!viewOnly ? (
                <div className="col-start-5 flex h-10 flex-col items-center justify-center">
                  <RemoveButton
                    onClick={() => {
                      builder.remove(child.nodeId);
                    }}
                  />
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>

      <div className="flex flex-row flex-wrap gap-2">
        {!viewOnly ? (
          <AddLogicalOperatorButton onClick={appendAndChild} operator="and" />
        ) : null}

        <EvaluationErrors evaluationErrors={andNodeErrors} />
      </div>
    </>
  );
}
