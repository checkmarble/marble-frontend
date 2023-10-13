import { LogicalOperatorLabel } from '@app-builder/components/Scenario/AstBuilder/RootAstBuilderNode/LogicalOperator';
import {
  NewAstNode,
  NewUndefinedAstNode,
  separateChildrenErrors,
  type Validation,
} from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import clsx from 'clsx';
import React from 'react';

import { ScenarioValidationError } from '../../ScenarioValidatioError';
import { AstBuilderNode } from '../AstBuilderNode/AstBuilderNode';
import { useGetNodeEvaluationErrorMessage } from '../ErrorMessage';
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
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();
  function appendOrChild() {
    builder.appendChild(rootOrWithAndViewModel.orNodeId, NewOrChild());
  }

  const [rootOrChildrenErrors, rootOrNonChildrenErrors] =
    separateChildrenErrors(rootOrWithAndViewModel.orValidation);

  return (
    <div className="flex flex-col gap-2">
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
                  className="bg-grey-02 uppercase"
                  color={rootOrChildrenErrors.length > 0 ? 'red' : 'grey'}
                />
                <div className="flex flex-1 items-center">
                  <div className="bg-grey-10 h-[1px] w-full" />
                </div>
              </div>
            )}
            {andChild.children.map((child, childIndex) => {
              return (
                <div
                  key={child.nodeId}
                  className="flex flex-row-reverse items-center gap-2"
                >
                  {!viewOnly && (
                    <RemoveButton
                      className="peer"
                      onClick={() => {
                        remove(child.nodeId);
                      }}
                    />
                  )}
                  <div className="peer-hover:border-grey-25 flex flex-1 flex-col rounded border border-transparent p-1 transition-colors duration-200 ease-in-out">
                    <AstBuilderNode
                      builder={builder}
                      editorNodeViewModel={child}
                      viewOnly={viewOnly}
                    />
                  </div>
                  <LogicalOperatorLabel
                    operator={childIndex === 0 ? 'if' : 'and'}
                    color={andChildrenErrors.length > 0 ? 'red' : 'grey'}
                  />
                </div>
              );
            })}

            {!viewOnly && (
              <div className={clsx('my-1', !isFirstAndChild && 'ml-[50px]')}>
                <AddLogicalOperatorButton
                  onClick={appendAndChild}
                  operator="and"
                />
              </div>
            )}

            <div className="flex flex-row flex-wrap gap-2">
              {andNonChildrenErrors.map((error, index) => (
                <ScenarioValidationError key={index}>
                  {getNodeEvaluationErrorMessage(error)}
                </ScenarioValidationError>
              ))}
            </div>
          </React.Fragment>
        );
      })}
      {!viewOnly && (
        <AddLogicalOperatorButton onClick={appendOrChild} operator="or" />
      )}

      <div className="flex flex-row flex-wrap gap-2">
        {rootOrNonChildrenErrors.map((error, index) => (
          <ScenarioValidationError key={index}>
            {getNodeEvaluationErrorMessage(error)}
          </ScenarioValidationError>
        ))}
      </div>
    </div>
  );
}
