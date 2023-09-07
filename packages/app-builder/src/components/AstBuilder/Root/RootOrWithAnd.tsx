import { LogicalOperatorLabel } from '@app-builder/components/Scenario/LogicalOperator';
import {
  NewAstNode,
  NewUndefinedAstNode,
  type Validation,
} from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import clsx from 'clsx';
import React from 'react';

import { AstBuilderNode } from '../AstBuilderNode';
import { AddLogicalOperatorButton } from './AddLogicalOperatorButton';
import { RemoveButton } from './RemoveButton';

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
}: {
  builder: AstBuilder;
  rootOrWithAndViewModel: RootOrWithAndViewModel;
}) {
  function appendOrChild() {
    builder.appendChild(rootOrWithAndViewModel.orNodeId, NewOrChild());
  }

  return (
    <div className="flex flex-col gap-2">
      {rootOrWithAndViewModel.ands.map((andChild, childIndex) => {
        const isFirstChild = childIndex === 0;

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
                  <RemoveButton
                    className="peer"
                    onClick={() => {
                      remove(child.nodeId);
                    }}
                  />
                  <div className="peer-hover:border-grey-25 flex flex-1 flex-col rounded border border-transparent p-1 transition-colors duration-200 ease-in-out">
                    <AstBuilderNode
                      builder={builder}
                      editorNodeViewModel={child}
                    />
                  </div>
                  <LogicalOperatorLabel
                    operator={childIndex === 0 ? 'if' : 'and'}
                  />
                </div>
              );
            })}

            <div className={clsx('my-1', !isFirstAndChild && 'ml-[50px]')}>
              <AddLogicalOperatorButton
                onClick={appendAndChild}
                operator="and"
              />
            </div>
          </React.Fragment>
        );
      })}
      <AddLogicalOperatorButton onClick={appendOrChild} operator="or" />
    </div>
  );
}
