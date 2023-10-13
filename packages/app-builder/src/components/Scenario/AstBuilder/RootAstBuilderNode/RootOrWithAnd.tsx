import { LogicalOperatorLabel } from '@app-builder/components/Scenario/AstBuilder/RootAstBuilderNode/LogicalOperator';
import {
  hasIndexError,
  NewAstNode,
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
import React from 'react';

import { ScenarioValidationError } from '../../ScenarioValidatioError';
import { AstBuilderNode } from '../AstBuilderNode/AstBuilderNode';
import { RemoveButton } from '../RemoveButton';
import { AddLogicalOperatorButton } from './AddLogicalOperatorButton';

export interface RootOrWithAndViewModel {
  orNodeId: string;
  orValidation: Validation;
  ands: {
    nodeId: string;
    validation: Validation;
    children: EditorNodeViewModel[];
  }[];
}

export function adaptRootOrWithAndViewModel(
  viewModel: EditorNodeViewModel
): RootOrWithAndViewModel | null {
  if (viewModel.funcName !== 'Or') {
    return null;
  }
  for (const child of viewModel.children) {
    if (child.funcName !== 'And') {
      return null;
    }
  }
  return {
    orNodeId: viewModel.nodeId,
    orValidation: viewModel.validation,
    ands: viewModel.children.map((andNode) => ({
      nodeId: andNode.nodeId,
      validation: andNode.validation,
      children: andNode.children,
    })),
  };
}

function NewAndChild() {
  return NewUndefinedAstNode({
    children: [NewUndefinedAstNode(), NewUndefinedAstNode()],
  });
}

function NewOrChild() {
  return NewAstNode({
    name: 'And',
    children: [NewAndChild()],
  });
}

export function RootOrWithAnd({
  builder,
  rootOrWithAndViewModel,
  viewOnly,
}: {
  builder: AstBuilder;
  rootOrWithAndViewModel: RootOrWithAndViewModel;
  viewOnly?: boolean;
}) {
  const getEvaluationErrorMessage = useGetOrAndNodeEvaluationErrorMessage();
  function appendOrChild() {
    builder.appendChild(rootOrWithAndViewModel.orNodeId, NewOrChild());
  }

  const [rootOrChildrenErrors, rootOrNonChildrenErrors] =
    separateChildrenErrors(rootOrWithAndViewModel.orValidation);

  return (
    <div className="flex flex-col gap-4">
      {rootOrWithAndViewModel.ands.map((andChild, childIndex) => {
        const isFirstChild = childIndex === 0;
        const [andChildrenErrors, andNonChildrenErrors] =
          separateChildrenErrors(andChild.validation);

        function appendAndChild() {
          builder.appendChild(andChild.nodeId, NewAndChild());
        }

        // if this is the last and child, remove the and from or operands
        function remove(nodeId: string) {
          builder.remove(
            andChild.children.length > 1 ? nodeId : andChild.nodeId
          );
        }

        const isFirstAndChild = isFirstChild && andChild.children.length === 0;

        return (
          <React.Fragment key={andChild.nodeId}>
            {!isFirstChild && (
              <div className="flex flex-row gap-1">
                <LogicalOperatorLabel
                  operator="or"
                  className="bg-grey-02 text-grey-25 uppercase"
                />
                <div className="flex flex-1 items-center">
                  <div className="bg-grey-10 h-[1px] w-full" />
                </div>
              </div>
            )}
            {andChild.children.map((child, childIndex) => {
              return (
                <div key={child.nodeId} className="flex flex-row gap-2">
                  <LogicalOperatorLabel
                    operator={childIndex === 0 ? 'if' : 'and'}
                    className={
                      hasIndexError(andChild.validation, childIndex)
                        ? 'border border-red-100 text-red-100'
                        : 'text-grey-25 border border-transparent'
                    }
                  />
                  <div className="flex flex-1">
                    <AstBuilderNode
                      builder={builder}
                      editorNodeViewModel={child}
                      viewOnly={viewOnly}
                    />
                  </div>
                  {!viewOnly && (
                    <div className="flex h-10 flex-col items-center justify-center">
                      <RemoveButton
                        onClick={() => {
                          remove(child.nodeId);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex flex-row flex-wrap gap-2">
              {!viewOnly && (
                <div className={clsx('my-1', !isFirstAndChild && 'ml-[50px]')}>
                  <AddLogicalOperatorButton
                    onClick={appendAndChild}
                    operator="and"
                  />
                </div>
              )}

              {andNonChildrenErrors.map((error, index) => (
                <ScenarioValidationError key={index}>
                  {getEvaluationErrorMessage(error)}
                </ScenarioValidationError>
              ))}
            </div>
          </React.Fragment>
        );
      })}

      <div className="flex flex-row flex-wrap gap-2">
        {!viewOnly && (
          <AddLogicalOperatorButton onClick={appendOrChild} operator="or" />
        )}

        {rootOrNonChildrenErrors.map((error, index) => (
          <ScenarioValidationError key={index}>
            {getEvaluationErrorMessage(error)}
          </ScenarioValidationError>
        ))}
      </div>
    </div>
  );
}
